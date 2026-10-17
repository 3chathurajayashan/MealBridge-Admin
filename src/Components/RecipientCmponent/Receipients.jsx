import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/* -------------------------------------------------------------------------- */
/*  Config                                                                    */
/* -------------------------------------------------------------------------- */

const API_URL = "http://localhost:5001/api/foodrequests";

const STATUS_OPTIONS = ["PENDING", "ACCEPTED", "REJECTED", "CANCELLED"];

const STATUS_LABEL = {
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
};

const statusStyles = {
  PENDING: { pill: "bg-[#fff4e0] text-[#b25e00]", dot: "bg-[#ff9500]" },
  ACCEPTED: { pill: "bg-[#e3f8e9] text-[#1a7a36]", dot: "bg-[#34c759]" },
  REJECTED: { pill: "bg-[#ffe9e8] text-[#c3271d]", dot: "bg-[#ff3b30]" },
  CANCELLED: { pill: "bg-[#efeff1] text-[#6e6e73]", dot: "bg-[#a1a1a6]" },
};

const FONT_STACK =
  '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Inter", "Helvetica Neue", Helvetica, Arial, sans-serif';

const EASE = "ease-[cubic-bezier(0.32,0.72,0,1)]";

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

const formatDate = (date) => {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleString("en-LK", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const getErrorMessage = async (response) => {
  try {
    const data = await response.json();
    return data.message || data.error || "Something went wrong.";
  } catch {
    return "Unable to process the server response.";
  }
};

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

const parseRequest = (request) => {
  const recipient = request.recipient || {};
  const donation =
    request.donation && typeof request.donation === "object"
      ? request.donation
      : {};
  const donor =
    donation.donor && typeof donation.donor === "object" ? donation.donor : {};
  return { recipient, donation, donor };
};

/* -------------------------------------------------------------------------- */
/*  Small UI pieces                                                           */
/* -------------------------------------------------------------------------- */

const Icon = ({ name, className = "h-4 w-4" }) => {
  const paths = {
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </>
    ),
    refresh: (
      <>
        <path d="M20 11a8 8 0 1 0-2.3 5.7" />
        <path d="M20 4v7h-7" />
      </>
    ),
    close: <path d="M6 6l12 12M18 6 6 18" />,
    check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
    inbox: (
      <>
        <path d="M3 13h5l1.5 3h5L16 13h5" />
        <path d="M5.5 5h13L21 13v6H3v-6z" />
      </>
    ),
    alert: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7.5v5.5M12 16.5h.01" />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
};

function StatusBadge({ status }) {
  const style = statusStyles[status] || {
    pill: "bg-[#efeff1] text-[#6e6e73]",
    dot: "bg-[#a1a1a6]",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium ${style.pill}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {STATUS_LABEL[status] || "Unknown"}
    </span>
  );
}

function Stat({ label, value, hint, loading }) {
  return (
    <div className="flex-1 px-6 py-5 first:pl-0 sm:py-6">
      <p className="text-[13px] font-medium text-[#6e6e73]">{label}</p>
      {loading ? (
        <div className="mt-2 h-10 w-16 rounded-lg mb-skeleton" />
      ) : (
        <p className="mt-1 text-[40px] font-semibold leading-none tracking-[-0.03em] text-[#1d1d1f] tabular-nums sm:text-[48px]">
          {value}
        </p>
      )}
      <p className="mt-2 text-[13px] text-[#86868b]">{hint}</p>
    </div>
  );
}

function ActionButton({ children, onClick, disabled, tone = "neutral" }) {
  const tones = {
    primary: "bg-[#0071e3] text-white hover:bg-[#0077ed]",
    neutral: "bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#ebebed]",
    danger: "bg-[#fff0ef] text-[#d70015] hover:bg-[#ffe3e1]",
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition duration-200 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 ${tones[tone]}`}
    >
      {children}
    </button>
  );
}

function RequestActions({ request, busy, onEdit, onStatus, onDelete }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {request.status === "PENDING" ? (
        <>
          <ActionButton
            tone="primary"
            disabled={busy}
            onClick={() => onStatus(request, "ACCEPTED")}
          >
            {busy ? "Working…" : "Accept"}
          </ActionButton>
          <ActionButton disabled={busy} onClick={() => onEdit(request)}>
            Edit
          </ActionButton>
          <ActionButton
            disabled={busy}
            onClick={() => onStatus(request, "REJECTED")}
          >
            Reject
          </ActionButton>
          <ActionButton
            disabled={busy}
            onClick={() => onStatus(request, "CANCELLED")}
          >
            Cancel
          </ActionButton>
        </>
      ) : (
        <span className="text-[12px] text-[#86868b]">Decision recorded</span>
      )}
      <ActionButton
        tone="danger"
        disabled={busy}
        onClick={() => onDelete(request)}
      >
        Delete
      </ActionButton>
    </div>
  );
}

function SkeletonRows() {
  return (
    <div aria-hidden="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-1 gap-4 border-b border-[#f0f0f2] px-6 py-6 sm:px-8 xl:grid-cols-[1.2fr_1.2fr_0.5fr_1fr_0.7fr_0.8fr_1.4fr]"
        >
          {Array.from({ length: 7 }).map((__, j) => (
            <div key={j} className="space-y-2.5">
              <div
                className="h-3.5 rounded-md mb-skeleton"
                style={{ width: `${70 - ((i + j) % 3) * 12}%` }}
              />
              <div className="h-3 w-1/2 rounded-md mb-skeleton" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main component                                                            */
/* -------------------------------------------------------------------------- */

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
  const [confirmState, setConfirmState] = useState(null);

  const noticeTimer = useRef(null);

  /* ------------------------------ Data loading ----------------------------- */

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

  useEffect(() => () => window.clearTimeout(noticeTimer.current), []);

  /* ------------------------------ Derived data ----------------------------- */

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...requests]
      .filter((request) => {
        if (statusFilter !== "ALL" && request.status !== statusFilter) {
          return false;
        }

        if (!query) return true;

        const { recipient, donation, donor } = parseRequest(request);

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

  const stats = useMemo(
    () => ({
      total: requests.length,
      pending: requests.filter((r) => r.status === "PENDING").length,
      accepted: requests.filter((r) => r.status === "ACCEPTED").length,
      rejected: requests.filter(
        (r) => r.status === "REJECTED" || r.status === "CANCELLED",
      ).length,
    }),
    [requests],
  );

  const countFor = (status) =>
    status === "ALL"
      ? requests.length
      : requests.filter((r) => r.status === status).length;

  /* -------------------------------- Actions -------------------------------- */

  const showNotice = (type, message) => {
    window.clearTimeout(noticeTimer.current);
    setNotice({ type, message, id: Date.now() });
    noticeTimer.current = window.setTimeout(() => setNotice(null), 4000);
  };

  const openEdit = (request) => {
    setSelectedRequest(request);
    setEditQuantity(String(request.quantityRequested ?? ""));
    setEditMessage(request.message || "");
  };

  const closeEdit = useCallback(() => {
    if (saving) return;

    setSelectedRequest(null);
    setEditQuantity("");
    setEditMessage("");
  }, [saving]);

  // Close sheet / dialog with Escape
  useEffect(() => {
    const onKey = (event) => {
      if (event.key !== "Escape") return;
      if (confirmState) setConfirmState(null);
      else if (selectedRequest) closeEdit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirmState, selectedRequest, closeEdit]);

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

  const runStatusChange = async (request, status) => {
    const actionText = status.toLowerCase();
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

  const runDelete = async (request) => {
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

  const handleStatusChange = (request, status) => {
    const actionText = status.toLowerCase();
    setConfirmState({
      title: `${STATUS_LABEL[status]} this request?`,
      message: `Are you sure you want to ${actionText} this food request?`,
      confirmLabel: STATUS_LABEL[status],
      tone: status === "ACCEPTED" ? "primary" : "danger",
      onConfirm: () => runStatusChange(request, status),
    });
  };

  const handleDelete = (request) => {
    const donationName = request.donation?.foodName || "this food request";
    setConfirmState({
      title: "Delete this request?",
      message: `The request for "${donationName}" will be permanently deleted. This action cannot be undone.`,
      confirmLabel: "Delete",
      tone: "danger",
      onConfirm: () => runDelete(request),
    });
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setSortOrder("newest");
  };

  /* --------------------------------- Render -------------------------------- */

  const editDetails = selectedRequest ? parseRequest(selectedRequest) : null;

  return (
    <div
      className="min-h-screen w-full bg-white text-[#1d1d1f] antialiased"
      style={{ fontFamily: FONT_STACK, textRendering: "optimizeLegibility" }}
    >
      <style>{`
        @keyframes mb-fade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes mb-rise { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: none } }
        @keyframes mb-sheet { from { transform: translateX(100%) } to { transform: none } }
        @keyframes mb-sheet-up { from { transform: translateY(100%) } to { transform: none } }
        @keyframes mb-pop { from { opacity: 0; transform: scale(0.96) } to { opacity: 1; transform: none } }
        @keyframes mb-toast { from { opacity: 0; transform: translate(-50%, -12px) scale(0.98) } to { opacity: 1; transform: translate(-50%, 0) scale(1) } }
        @keyframes mb-shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }
        @keyframes mb-bar { 0% { transform: translateX(-100%) } 100% { transform: translateX(250%) } }
        .mb-fade { animation: mb-fade .35s ease both }
        .mb-rise { animation: mb-rise .6s cubic-bezier(.32,.72,0,1) both }
        .mb-pop { animation: mb-pop .28s cubic-bezier(.32,.72,0,1) both }
        .mb-toast { animation: mb-toast .45s cubic-bezier(.32,.72,0,1) both }
        .mb-sheet { animation: mb-sheet-up .45s cubic-bezier(.32,.72,0,1) both }
        @media (min-width: 768px) { .mb-sheet { animation-name: mb-sheet } }
        .mb-row { animation: mb-fade .4s ease both }
        .mb-skeleton {
          background: linear-gradient(90deg,#f2f2f4 25%,#e8e8eb 50%,#f2f2f4 75%);
          background-size: 200% 100%;
          animation: mb-shimmer 1.6s linear infinite;
        }
        .mb-bar { animation: mb-bar 1.1s cubic-bezier(.4,0,.2,1) infinite }
        .mb-scroll::-webkit-scrollbar { display: none }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
        }
      `}</style>

      {/* Refresh progress bar */}
      <div
        className={`fixed inset-x-0 top-0 z-[60] h-0.5 overflow-hidden transition-opacity duration-300 ${
          refreshing ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="mb-bar h-full w-1/3 rounded-full bg-[#0071e3]" />
      </div>

      {/* Sticky translucent bar */}
      <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-white/75 backdrop-blur-xl backdrop-saturate-150">
        <div className="flex h-14 w-full items-center justify-between px-5 sm:px-8 lg:px-12">
          <div className="flex items-center gap-2 text-[13px] text-[#6e6e73]">
            <span className="font-semibold text-[#1d1d1f]">MealBridge</span>
            <span className="text-[#c7c7cc]">/</span>
            <span>Administration</span>
          </div>

          <button
            type="button"
            onClick={() => fetchRequests(true)}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-2 rounded-full bg-[#f5f5f7] px-4 py-1.5 text-[13px] font-medium text-[#1d1d1f] transition duration-200 hover:bg-[#ebebed] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Icon
              name="refresh"
              className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing" : "Refresh"}
          </button>
        </div>
      </header>

      {/* Toast */}
      {notice && (
        <div
          key={notice.id}
          role="status"
          className={`mb-toast fixed left-1/2 top-[68px] z-[70] flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-full py-2.5 pl-4 pr-3 text-[14px] font-medium shadow-[0_8px_30px_rgba(0,0,0,0.16)] backdrop-blur-xl ${
            notice.type === "success"
              ? "bg-[#1d1d1f]/95 text-white"
              : "bg-[#d70015]/95 text-white"
          }`}
        >
          <Icon
            name={notice.type === "success" ? "check" : "alert"}
            className="h-4 w-4 shrink-0"
          />
          <span className="truncate">{notice.message}</span>
          <button
            type="button"
            onClick={() => setNotice(null)}
            aria-label="Dismiss notification"
            className="rounded-full p-1 text-white/70 transition hover:bg-white/15 hover:text-white"
          >
            <Icon name="close" className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <main className="w-full">
        {/* Hero */}
        <section className="mb-rise px-5 pb-8 pt-12 sm:px-8 sm:pt-16 lg:px-12">
          <h1 className="text-[40px] font-semibold leading-[1.05] tracking-[-0.035em] sm:text-[56px]">
            Food requests
          </h1>
          <p className="mt-4 max-w-xl text-[17px] leading-[1.47] text-[#6e6e73] sm:text-[19px]">
            Review what recipients are asking for, adjust the details, and
            decide which requests move forward.
          </p>
        </section>

        {/* Stats */}
        <section
          className="mb-rise mx-5 border-y border-[#e8e8ed] sm:mx-8 lg:mx-12"
          style={{ animationDelay: "80ms" }}
        >
          <div className="grid grid-cols-2 divide-x divide-[#e8e8ed] lg:flex">
            <Stat
              label="Total requests"
              value={stats.total}
              hint="Across all donations"
              loading={loading}
            />
            <Stat
              label="Pending"
              value={stats.pending}
              hint="Waiting for a decision"
              loading={loading}
            />
            <Stat
              label="Accepted"
              value={stats.accepted}
              hint="Approved for pickup"
              loading={loading}
            />
            <Stat
              label="Not proceeding"
              value={stats.rejected}
              hint="Rejected or cancelled"
              loading={loading}
            />
          </div>
        </section>

        {/* Error */}
        {error && (
          <div
            className="mb-pop mx-5 mt-6 flex flex-col gap-3 rounded-2xl bg-[#fff0ef] p-5 sm:mx-8 sm:flex-row sm:items-center sm:justify-between lg:mx-12"
            role="alert"
          >
            <div className="flex items-start gap-3">
              <Icon name="alert" className="mt-0.5 h-5 w-5 text-[#d70015]" />
              <div>
                <p className="text-[15px] font-semibold text-[#d70015]">
                  Couldn’t load food requests
                </p>
                <p className="mt-0.5 text-[14px] text-[#86201a]">{error}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => fetchRequests()}
              className="self-start rounded-full bg-[#d70015] px-5 py-2 text-[14px] font-medium text-white transition hover:bg-[#b80012] active:scale-[0.97] sm:self-auto"
            >
              Try again
            </button>
          </div>
        )}

        {/* Toolbar */}
        <section className="px-5 pb-4 pt-8 sm:px-8 lg:px-12">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Segmented control */}
            <div className="mb-scroll -mx-1 overflow-x-auto px-1">
              <div
                role="tablist"
                aria-label="Filter by status"
                className="inline-flex gap-1 rounded-full bg-[#f5f5f7] p-1"
              >
                {["ALL", ...STATUS_OPTIONS].map((status) => {
                  const active = statusFilter === status;
                  return (
                    <button
                      key={status}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setStatusFilter(status)}
                      className={`whitespace-nowrap rounded-full px-4 py-1.5 text-[13px] font-medium transition duration-300 ${EASE} ${
                        active
                          ? "bg-white text-[#1d1d1f] shadow-[0_1px_3px_rgba(0,0,0,0.12)]"
                          : "text-[#6e6e73] hover:text-[#1d1d1f]"
                      }`}
                    >
                      {status === "ALL" ? "All" : STATUS_LABEL[status]}
                      <span className="ml-1.5 tabular-nums text-[#86868b]">
                        {loading ? "–" : countFor(status)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search + sort */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative sm:w-80">
                <Icon
                  name="search"
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#86868b]"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search recipient, food, donor"
                  className="w-full rounded-full bg-[#f5f5f7] py-2.5 pl-10 pr-4 text-[14px] outline-none ring-0 transition duration-300 placeholder:text-[#86868b] focus:bg-white focus:shadow-[0_0_0_4px_rgba(0,113,227,0.18)] focus:ring-1 focus:ring-[#0071e3]"
                />
              </div>

              <select
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value)}
                aria-label="Sort requests"
                className="rounded-full bg-[#f5f5f7] px-4 py-2.5 text-[14px] text-[#1d1d1f] outline-none transition hover:bg-[#ebebed] focus:ring-2 focus:ring-[#0071e3]/40"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>

              {(search || statusFilter !== "ALL" || sortOrder !== "newest") && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mb-fade text-[14px] font-medium text-[#0071e3] transition hover:text-[#0058b0]"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          <p className="mt-5 text-[13px] text-[#86868b]">
            {loading
              ? "Loading requests…"
              : `Showing ${filteredRequests.length} of ${requests.length} request${
                  requests.length === 1 ? "" : "s"
                }`}
          </p>
        </section>

        {/* List */}
        <section
          className={`border-t border-[#e8e8ed] transition-opacity duration-300 ${
            refreshing ? "opacity-60" : "opacity-100"
          }`}
        >
          {loading ? (
            <SkeletonRows />
          ) : filteredRequests.length === 0 ? (
            <div className="mb-fade flex min-h-[360px] flex-col items-center justify-center px-6 py-16 text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#f5f5f7] text-[#86868b]">
                <Icon name="inbox" className="h-7 w-7" />
              </div>
              <h3 className="text-[24px] font-semibold tracking-[-0.02em]">
                {requests.length === 0
                  ? "No food requests yet"
                  : "No matching requests"}
              </h3>
              <p className="mt-2 max-w-sm text-[15px] leading-6 text-[#6e6e73]">
                {requests.length === 0
                  ? "Requests from recipients will show up here as soon as they’re submitted."
                  : "Try a different search term or clear your filters."}
              </p>
              {requests.length > 0 && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-5 rounded-full bg-[#0071e3] px-5 py-2 text-[14px] font-medium text-white transition hover:bg-[#0077ed] active:scale-[0.97]"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto xl:block">
                <table className="w-full min-w-[1200px] text-left">
                  <thead>
                    <tr className="border-b border-[#e8e8ed] text-[12px] font-medium text-[#86868b]">
                      <th className="py-3 pl-12 pr-4 font-medium">Recipient</th>
                      <th className="px-4 py-3 font-medium">Donation</th>
                      <th className="px-4 py-3 font-medium">Quantity</th>
                      <th className="px-4 py-3 font-medium">Message</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Submitted</th>
                      <th className="py-3 pl-4 pr-12 font-medium">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredRequests.map((request, index) => {
                      const { recipient, donation, donor } =
                        parseRequest(request);
                      const busy = busyRequestId === request._id;

                      return (
                        <tr
                          key={request._id}
                          className={`mb-row group border-b border-[#f0f0f2] align-top transition-colors duration-200 hover:bg-[#fafafc] ${
                            busy ? "opacity-60" : ""
                          }`}
                          style={{
                            animationDelay: `${Math.min(index, 12) * 25}ms`,
                          }}
                        >
                          <td className="py-6 pl-12 pr-4">
                            <p className="text-[15px] font-semibold">
                              {recipient.fullName || "Unknown recipient"}
                            </p>
                            <p className="mt-1 text-[13px] text-[#6e6e73]">
                              {recipient.email || "No email"}
                            </p>
                            <p className="mt-0.5 text-[13px] text-[#86868b]">
                              {recipient.phoneNumber || "No phone number"}
                            </p>
                            {recipient.address && (
                              <p className="mt-2 max-w-[220px] text-[12px] leading-5 text-[#86868b]">
                                {recipient.address}
                              </p>
                            )}
                          </td>

                          <td className="px-4 py-6">
                            <p className="text-[15px] font-semibold">
                              {donation.foodName || "Donation unavailable"}
                            </p>
                            <p className="mt-1 text-[13px] text-[#6e6e73]">
                              {donation.category || "Uncategorized"}
                            </p>
                            <p className="mt-2 text-[12px] text-[#86868b]">
                              Donor: {donor.fullName || "Unknown donor"}
                            </p>
                            {donor.email && (
                              <p className="mt-0.5 text-[12px] text-[#86868b]">
                                {donor.email}
                              </p>
                            )}
                            <p className="mt-2 text-[12px] text-[#86868b]">
                              Donation status: {donation.status || "—"}
                            </p>
                          </td>

                          <td className="px-4 py-6">
                            <p className="text-[22px] font-semibold leading-none tracking-[-0.02em] tabular-nums">
                              {request.quantityRequested ?? "—"}
                            </p>
                            <p className="mt-1.5 text-[12px] text-[#6e6e73]">
                              {donation.quantityUnit || "units"}
                            </p>
                            {donation.quantity != null && (
                              <p className="mt-2 text-[12px] text-[#86868b]">
                                {donation.quantity} available
                              </p>
                            )}
                          </td>

                          <td className="px-4 py-6">
                            <p className="max-w-[220px] whitespace-pre-wrap break-words text-[14px] leading-5 text-[#424245]">
                              {request.message || "No message provided"}
                            </p>
                            <p className="mt-2 max-w-[220px] break-all text-[11px] text-[#a1a1a6]">
                              ID: {request._id}
                            </p>
                          </td>

                          <td className="px-4 py-6">
                            <StatusBadge status={request.status} />
                            {request.respondedAt && (
                              <p className="mt-2 text-[12px] text-[#86868b]">
                                Responded {formatDate(request.respondedAt)}
                              </p>
                            )}
                          </td>

                          <td className="whitespace-nowrap px-4 py-6 text-[13px] text-[#6e6e73]">
                            {formatDate(request.createdAt)}
                          </td>

                          <td className="py-6 pl-4 pr-12">
                            <div className="max-w-[260px]">
                              <RequestActions
                                request={request}
                                busy={busy}
                                onEdit={openEdit}
                                onStatus={handleStatusChange}
                                onDelete={handleDelete}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Cards for tablet & mobile */}
              <div className="grid grid-cols-1 gap-4 bg-[#f5f5f7] p-4 sm:p-6 md:grid-cols-2 xl:hidden">
                {filteredRequests.map((request, index) => {
                  const { recipient, donation, donor } = parseRequest(request);
                  const busy = busyRequestId === request._id;

                  return (
                    <article
                      key={request._id}
                      className={`mb-row overflow-hidden rounded-[22px] bg-white transition duration-300 ${
                        busy ? "opacity-60" : ""
                      }`}
                      style={{
                        animationDelay: `${Math.min(index, 10) * 35}ms`,
                      }}
                    >
                      <div className="flex items-start justify-between gap-3 p-5 pb-4">
                        <div className="min-w-0">
                          <p className="truncate text-[18px] font-semibold tracking-[-0.01em]">
                            {donation.foodName || "Donation unavailable"}
                          </p>
                          <p className="mt-0.5 text-[13px] text-[#6e6e73]">
                            {donation.category || "Uncategorized"}
                          </p>
                        </div>
                        <StatusBadge status={request.status} />
                      </div>

                      <div className="space-y-5 px-5 pb-5">
                        <div>
                          <p className="text-[12px] font-medium text-[#86868b]">
                            Recipient
                          </p>
                          <p className="mt-1 text-[15px] font-semibold">
                            {recipient.fullName || "Unknown recipient"}
                          </p>
                          <p className="mt-0.5 break-all text-[13px] text-[#6e6e73]">
                            {recipient.email || "No email"}
                          </p>
                          <p className="mt-0.5 text-[13px] text-[#6e6e73]">
                            {recipient.phoneNumber || "No phone number"}
                          </p>
                          {recipient.address && (
                            <p className="mt-0.5 text-[13px] text-[#86868b]">
                              {recipient.address}
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-2xl bg-[#f5f5f7] p-3.5">
                            <p className="text-[12px] text-[#86868b]">
                              Requested
                            </p>
                            <p className="mt-1 text-[16px] font-semibold tabular-nums">
                              {request.quantityRequested ?? "—"}{" "}
                              <span className="text-[13px] font-normal text-[#6e6e73]">
                                {donation.quantityUnit || "units"}
                              </span>
                            </p>
                          </div>
                          <div className="rounded-2xl bg-[#f5f5f7] p-3.5">
                            <p className="text-[12px] text-[#86868b]">Donor</p>
                            <p className="mt-1 truncate text-[16px] font-semibold">
                              {donor.fullName || "Unknown donor"}
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="text-[12px] font-medium text-[#86868b]">
                            Message
                          </p>
                          <p className="mt-1 whitespace-pre-wrap break-words text-[14px] leading-5 text-[#424245]">
                            {request.message || "No message provided"}
                          </p>
                        </div>

                        <div className="space-y-1 text-[12px] text-[#86868b]">
                          <p className="break-all">Request ID: {request._id}</p>
                          <p>Submitted {formatDate(request.createdAt)}</p>
                          {request.respondedAt && (
                            <p>Responded {formatDate(request.respondedAt)}</p>
                          )}
                          <p>Donation status: {donation.status || "—"}</p>
                        </div>

                        <div className="border-t border-[#f0f0f2] pt-4">
                          <RequestActions
                            request={request}
                            busy={busy}
                            onEdit={openEdit}
                            onStatus={handleStatusChange}
                            onDelete={handleDelete}
                          />
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </section>

        <footer className="flex flex-col gap-1 border-t border-[#e8e8ed] px-5 py-6 text-[12px] text-[#86868b] sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <span>
            {filteredRequests.length} request
            {filteredRequests.length === 1 ? "" : "s"} shown
          </span>
          <span>Data is loaded from the MealBridge API.</span>
        </footer>
      </main>

      {/* Edit sheet */}
      {selectedRequest && editDetails && (
        <div
          className="mb-fade fixed inset-0 z-50 flex items-end justify-center bg-black/35 backdrop-blur-sm md:items-stretch md:justify-end"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeEdit();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-request-title"
            className="mb-sheet flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[28px] bg-white shadow-[0_-8px_60px_rgba(0,0,0,0.25)] md:max-h-none md:w-[480px] md:rounded-none md:rounded-l-[28px]"
          >
            <div className="flex items-start justify-between px-6 pb-4 pt-6 sm:px-8 sm:pt-8">
              <div className="min-w-0">
                <h2
                  id="edit-request-title"
                  className="text-[28px] font-semibold leading-tight tracking-[-0.03em]"
                >
                  Edit request
                </h2>
                <p className="mt-1 truncate text-[15px] text-[#6e6e73]">
                  {editDetails.donation.foodName || "Selected donation"} ·{" "}
                  {editDetails.recipient.fullName || "Unknown recipient"}
                </p>
              </div>

              <button
                type="button"
                onClick={closeEdit}
                disabled={saving}
                aria-label="Close edit dialog"
                className="ml-4 rounded-full bg-[#f5f5f7] p-2 text-[#6e6e73] transition hover:bg-[#ebebed] hover:text-[#1d1d1f] disabled:opacity-50"
              >
                <Icon name="close" className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={handleEdit}
              className="flex flex-1 flex-col overflow-y-auto"
            >
              <div className="flex-1 space-y-6 px-6 pb-6 pt-2 sm:px-8">
                <div>
                  <label
                    htmlFor="edit-quantity"
                    className="mb-2 block text-[13px] font-medium text-[#6e6e73]"
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
                    className="w-full rounded-2xl bg-[#f5f5f7] px-4 py-3.5 text-[17px] outline-none transition duration-300 focus:bg-white focus:shadow-[0_0_0_4px_rgba(0,113,227,0.18)] focus:ring-1 focus:ring-[#0071e3]"
                  />
                  <p className="mt-2 text-[12px] leading-5 text-[#86868b]">
                    Unit: {editDetails.donation.quantityUnit || "units"}
                    {editDetails.donation.quantity != null &&
                      ` · ${editDetails.donation.quantity} available`}
                    . The server checks the available donation quantity.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="edit-message"
                    className="mb-2 block text-[13px] font-medium text-[#6e6e73]"
                  >
                    Recipient message
                  </label>
                  <textarea
                    id="edit-message"
                    rows={5}
                    value={editMessage}
                    onChange={(event) => setEditMessage(event.target.value)}
                    placeholder="Add a message"
                    className="w-full resize-y rounded-2xl bg-[#f5f5f7] px-4 py-3.5 text-[15px] leading-6 outline-none transition duration-300 placeholder:text-[#a1a1a6] focus:bg-white focus:shadow-[0_0_0_4px_rgba(0,113,227,0.18)] focus:ring-1 focus:ring-[#0071e3]"
                  />
                </div>
              </div>

              <div className="flex gap-3 border-t border-[#f0f0f2] bg-white/90 px-6 py-5 backdrop-blur sm:px-8">
                <button
                  type="button"
                  onClick={closeEdit}
                  disabled={saving}
                  className="flex-1 rounded-full bg-[#f5f5f7] px-5 py-3 text-[15px] font-medium transition hover:bg-[#ebebed] active:scale-[0.98] disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#0071e3] px-5 py-3 text-[15px] font-medium text-white transition hover:bg-[#0077ed] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  )}
                  {saving ? "Saving" : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation dialog */}
      {confirmState && (
        <div
          className="mb-fade fixed inset-0 z-[65] flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setConfirmState(null);
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            className="mb-pop w-full max-w-[340px] overflow-hidden rounded-[22px] bg-white/95 text-center shadow-[0_20px_70px_rgba(0,0,0,0.3)] backdrop-blur-xl"
          >
            <div className="px-6 pb-5 pt-7">
              <h3
                id="confirm-title"
                className="text-[18px] font-semibold tracking-[-0.01em]"
              >
                {confirmState.title}
              </h3>
              <p className="mt-2 text-[14px] leading-5 text-[#6e6e73]">
                {confirmState.message}
              </p>
            </div>
            <div className="grid grid-cols-2 border-t border-[#e8e8ed]">
              <button
                type="button"
                onClick={() => setConfirmState(null)}
                className="border-r border-[#e8e8ed] py-3.5 text-[16px] text-[#0071e3] transition hover:bg-[#f5f5f7]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const action = confirmState.onConfirm;
                  setConfirmState(null);
                  action();
                }}
                className={`py-3.5 text-[16px] font-semibold transition hover:bg-[#f5f5f7] ${
                  confirmState.tone === "danger"
                    ? "text-[#d70015]"
                    : "text-[#0071e3]"
                }`}
              >
                {confirmState.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Receipients;
