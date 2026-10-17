import React, { useCallback, useEffect, useMemo, useState } from "react";

const API_URL = "http://localhost:5001/api/complaints";

const STATUSES = [
  "OPEN",
  "IN_PROGRESS",
  "WAITING_FOR_USER",
  "RESOLVED",
  "CLOSED",
];

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];

const CATEGORIES = [
  "FOOD_DONATION",
  "FOOD_REQUEST",
  "DELIVERY",
  "VOLUNTEER",
  "ACCOUNT",
  "PAYMENT",
  "BEHAVIOUR",
  "TECHNICAL",
  "OTHER",
];

const STATUS_STYLES = {
  OPEN: "bg-blue-50/80 text-blue-700 ring-blue-500/20 shadow-sm",
  IN_PROGRESS: "bg-amber-50/80 text-amber-700 ring-amber-500/20 shadow-sm",
  WAITING_FOR_USER:
    "bg-purple-50/80 text-purple-700 ring-purple-500/20 shadow-sm",
  RESOLVED: "bg-emerald-50/80 text-emerald-700 ring-emerald-500/20 shadow-sm",
  CLOSED: "bg-slate-100 text-slate-600 ring-slate-500/20 shadow-sm",
};

const PRIORITY_STYLES = {
  LOW: "bg-slate-100 text-slate-600",
  MEDIUM: "bg-blue-50 text-blue-700",
  HIGH: "bg-orange-50 text-orange-700",
  URGENT: "bg-red-50 text-red-700 font-bold animate-pulse",
};

const pretty = (value = "") =>
  String(value)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
};

const shortId = (id = "") => String(id).slice(-8).toUpperCase();

