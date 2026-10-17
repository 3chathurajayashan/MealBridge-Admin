import React, { useCallback, useEffect, useMemo, useState } from "react";

const API_URL = "http://localhost:5001/api/foodrequests";

const STATUS_OPTIONS = ["PENDING", "ACCEPTED", "REJECTED", "CANCELLED"];

const statusStyles = {
  PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
  ACCEPTED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  REJECTED: "bg-rose-50 text-rose-700 ring-rose-200",
  CANCELLED: "bg-slate-100 text-slate-600 ring-slate-200",
};

const formatDate = (date) => {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleString("en-LK", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const getId = (value) => {
  if (!value) return "";
  return typeof value === "object" ? value._id || "" : value;
};

const getErrorMessage = async (response) => {
  try {
    const data = await response.json();
    return data.message || data.error || "Something went wrong.";
  } catch {
    return "Unable to process the server response.";
  }
};

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
        statusStyles[status] || "bg-gray-100 text-gray-600 ring-gray-200"
      }`}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
      {status || "UNKNOWN"}
    </span>
  );
}

function StatCard({ label, value, description, icon, accent }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
            {value}
          </p>
          <p className="mt-2 text-xs text-gray-500">{description}</p>
        </div>
        <div className={`rounded-xl p-3 ${accent}`}>
          <span className="text-xl">{icon}</span>
        </div>
      </div>
    </div>
  );
}

function Receipients() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("newest");

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [editQuantity, setEditQuantity] = useState("");
  const [editMessage, setEditMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const [busyRequestId, setBusyRequestId] = useState(null);

  const getToken = () => localStorage.getItem("mealbridge-admin-token");

  const apiRequest = async (path, options = {}) => {
    const token = getToken();

    if (!token) {
      throw new Error(
        "Admin authentication token not found. Please sign in again.",
      );
    }

    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(await getErrorMessage(response));
    }

    return response.json();
  };

  const fetchRequests = useCallback(async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const data = await apiRequest("/admin/all");

      if (!data.success) {
        throw new Error(data.message || "Failed to load food requests.");
      }

      setRequests(Array.isArray(data.requests) ? data.requests : []);
    } catch (err) {
      setError(err.message || "Unable to load food requests.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...requests]
      .filter((request) => {
        if (statusFilter !== "ALL" && request.status !== statusFilter) {
          return false;
        }

        if (!query) return true;

        const recipient = request.recipient || {};
        const donation =
          request.donation && typeof request.donation === "object"
            ? request.donation
            : {};
        const donor =
          donation.donor && typeof donation.donor === "object"
            ? donation.donor
            : {};

        const searchable = [
          request._id,
          recipient.fullName,
          recipient.email,
          recipient.phoneNumber,
          donation.foodName,
          donation.category,
          donor.fullName,
          donor.email,
          request.message,
          request.status,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchable.includes(query);
      })
      .sort((a, b) => {
        const first = new Date(a.createdAt || 0).getTime();
        const second = new Date(b.createdAt || 0).getTime();

        return sortOrder === "newest" ? second - first : first - second;
      });
  }, [requests, search, statusFilter, sortOrder]);

  const stats = useMemo(() => {
    return {
      total: requests.length,
      pending: requests.filter((r) => r.status === "PENDING").length,
      accepted: requests.filter((r) => r.status === "ACCEPTED").length,
      rejected: requests.filter(
        (r) => r.status === "REJECTED" || r.status === "CANCELLED",
      ).length,
    };
  }, [requests]);

  const showNotice = (type, message) => {
    setNotice({ type, message });
    window.setTimeout(() => setNotice(null), 4000);
  };

  const openEdit = (request) => {
    setSelectedRequest(request);
    setEditQuantity(String(request.quantityRequested ?? ""));
    setEditMessage(request.message || "");
  };

  const closeEdit = () => {
    if (saving) return;

    setSelectedRequest(null);
    setEditQuantity("");
    setEditMessage("");
  };

  const handleEdit = async (event) => {
    event.preventDefault();

    if (!selectedRequest) return;

    const quantity = Number(editQuantity);

    if (!Number.isInteger(quantity) || quantity < 1) {
      showNotice("error", "Quantity must be a positive whole number.");
      return;
    }

    setSaving(true);

    try {
      const data = await apiRequest(
        `/admin/${encodeURIComponent(selectedRequest._id)}`,
        {
          method: "PUT",
          body: JSON.stringify({
            quantityRequested: quantity,
            message: editMessage,
          }),
        },
      );

      setRequests((previous) =>
        previous.map((request) =>
          request._id === selectedRequest._id
            ? { ...request, ...data.request }
            : request,
        ),
      );

      setSelectedRequest(null);
      showNotice("success", data.message || "Request updated successfully.");
    } catch (err) {
      showNotice("error", err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (request, status) => {
    const actionText = status.toLowerCase();

    if (
      !window.confirm(
        `Are you sure you want to ${actionText} this food request?`,
      )
    ) {
      return;
    }

    setBusyRequestId(request._id);

    try {
      const data = await apiRequest(
        `/admin/${encodeURIComponent(request._id)}/status`,
        {
          method: "PUT",
          body: JSON.stringify({ status }),
        },
      );

      // Refresh to capture other pending requests rejected automatically
      // when a donation is accepted.
      await fetchRequests(true);

      showNotice(
        "success",
        data.message || `Request ${actionText} successfully.`,
      );
    } catch (err) {
      showNotice("error", err.message);
    } finally {
      setBusyRequestId(null);
    }
  };

  const handleDelete = async (request) => {
    const donationName = request.donation?.foodName || "this food request";

    if (
      !window.confirm(
        `Permanently delete the request for "${donationName}"?\n\nThis action cannot be undone.`,
      )
    ) {
      return;
    }

    setBusyRequestId(request._id);

    try {
      const data = await apiRequest(
        `/admin/${encodeURIComponent(request._id)}`,
        { method: "DELETE" },
      );

      setRequests((previous) =>
        previous.filter((item) => item._id !== request._id),
      );

      showNotice("success", data.message || "Request deleted successfully.");
    } catch (err) {
      showNotice("error", err.message);
    } finally {
      setBusyRequestId(null);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setSortOrder("newest");
  };

  return (
    <div className="min-h-screen bg-gray-50/80 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px] space-y-7">
        {/* Page heading */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
              <span>MealBridge</span>
              <span>/</span>
              <span>Administration</span>
              <span>/</span>
              <span className="font-medium text-emerald-700">
                Food Requests
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Food Requests
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
              Manage recipient requests, review donations, update request
              details, and monitor the approval process.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchRequests(true)}
            disabled={refreshing || loading}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 sm:self-center"
          >
            <span className={refreshing ? "animate-spin" : ""}>↻</span>
            {refreshing ? "Refreshing..." : "Refresh data"}
          </button>
        </div>

        {/* Notifications */}
        {notice && (
          <div
            role="status"
            className={`flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${
              notice.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-rose-200 bg-rose-50 text-rose-800"
            }`}
          >
            <span>{notice.message}</span>
            <button
              type="button"
              onClick={() => setNotice(null)}
              className="font-bold"
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        )}

        {error && (
          <div className="flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-rose-800">
                Unable to load food requests
              </p>
              <p className="mt-1 text-sm text-rose-700">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => fetchRequests()}
              className="rounded-lg bg-rose-700 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-800"
            >
              Try again
            </button>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total requests"
            value={stats.total}
            description="All requests in the database"
            icon="◫"
            accent="bg-blue-50 text-blue-700"
          />
          <StatCard
            label="Pending review"
            value={stats.pending}
            description="Awaiting a decision"
            icon="◷"
            accent="bg-amber-50 text-amber-700"
          />
          <StatCard
            label="Accepted"
            value={stats.accepted}
            description="Approved food requests"
            icon="✓"
            accent="bg-emerald-50 text-emerald-700"
          />
          <StatCard
            label="Rejected / cancelled"
            value={stats.rejected}
            description="Requests not proceeding"
            icon="⊘"
            accent="bg-rose-50 text-rose-700"
          />
        </div>

        {/* Filters */}
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-5 sm:p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  All food requests
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {filteredRequests.length} of {requests.length} requests shown
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:flex">
                <div className="relative sm:col-span-2 xl:w-80">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    ⌕
                  </span>
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search recipient, food, donor..."
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-emerald-500"
                  aria-label="Filter by status"
                >
                  <option value="ALL">All statuses</option>
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>

                <select
                  value={sortOrder}
                  onChange={(event) => setSortOrder(event.target.value)}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-emerald-500"
                  aria-label="Sort requests"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                </select>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex min-h-72 flex-col items-center justify-center gap-3 p-8">
              <div className="h-9 w-9 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />
              <p className="text-sm text-gray-500">Loading food requests...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-3xl">
                ♧
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {requests.length === 0
                  ? "No food requests yet"
                  : "No matching requests"}
              </h3>
              <p className="mt-2 max-w-md text-sm text-gray-500">
                {requests.length === 0
                  ? "Requests submitted by recipients will appear here."
                  : "Try a different search term or reset your filters."}
              </p>
              {requests.length > 0 && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-4 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto xl:block">
                <table className="w-full min-w-[1150px] text-left">
                  <thead className="bg-gray-50/80">
                    <tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      <th className="px-5 py-4">Recipient</th>
                      <th className="px-5 py-4">Donation / Donor</th>
                      <th className="px-5 py-4">Quantity</th>
                      <th className="px-5 py-4">Request details</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4">Submitted</th>
                      <th className="px-5 py-4">Operations</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {filteredRequests.map((request) => {
                      const recipient = request.recipient || {};
                      const donation =
                        request.donation && typeof request.donation === "object"
                          ? request.donation
                          : {};
                      const donor =
                        donation.donor && typeof donation.donor === "object"
                          ? donation.donor
                          : {};
                      const busy = busyRequestId === request._id;

                      return (
                        <tr
                          key={request._id}
                          className="align-top transition hover:bg-gray-50/70"
                        >
                          <td className="px-5 py-5">
                            <div className="min-w-44">
                              <p className="font-semibold text-gray-900">
                                {recipient.fullName || "Unknown recipient"}
                              </p>
                              <p className="mt-1 text-sm text-gray-500">
                                {recipient.email || "No email"}
                              </p>
                              <p className="mt-1 text-xs text-gray-400">
                                {recipient.phoneNumber || "No phone number"}
                              </p>
                              {recipient.address && (
                                <p className="mt-2 max-w-52 text-xs leading-5 text-gray-500">
                                  {recipient.address}
                                </p>
                              )}
                            </div>
                          </td>

                          <td className="px-5 py-5">
                            <div className="min-w-44">
                              <p className="font-semibold text-gray-900">
                                {donation.foodName || "Donation unavailable"}
                              </p>
                              <p className="mt-1 text-sm text-gray-500">
                                {donation.category || "Uncategorized"}
                              </p>
                              <p className="mt-2 text-xs text-gray-500">
                                Donor: {donor.fullName || "Unknown donor"}
                              </p>
                              {donor.email && (
                                <p className="mt-1 text-xs text-gray-400">
                                  {donor.email}
                                </p>
                              )}
                              <p className="mt-2 text-xs text-gray-500">
                                Donation status: {donation.status || "—"}
                              </p>
                            </div>
                          </td>

                          <td className="px-5 py-5">
                            <p className="font-bold text-gray-900">
                              {request.quantityRequested ?? "—"}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              {donation.quantityUnit || "units"}
                            </p>
                            {donation.quantity != null && (
                              <p className="mt-2 text-xs text-gray-400">
                                Available: {donation.quantity}
                              </p>
                            )}
                          </td>

                          <td className="px-5 py-5">
                            <p className="max-w-48 whitespace-pre-wrap break-words text-sm text-gray-600">
                              {request.message || "No message provided"}
                            </p>
                            <p className="mt-2 max-w-48 break-all text-xs text-gray-400">
                              ID: {request._id}
                            </p>
                          </td>

                          <td className="px-5 py-5">
                            <StatusBadge status={request.status} />
                            {request.respondedAt && (
                              <p className="mt-2 text-xs text-gray-400">
                                Responded: {formatDate(request.respondedAt)}
                              </p>
                            )}
                          </td>

                          <td className="whitespace-nowrap px-5 py-5 text-sm text-gray-500">
                            {formatDate(request.createdAt)}
                          </td>

                          <td className="px-5 py-5">
                            <div className="flex min-w-36 flex-col items-start gap-2">
                              {request.status === "PENDING" && (
                                <>
                                  <button
                                    type="button"
                                    disabled={busy}
                                    onClick={() => openEdit(request)}
                                    className="text-sm font-semibold text-blue-700 hover:text-blue-900 disabled:opacity-50"
                                  >
                                    Edit details
                                  </button>
                                  <button
                                    type="button"
                                    disabled={busy}
                                    onClick={() =>
                                      handleStatusChange(request, "ACCEPTED")
                                    }
                                    className="text-sm font-semibold text-emerald-700 hover:text-emerald-900 disabled:opacity-50"
                                  >
                                    {busy ? "Processing..." : "✓ Accept"}
                                  </button>
                                  <button
                                    type="button"
                                    disabled={busy}
                                    onClick={() =>
                                      handleStatusChange(request, "REJECTED")
                                    }
                                    className="text-sm font-semibold text-rose-700 hover:text-rose-900 disabled:opacity-50"
                                  >
                                    ✕ Reject
                                  </button>
                                  <button
                                    type="button"
                                    disabled={busy}
                                    onClick={() =>
                                      handleStatusChange(request, "CANCELLED")
                                    }
                                    className="text-sm font-semibold text-gray-600 hover:text-gray-900 disabled:opacity-50"
                                  >
                                    Cancel request
                                  </button>
                                </>
                              )}

                              {request.status !== "PENDING" && (
                                <span className="text-xs text-gray-400">
                                  Status is final in this workflow
                                </span>
                              )}

                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => handleDelete(request)}
                                className="mt-1 text-sm font-semibold text-rose-700 hover:text-rose-900 disabled:opacity-50"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Responsive cards for smaller screens */}
              <div className="grid grid-cols-1 gap-4 bg-gray-50/60 p-4 md:grid-cols-2 xl:hidden">
                {filteredRequests.map((request) => {
                  const recipient = request.recipient || {};
                  const donation =
                    request.donation && typeof request.donation === "object"
                      ? request.donation
                      : {};
                  const donor =
                    donation.donor && typeof donation.donor === "object"
                      ? donation.donor
                      : {};
                  const busy = busyRequestId === request._id;

                  return (
                    <article
                      key={request._id}
                      className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3 border-b border-gray-100 p-4">
                        <div className="min-w-0">
                          <p className="truncate font-bold text-gray-900">
                            {donation.foodName || "Donation unavailable"}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {donation.category || "Uncategorized"}
                          </p>
                        </div>
                        <StatusBadge status={request.status} />
                      </div>

                      <div className="space-y-4 p-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                            Recipient
                          </p>
                          <p className="mt-1 font-semibold text-gray-900">
                            {recipient.fullName || "Unknown recipient"}
                          </p>
                          <p className="mt-1 break-all text-sm text-gray-500">
                            {recipient.email || "No email"}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            {recipient.phoneNumber || "No phone number"}
                          </p>
                          {recipient.address && (
                            <p className="mt-1 text-sm text-gray-500">
                              {recipient.address}
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-xl bg-gray-50 p-3">
                            <p className="text-xs text-gray-500">
                              Requested quantity
                            </p>
                            <p className="mt-1 font-bold text-gray-900">
                              {request.quantityRequested ?? "—"}{" "}
                              {donation.quantityUnit || "units"}
                            </p>
                          </div>
                          <div className="rounded-xl bg-gray-50 p-3">
                            <p className="text-xs text-gray-500">Donor</p>
                            <p className="mt-1 truncate font-semibold text-gray-900">
                              {donor.fullName || "Unknown donor"}
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                            Message
                          </p>
                          <p className="mt-1 whitespace-pre-wrap break-words text-sm text-gray-600">
                            {request.message || "No message provided"}
                          </p>
                        </div>

                        <div className="text-xs text-gray-500">
                          <p>Request ID: {request._id}</p>
                          <p className="mt-1">
                            Submitted: {formatDate(request.createdAt)}
                          </p>
                          {request.respondedAt && (
                            <p className="mt-1">
                              Responded: {formatDate(request.respondedAt)}
                            </p>
                          )}
                          <p className="mt-1">
                            Donation status: {donation.status || "—"}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 border-t border-gray-100 pt-4">
                          {request.status === "PENDING" && (
                            <>
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => openEdit(request)}
                                className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() =>
                                  handleStatusChange(request, "ACCEPTED")
                                }
                                className="rounded-lg bg-emerald-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                              >
                                Accept
                              </button>
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() =>
                                  handleStatusChange(request, "REJECTED")
                                }
                                className="rounded-lg border border-rose-200 px-3 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                              >
                                Reject
                              </button>
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() =>
                                  handleStatusChange(request, "CANCELLED")
                                }
                                className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                              >
                                Cancel
                              </button>
                            </>
                          )}

                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => handleDelete(request)}
                            className="col-span-2 rounded-lg border border-rose-200 px-3 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                          >
                            {busy ? "Processing..." : "Delete request"}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}

          <div className="flex flex-col gap-2 border-t border-gray-100 bg-white px-5 py-4 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Showing {filteredRequests.length} request
              {filteredRequests.length === 1 ? "" : "s"}
            </span>
            <span>Data is loaded from the MealBridge API.</span>
          </div>
        </section>
      </div>

      {/* Edit modal */}
      {selectedRequest && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gray-950/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeEdit();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-request-title"
            className="my-auto w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-gray-100 p-5 sm:p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  Request management
                </p>
                <h2
                  id="edit-request-title"
                  className="mt-2 text-xl font-bold text-gray-900"
                >
                  Edit food request
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedRequest.donation?.foodName || "Selected donation"}
                </p>
              </div>

              <button
                type="button"
                onClick={closeEdit}
                disabled={saving}
                aria-label="Close edit dialog"
                className="rounded-lg px-3 py-1 text-2xl text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleEdit} className="space-y-5 p-5 sm:p-6">
              <div>
                <label
                  htmlFor="edit-quantity"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Requested quantity
                </label>
                <input
                  id="edit-quantity"
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={editQuantity}
                  onChange={(event) => setEditQuantity(event.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Unit: {selectedRequest.donation?.quantityUnit || "units"}. The
                  server will validate the available donation quantity.
                </p>
              </div>

              <div>
                <label
                  htmlFor="edit-message"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Recipient message
                </label>
                <textarea
                  id="edit-message"
                  rows={4}
                  value={editMessage}
                  onChange={(event) => setEditMessage(event.target.value)}
                  placeholder="Enter a message..."
                  className="w-full resize-y rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeEdit}
                  disabled={saving}
                  className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving changes..." : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Receipients;