function Badge({ value, styles = {} }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ring-1 transition-all duration-300 ${
        styles[value] || "bg-slate-100 text-slate-600 ring-slate-200"
      }`}
    >
      {pretty(value || "Unknown")}
    </span>
  );
}

function MetricCard({ title, value, description, icon, accent }) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-black/[0.06] bg-white/70 p-6 shadow-sm backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-black/[0.12] hover:shadow-xl hover:shadow-black/[0.04]">
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-white/40 to-black/[0.02] blur-2xl transition-all duration-500 group-hover:scale-125" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <p className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900">
            {value}
          </p>
          <p className="mt-2 text-xs font-medium text-slate-500">
            {description}
          </p>
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${accent}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function Complaint() {
  const [complaints, setComplaints] = useState([]);
  const [selected, setSelected] = useState(null);
  const [admins, setAdmins] = useState([]);

  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const [reply, setReply] = useState("");
  const [editStatus, setEditStatus] = useState("OPEN");
  const [editPriority, setEditPriority] = useState("MEDIUM");
  const [assignedAdmin, setAssignedAdmin] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);

  const getToken = () => localStorage.getItem("mealbridge-admin-token");

  const apiRequest = async (path, options = {}) => {
    const token = getToken();

    if (!token) {
      throw new Error("Admin access token not found. Please sign in again.");
    }

    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.success === false) {
      if (response.status === 401) {
        throw new Error("Your session has expired. Please sign in again.");
      }
      if (response.status === 403) {
        throw new Error("Admin access denied.");
      }
      throw new Error(
        data.message || `Request failed with status ${response.status}`,
      );
    }

    return data;
  };

  const loadComplaints = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });

      if (search.trim()) params.set("search", search.trim());
      if (statusFilter) params.set("status", statusFilter);
      if (priorityFilter) params.set("priority", priorityFilter);
      if (categoryFilter) params.set("category", categoryFilter);

      const data = await apiRequest(`/admin/all?${params.toString()}`);

      setComplaints(data.complaints || []);
      setPagination(
        data.pagination || {
          total: (data.complaints || []).length,
          page,
          limit,
          totalPages: 1,
        },
      );
    } catch (err) {
      setError(err.message || "Unable to load complaints.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, statusFilter, priorityFilter, categoryFilter]);

  useEffect(() => {
    loadComplaints();
  }, [loadComplaints]);

  const openComplaint = async (item) => {
    setSelected(item);
    setReply("");
    setDetailLoading(true);
    setNotice("");
    setError("");

    setEditStatus(item.status || "OPEN");
    setEditPriority(item.priority || "MEDIUM");
    setAssignedAdmin(
      typeof item.assignedAdmin === "object"
        ? item.assignedAdmin?._id || ""
        : item.assignedAdmin || "",
    );

    try {
      const data = await apiRequest(`/admin/${item._id}`);
      setSelected(data.complaint);
      setEditStatus(data.complaint.status || "OPEN");
      setEditPriority(data.complaint.priority || "MEDIUM");
      setAssignedAdmin(
        typeof data.complaint.assignedAdmin === "object"
          ? data.complaint.assignedAdmin?._id || ""
          : data.complaint.assignedAdmin || "",
      );
    } catch (err) {
      setError(err.message || "Unable to load complaint details.");
    } finally {
      setDetailLoading(false);
    }
  };

  const saveChanges = async () => {
    if (!selected) return;

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const data = await apiRequest(`/admin/${selected._id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: editStatus,
          priority: editPriority,
          assignedAdmin: assignedAdmin || null,
        }),
      });

      setSelected(data.complaint);
      setNotice("Complaint details updated successfully.");
      await loadComplaints();
    } catch (err) {
      setError(err.message || "Unable to update complaint.");
    } finally {
      setSaving(false);
    }
  };

  const sendReply = async (event) => {
    event.preventDefault();

    if (!selected || !reply.trim()) {
      setError("Please enter a reply before sending.");
      return;
    }

    const recipientEmail = selected.user?.email || selected.complainantEmail;

    if (!recipientEmail) {
      setError("The complaint does not contain a user email address.");
      return;
    }

    if (!window.confirm(`Send this reply by email to ${recipientEmail}?`)) {
      return;
    }

    setSendingReply(true);
    setError("");
    setNotice("");

    try {
      const data = await apiRequest(`/admin/${selected._id}/reply`, {
        method: "POST",
        body: JSON.stringify({ message: reply.trim() }),
      });

      setReply("");
      setNotice(data.message || "Reply email sent successfully.");

      const refreshed = await apiRequest(`/admin/${selected._id}`);
      setSelected(refreshed.complaint);
      setEditStatus(refreshed.complaint.status);
      setEditPriority(refreshed.complaint.priority);

      await loadComplaints();
    } catch (err) {
      setError(err.message || "Unable to send reply email.");
    } finally {
      setSendingReply(false);
    }
  };

  const deleteComplaint = async () => {
    if (!deleteTarget) return;

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const data = await apiRequest(`/admin/${deleteTarget._id}`, {
        method: "DELETE",
      });

      if (selected?._id === deleteTarget._id) {
        setSelected(null);
      }

      setDeleteTarget(null);
      setNotice(data.message || "Complaint deleted successfully.");
      await loadComplaints();
    } catch (err) {
      setError(err.message || "Unable to delete complaint.");
    } finally {
      setSaving(false);
    }
  };

  const stats = useMemo(() => {
    const counts = {
      OPEN: 0,
      IN_PROGRESS: 0,
      WAITING_FOR_USER: 0,
      RESOLVED: 0,
      CLOSED: 0,
    };
    complaints.forEach((item) => {
      if (counts[item.status] !== undefined) counts[item.status] += 1;
    });
    return counts;
  }, [complaints]);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setPriorityFilter("");
    setCategoryFilter("");
    setPage(1);
  };

  const userName = (item) =>
    item.user?.fullName || item.complainantName || "Unknown user";

  const userEmail = (item) =>
    item.user?.email || item.complainantEmail || "No email provided";

  return (
    <div className="min-h-screen bg-[#F5F5F7] p-4 text-[#1D1D1F] antialiased selection:bg-emerald-500 selection:text-white sm:p-6 lg:p-10">
      <div className="mx-auto max-w-[1600px] space-y-8">
        {/* Apple-style Header */}
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <div className="mb-3 flex items-center gap-2.5 text-xs font-semibold uppercase tracking-widest text-emerald-600">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              MealBridge Operations Console
            </div>

            <h1 className="text-4xl font-semibold tracking-tight text-[#1D1D1F] sm:text-5xl">
              Complaint Management
            </h1>

            <p className="mt-2 text-base text-slate-500">
              Monitor, triage, and resolve citizen and user support requests
              seamlessly.
            </p>
          </div>

          <button
            type="button"
            onClick={loadComplaints}
            disabled={loading}
            className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-white px-5 py-3 text-sm font-semibold shadow-sm ring-1 ring-black/[0.08] transition-all duration-300 hover:bg-slate-50 hover:shadow-md hover:ring-black/[0.15] active:scale-95 disabled:opacity-50"
          >
            <span
              className={`text-base transition-transform duration-700 ${loading ? "animate-spin" : "group-hover:rotate-180"}`}
            >
              ⟳
            </span>
            Refresh Data
          </button>
        </div>

        {/* Notifications / Alerts with Spring-like Fade */}
        {error && (
          <div
            role="alert"
            className="flex items-start justify-between gap-3 rounded-2xl border border-red-200 bg-red-50/80 p-4 text-sm font-medium text-red-900 shadow-sm backdrop-blur-md transition-all animate-in fade-in slide-in-from-top-2"
          >
            <span className="flex items-center gap-2">⚠️ {error}</span>
            <button
              type="button"
              onClick={() => setError("")}
              className="font-bold text-red-700 hover:text-red-900"
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="flex items-start justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-sm font-medium text-emerald-900 shadow-sm backdrop-blur-md transition-all animate-in fade-in slide-in-from-top-2"
          >
            <span className="flex items-center gap-2">✨ {notice}</span>
            <button
              type="button"
              onClick={() => setNotice("")}
              className="font-bold text-emerald-700 hover:text-emerald-900"
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </div>
        )}

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
          <MetricCard
            title="Total Complaints"
            value={pagination.total}
            description="Active query filtered"
            icon="📊"
            accent="bg-slate-100 text-slate-700"
          />
          <MetricCard
            title="Open Queue"
            value={stats.OPEN}
            description="Pending initial review"
            icon="🎯"
            accent="bg-blue-50 text-blue-700"
          />
          <MetricCard
            title="In Progress"
            value={stats.IN_PROGRESS}
            description="Currently being handled"
            icon="⚡"
            accent="bg-amber-50 text-amber-700"
          />
          <MetricCard
            title="Waiting on User"
            value={stats.WAITING_FOR_USER}
            description="Awaiting feedback"
            icon="⏳"
            accent="bg-purple-50 text-purple-700"
          />
          <MetricCard
            title="Resolved"
            value={stats.RESOLVED}
            description="Successfully closed"
            icon="✅"
            accent="bg-emerald-50 text-emerald-700"
          />
        </div>

        {/* Main Data Section Container */}
        <section className="overflow-hidden rounded-3xl border border-black/[0.06] bg-white/80 shadow-xl shadow-black/[0.02] backdrop-blur-2xl">
          <div className="border-b border-slate-100 p-6 sm:p-8">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                  Complaint Directory
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Detailed stream of incoming tickets, user meta, and statuses.
                </p>
              </div>

              {/* Filters Toolbar */}
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm outline-none transition hover:border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                  aria-label="Filter by status"
                >
                  <option value="">All Statuses</option>
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {pretty(status)}
                    </option>
                  ))}
                </select>

                <select
                  value={priorityFilter}
                  onChange={(e) => {
                    setPriorityFilter(e.target.value);
                    setPage(1);
                  }}
                  className="rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm outline-none transition hover:border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                  aria-label="Filter by priority"
                >
                  <option value="">All Priorities</option>
                  {PRIORITIES.map((priority) => (
                    <option key={priority} value={priority}>
                      {pretty(priority)}
                    </option>
                  ))}
                </select>

                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setPage(1);
                  }}
                  className="rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm outline-none transition hover:border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                  aria-label="Filter by category"
                >
                  <option value="">All Categories</option>
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {pretty(category)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Search Bar & Reset */}
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  🔍
                </span>
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search subject, user name, or email..."
                  className="w-full rounded-2xl border border-slate-200/80 bg-white/80 py-3.5 pl-11 pr-4 text-sm font-medium text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>

              <button
                type="button"
                onClick={clearFilters}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 active:scale-95"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Loading or Empty State */}
          {loading ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 text-sm font-medium text-slate-500">
              <div className="h-10 w-10 animate-spin rounded-full border-3 border-slate-200 border-t-emerald-600" />
              Syncing live complaints database...
            </div>
          ) : complaints.length === 0 ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-3xl shadow-inner">
                📭
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-800">
                No complaints found
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Try modifying your filters or search criteria.
              </p>
            </div>
          ) : (
            <>
              {/* Apple Clean Table View */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] text-left">
                  <thead className="bg-slate-50/70 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-6 py-4">Complaint</th>
                      <th className="px-6 py-4">Submitted By</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Priority</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Created At</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100/80 text-sm">
                    {complaints.map((item) => (
                      <tr
                        key={item._id}
                        className="group transition-colors duration-200 hover:bg-slate-50/60"
                      >
                        <td className="max-w-[280px] px-6 py-5">
                          <button
                            type="button"
                            onClick={() => openComplaint(item)}
                            className="block text-left"
                          >
                            <span className="block truncate font-semibold text-slate-900 transition-colors group-hover:text-emerald-600">
                              {item.subject}
                            </span>
                            <span className="mt-1 block font-mono text-xs text-slate-400">
                              #{shortId(item._id)}
                            </span>
                          </button>
                        </td>

                        <td className="px-6 py-5">
                          <p className="font-medium text-slate-800">
                            {userName(item)}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-400">
                            {userEmail(item)}
                          </p>
                        </td>

                        <td className="px-6 py-5 font-medium text-slate-600">
                          {pretty(item.category)}
                        </td>

                        <td className="px-6 py-5">
                          <Badge
                            value={item.priority}
                            styles={PRIORITY_STYLES}
                          />
                        </td>

                        <td className="px-6 py-5">
                          <Badge value={item.status} styles={STATUS_STYLES} />
                        </td>

                        <td className="whitespace-nowrap px-6 py-5 text-xs font-medium text-slate-500">
                          {formatDate(item.createdAt)}
                        </td>

                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openComplaint(item)}
                              className="rounded-xl border border-slate-200/80 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 active:scale-95"
                            >
                              Inspect
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeleteTarget(item)}
                              className="rounded-xl border border-red-200/80 bg-white px-3.5 py-2 text-xs font-semibold text-red-600 shadow-sm transition hover:bg-red-50 active:scale-95"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Clean Pagination Bar */}
              <div className="flex flex-col justify-between gap-4 border-t border-slate-100 bg-slate-50/40 px-6 py-4 sm:flex-row sm:items-center">
                <p className="text-sm font-medium text-slate-500">
                  {pagination.total === 0
                    ? "No records found"
                    : `Showing ${(page - 1) * limit + 1}–${Math.min(
                        page * limit,
                        pagination.total,
                      )} of ${pagination.total} entries`}
                </p>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((current) => current - 1)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <span className="text-sm font-medium text-slate-600">
                    Page <strong className="text-slate-900">{page}</strong> of{" "}
                    <strong>{Math.max(1, pagination.totalPages)}</strong>
                  </span>

                  <button
                    type="button"
                    disabled={page >= Math.max(1, pagination.totalPages)}
                    onClick={() => setPage((current) => current + 1)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>

      {/* Modern Modal Overlay */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-md animate-in fade-in duration-300 sm:p-6"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelected(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="complaint-detail-title"
            className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5 animate-in zoom-in-95 duration-300"
          >
            {/* Modal Header */}
            <header className="flex items-start justify-between gap-4 border-b border-slate-100 p-6 sm:p-8">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-600">
                    Ticket #{shortId(selected._id)}
                  </span>
                  <Badge value={selected.status} styles={STATUS_STYLES} />
                </div>
                <h2
                  id="complaint-detail-title"
                  className="mt-2.5 break-words text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
                >
                  {selected.subject}
                </h2>
                <p className="mt-1 text-xs font-medium text-slate-400">
                  Received on {formatDate(selected.createdAt)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelected(null)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 text-xl font-medium text-slate-500 shadow-sm transition hover:bg-slate-100 hover:text-slate-900 active:scale-95"
                aria-label="Close complaint details"
              >
                ✕
              </button>
            </header>

            {/* Modal Body */}
            {detailLoading ? (
              <div className="flex min-h-[320px] items-center justify-center text-sm font-medium text-slate-400">
                Loading complete ticket details...
              </div>
            ) : (
              <div className="grid grid-cols-1 overflow-y-auto lg:grid-cols-[1.2fr_0.8fr]">
                {/* Left Column: Complainant & Description & Replies */}
                <div className="space-y-6 border-b border-slate-100 p-6 sm:p-8 lg:border-b-0 lg:border-r">
                  <section>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Complainant Profile
                    </h3>

                    <div className="mt-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 shadow-sm">
                      <div className="flex items-center gap-3.5">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-lg font-bold text-emerald-700 shadow-sm">
                          {userName(selected).charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-bold text-slate-900">
                            {userName(selected)}
                          </p>
                          <p className="break-all text-xs font-medium text-slate-500">
                            {userEmail(selected)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-200/60 pt-3 sm:grid-cols-2 text-xs">
                        <div>
                          <p className="text-slate-400">User ID</p>
                          <p className="mt-1 font-mono font-medium text-slate-700 truncate">
                            {typeof selected.user === "object"
                              ? selected.user?._id || "N/A"
                              : selected.user || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400">System Role</p>
                          <p className="mt-1 font-semibold text-slate-800">
                            {selected.user?.role
                              ? pretty(selected.user.role)
                              : "Standard User"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section>
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Description & Details
                      </h3>
                      <Badge
                        value={selected.category}
                        styles={{ ...PRIORITY_STYLES, ...STATUS_STYLES }}
                      />
                    </div>

                    <div className="mt-3 whitespace-pre-wrap break-words rounded-2xl border border-slate-100 bg-slate-50/50 p-4 text-sm leading-relaxed text-slate-700 shadow-inner">
                      {selected.description}
                    </div>
                  </section>

                  {/* Send Email Reply Form */}
                  <section className="pt-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Send Email Response to User
                    </h3>

                    <form onSubmit={sendReply} className="mt-3 space-y-3">
                      <textarea
                        rows={3}
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        placeholder="Type direct response message..."
                        className="w-full rounded-2xl border border-slate-200/80 bg-white p-4 text-sm font-medium text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                      />

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={sendingReply || !reply.trim()}
                          className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-slate-800 active:scale-95 disabled:opacity-50"
                        >
                          {sendingReply ? "Sending..." : "Send Email Reply"}
                        </button>
                      </div>
                    </form>
                  </section>
                </div>

                {/* Right Column: Controls, Timeline & Admin Management */}
                <div className="flex flex-col justify-between space-y-6 bg-slate-50/40 p-6 sm:p-8">
                  <div className="space-y-6">
                    <section>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Triage & Assignment
                      </h3>

                      <div className="mt-3 space-y-4">
                        <label className="block">
                          <span className="text-xs font-semibold text-slate-600">
                            Status Update
                          </span>
                          <select
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value)}
                            className="mt-1.5 w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                          >
                            {STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {pretty(status)}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="block">
                          <span className="text-xs font-semibold text-slate-600">
                            Priority Level
                          </span>
                          <select
                            value={editPriority}
                            onChange={(e) => setEditPriority(e.target.value)}
                            className="mt-1.5 w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                          >
                            {PRIORITIES.map((priority) => (
                              <option key={priority} value={priority}>
                                {pretty(priority)}
                              </option>
                            ))}
                          </select>
                        </label>

                        <button
                          type="button"
                          disabled={saving}
                          onClick={saveChanges}
                          className="w-full rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-500 active:scale-95 disabled:opacity-50"
                        >
                          {saving ? "Saving Changes..." : "Save Ticket Changes"}
                        </button>
                      </div>
                    </section>

                    <section className="border-t border-slate-200/60 pt-5">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Ticket Lifecycle Timeline
                      </h3>

                      <div className="mt-3 space-y-3 text-xs">
                        <div className="flex gap-3">
                          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500 shadow-sm" />
                          <div>
                            <p className="font-semibold text-slate-800">
                              Submitted
                            </p>
                            <p className="text-slate-400">
                              {formatDate(selected.createdAt)}
                            </p>
                          </div>
                        </div>

                        {selected.resolvedAt && (
                          <div className="flex gap-3">
                            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500 shadow-sm" />
                            <div>
                              <p className="font-semibold text-slate-800">
                                Resolved
                              </p>
                              <p className="text-slate-400">
                                {formatDate(selected.resolvedAt)}
                              </p>
                            </div>
                          </div>
                        )}

                        {selected.closedAt && (
                          <div className="flex gap-3">
                            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-slate-400 shadow-sm" />
                            <div>
                              <p className="font-semibold text-slate-800">
                                Closed
                              </p>
                              <p className="text-slate-400">
                                {formatDate(selected.closedAt)}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </section>
                  </div>

                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={() => setSelected(null)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95"
                    >
                      Close Inspector
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-black/5 animate-in zoom-in-95 duration-300 sm:p-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-2xl text-red-600 shadow-sm">
              ⚠️
            </div>
            <h3 className="mt-4 text-xl font-bold tracking-tight text-slate-900">
              Delete Complaint?
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Are you sure you want to remove{" "}
              <strong className="text-slate-800">
                #{shortId(deleteTarget._id)}
              </strong>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={deleteComplaint}
                className="flex-1 rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-red-600/20 transition hover:bg-red-500 active:scale-95 disabled:opacity-50"
              >
                {saving ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
