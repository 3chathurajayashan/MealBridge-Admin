import React, { useCallback, useEffect, useRef, useState } from "react";

/* ───────────────────────── API ───────────────────────── */

const API_BASE = "http://localhost:5001/api/delivery";

const getToken = () => localStorage.getItem("mealbridge-admin-token");

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

const request = async (path, options = {}) => {
  const token = getToken();

  if (!token) {
    throw new Error("Admin access token is missing. Please sign in again.");
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...getHeaders(), ...options.headers },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw new Error(
      data.message || `Request failed with status ${response.status}`,
    );
  }

  return data;
};

/* ───────────────────────── Helpers ───────────────────────── */

const formatDate = (date) => {
  if (!date) return "—";
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? "—" : parsed.toLocaleString();
};

const getName = (user) =>
  user?.fullName ||
  [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
  "Unknown";

const STATUS = {
  PENDING: { pill: "bg-[#fff4e0] text-[#b25e00]", dot: "bg-[#ff9f0a]" },
  ACCEPTED: { pill: "bg-[#e8f2ff] text-[#0066cc]", dot: "bg-[#0a84ff]" },
  PICKED_UP: { pill: "bg-[#f1e8fb] text-[#7a3fb5]", dot: "bg-[#bf5af2]" },
  IN_TRANSIT: { pill: "bg-[#e9ebff] text-[#4b4fc9]", dot: "bg-[#5e5ce6]" },
  DELIVERED: { pill: "bg-[#e6f7ec] text-[#1d7a3a]", dot: "bg-[#30d158]" },
  CANCELLED: { pill: "bg-[#ffecea] text-[#c4281c]", dot: "bg-[#ff453a]" },
};

const getStatus = (status) =>
  STATUS[status] || {
    pill: "bg-[#f0f0f2] text-[#6e6e73]",
    dot: "bg-[#86868b]",
  };

const getCoordinates = (location) => {
  if (!location) return "Location unavailable";
  const { latitude, longitude } = location;
  if (latitude == null || longitude == null) return "Location unavailable";
  return `${latitude}, ${longitude}`;
};

/* Animated number: eases from the previous value to the next one. */
function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0);
  const from = useRef(0);

  useEffect(() => {
    const end = Number(target) || 0;
    const start = from.current;
    const reduce = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduce || start === end) {
      setValue(end);
      from.current = end;
      return;
    }

    let raf;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4); // easeOutQuart
      setValue(Math.round(start + (end - start) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
      else from.current = end;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}

/* ───────────────────────── Icons ───────────────────────── */

const Icon = ({ d, className = "h-5 w-5", strokeWidth = 1.7 }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d={d} />
  </svg>
);

const ICONS = {
  box: "M21 8l-9-5-9 5v8l9 5 9-5V8zM3.3 7.7L12 12.5l8.7-4.8M12 12.5V21",
  clock: "M12 7v5l3 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  truck:
    "M3 6h11v10H3zM14 9h4l3 3v4h-7M7 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM17 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3z",
  check: "M5 12.5l4.5 4.5L19 7.5",
  refresh: "M20 11a8 8 0 00-14.9-3M4 4v4h4M4 13a8 8 0 0014.9 3M20 20v-4h-4",
  pin: "M12 21s7-6.2 7-11.5A7 7 0 005 9.5C5 14.8 12 21 12 21zM12 12a2.5 2.5 0 100-5 2.5 2.5 0 000 5z",
  home: "M4 11l8-7 8 7v9a1 1 0 01-1 1h-4v-6H9v6H5a1 1 0 01-1-1v-9z",
  chevron: "M6 9l6 6 6-6",
  close: "M6 6l12 12M18 6L6 18",
  alert:
    "M12 8v5M12 16.5v.01M10.3 3.9L2.4 17.6A2 2 0 004.1 20.6h15.8a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z",
};

/* ───────────────────────── Styles ───────────────────────── */

const STYLES = `
.mb {
  --ease: cubic-bezier(0.28, 0.11, 0.32, 1);
  --spring: cubic-bezier(0.32, 0.72, 0, 1);
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text",
    "Helvetica Neue", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  letter-spacing: -0.011em;
  color: #1d1d1f;
  background: #f5f5f7;
}
.mb *:focus-visible { outline: 2px solid #0071e3; outline-offset: 2px; }

@keyframes mb-rise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
@keyframes mb-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes mb-pop  { from { opacity: 0; transform: translateY(-10px) scale(.98); } to { opacity: 1; transform: none; } }
@keyframes mb-spin { to { transform: rotate(360deg); } }
@keyframes mb-shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }

.mb-rise { opacity: 0; animation: mb-rise .9s var(--ease) forwards; animation-delay: calc(var(--i, 0) * 70ms); }
.mb-pop  { animation: mb-pop .5s var(--spring) both; }
.mb-spin { animation: mb-spin .9s linear infinite; }

.mb-skeleton {
  background: linear-gradient(90deg, #ececef 25%, #f6f6f8 37%, #ececef 63%);
  background-size: 400% 100%;
  animation: mb-shimmer 1.6s ease infinite;
}

.mb-card { transition: transform .6s var(--ease), box-shadow .6s var(--ease); }
.mb-card:hover { transform: translateY(-2px); box-shadow: 0 18px 40px -18px rgba(0,0,0,.18); }

/* Expand / collapse without measuring heights */
.mb-expand { display: grid; grid-template-rows: 0fr; opacity: 0; transition: grid-template-rows .7s var(--spring), opacity .5s var(--ease); }
.mb-expand[data-open="true"] { grid-template-rows: 1fr; opacity: 1; }
.mb-expand > div { overflow: hidden; min-height: 0; }

.mb-btn { transition: background-color .3s var(--ease), transform .3s var(--ease), opacity .3s var(--ease); }
.mb-btn:active:not(:disabled) { transform: scale(.97); }

.mb-thumb { transition: transform .5s var(--spring); }

.mb-glass {
  background: rgba(245,245,247,.72);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  backdrop-filter: saturate(180%) blur(20px);
}

@media (prefers-reduced-motion: reduce) {
  .mb *, .mb *::before, .mb *::after {
    animation-duration: .01ms !important;
    animation-delay: 0ms !important;
    transition-duration: .01ms !important;
  }
  .mb-rise { opacity: 1; }
}
`;

/* ───────────────────────── Small components ───────────────────────── */

function StatTile({ label, value, icon, index }) {
  const display = useCountUp(value);

  return (
    <div
      className="mb-rise rounded-[22px] bg-white p-6"
      style={{ "--i": index + 2 }}
    >
      <div className="flex items-center justify-between text-[#6e6e73]">
        <p className="text-[13px] font-medium">{label}</p>
        <Icon d={ICONS[icon]} className="h-[18px] w-[18px]" />
      </div>
      <p className="mt-4 text-[44px] font-semibold leading-none tracking-[-0.03em] tabular-nums">
        {display}
      </p>
    </div>
  );
}

function Field({ label, children, hint }) {
  return (
    <div>
      <p className="text-xs font-medium text-[#86868b]">{label}</p>
      <div className="mt-1 text-[15px] leading-6 text-[#1d1d1f]">
        {children}
      </div>
      {hint && <p className="mt-0.5 text-xs text-[#86868b]">{hint}</p>}
    </div>
  );
}

function PhoneLink({ number }) {
  if (!number) return null;
  return (
    <a
      href={`tel:${number}`}
      className="block text-[15px] text-[#0066cc] hover:underline"
    >
      {number}
    </a>
  );
}

function Banner({ tone, children, onClose }) {
  const isError = tone === "error";
  return (
    <div
      role={isError ? "alert" : "status"}
      className={`mb-pop flex items-center gap-3 rounded-2xl px-5 py-4 text-[15px] ${
        isError ? "bg-[#ffecea] text-[#c4281c]" : "bg-[#e6f7ec] text-[#1d7a3a]"
      }`}
    >
      <Icon
        d={isError ? ICONS.alert : ICONS.check}
        className="h-5 w-5 shrink-0"
      />
      <p className="flex-1 font-medium">{children}</p>
      <button
        onClick={onClose}
        aria-label="Dismiss"
        className="rounded-full p-1 transition hover:bg-black/5"
      >
        <Icon d={ICONS.close} className="h-4 w-4" />
      </button>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-[28px] bg-white p-8">
      <div className="flex gap-5">
        <div className="mb-skeleton h-20 w-20 rounded-2xl" />
        <div className="flex-1 space-y-3 pt-1">
          <div className="mb-skeleton h-5 w-1/3 rounded-full" />
          <div className="mb-skeleton h-4 w-1/4 rounded-full" />
          <div className="mb-skeleton h-3 w-1/2 rounded-full" />
        </div>
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="mb-skeleton h-24 rounded-2xl" />
        <div className="mb-skeleton h-24 rounded-2xl" />
      </div>
    </div>
  );
}

/* ───────────────────────── Main component ───────────────────────── */

function AssignDelivery() {
  const [activeTab, setActiveTab] = useState("pending");
  const [pendingDeliveries, setPendingDeliveries] = useState([]);
  const [allDeliveries, setAllDeliveries] = useState([]);
  const [summary, setSummary] = useState({});
  const [volunteers, setVolunteers] = useState({});
  const [selectedVolunteers, setSelectedVolunteers] = useState({});
  const [expandedDelivery, setExpandedDelivery] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadingVolunteers, setLoadingVolunteers] = useState({});
  const [assigning, setAssigning] = useState({});
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadDeliveries = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [pendingResult, allResult] = await Promise.all([
        request("/admin/pending"),
        request("/admin/all"),
      ]);

      setPendingDeliveries(pendingResult.deliveries || []);
      setAllDeliveries(allResult.deliveries || []);
      setSummary(allResult.summary || {});
    } catch (err) {
      setError(err.message || "Failed to load deliveries.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDeliveries();
  }, [loadDeliveries]);

  const loadVolunteers = async (deliveryId) => {
    setExpandedDelivery(deliveryId);
    setError("");
    setNotice("");

    // Reuse the current result when the admin reopens the same delivery.
    if (volunteers[deliveryId]) return;

    setLoadingVolunteers((p) => ({ ...p, [deliveryId]: true }));

    try {
      const data = await request(
        `/admin/${encodeURIComponent(deliveryId)}/volunteers`,
      );
      setVolunteers((p) => ({ ...p, [deliveryId]: data.volunteers || [] }));
    } catch (err) {
      setError(err.message || "Failed to load nearby volunteers.");
    } finally {
      setLoadingVolunteers((p) => ({ ...p, [deliveryId]: false }));
    }
  };

  const assignVolunteer = async (deliveryId) => {
    const volunteerId = selectedVolunteers[deliveryId];

    if (!volunteerId) {
      setError("Please select a volunteer before assigning.");
      return;
    }

    const confirmed = window.confirm(
      "Assign this delivery to the selected volunteer?",
    );
    if (!confirmed) return;

    setAssigning((p) => ({ ...p, [deliveryId]: true }));
    setError("");
    setNotice("");

    try {
      const data = await request(
        `/admin/${encodeURIComponent(deliveryId)}/assign`,
        { method: "PUT", body: JSON.stringify({ volunteerId }) },
      );

      setNotice(data.message || "Delivery assigned successfully.");

      setVolunteers((p) => {
        const updated = { ...p };
        delete updated[deliveryId];
        return updated;
      });

      setSelectedVolunteers((p) => {
        const updated = { ...p };
        delete updated[deliveryId];
        return updated;
      });

      setExpandedDelivery(null);

      // Refresh both tabs so the delivery moves out of Pending.
      await loadDeliveries();
    } catch (err) {
      setError(err.message || "Failed to assign delivery.");
    } finally {
      setAssigning((p) => ({ ...p, [deliveryId]: false }));
    }
  };

  const deliveries =
    activeTab === "pending" ? pendingDeliveries : allDeliveries;

  const statCards = [
    {
      label: "Total deliveries",
      value: summary.total ?? allDeliveries.length,
      icon: "box",
    },
    {
      label: "Awaiting assignment",
      value: summary.pending ?? pendingDeliveries.length,
      icon: "clock",
    },
    { label: "Assigned", value: summary.assigned ?? 0, icon: "truck" },
    { label: "Delivered", value: summary.delivered ?? 0, icon: "check" },
  ];

  const tabs = [
    {
      key: "pending",
      label: "Pending assignment",
      count: pendingDeliveries.length,
    },
    { key: "all", label: "All deliveries" },
  ];
  const activeIndex = tabs.findIndex((t) => t.key === activeTab);

  return (
    <div className="mb min-h-screen">
      <style>{STYLES}</style>

      {/* Global navigation */}
      <header className="mb-glass sticky top-0 z-30 border-b border-black/[0.08]">
        <div className="mx-auto flex h-12 max-w-[1080px] items-center justify-between px-5">
          <div className="flex items-center gap-2 text-[15px] font-semibold">
            <span className="h-2 w-2 rounded-full bg-[#30d158]" />
            MealBridge
            <span className="font-normal text-[#6e6e73]">Admin</span>
          </div>

          <button
            onClick={() => {
              setNotice("");
              loadDeliveries();
            }}
            disabled={loading}
            className="mb-btn inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium text-[#0066cc] hover:bg-black/5 disabled:opacity-50"
          >
            <Icon
              d={ICONS.refresh}
              className={`h-4 w-4 ${loading ? "mb-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1080px] px-5 pb-24 pt-14 sm:pt-20">
        {/* Hero */}
        <section className="mb-rise mx-auto max-w-3xl text-center">
          <h1 className="text-[40px] font-semibold leading-[1.07] tracking-[-0.035em] sm:text-[64px]">
            Delivery management.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-7 text-[#6e6e73] sm:text-[21px] sm:leading-8">
            Match every donation with the closest volunteer and follow it all
            the way to the door.
          </p>
        </section>

        {/* Stats */}
        <section className="mt-14 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {statCards.map((stat, i) => (
            <StatTile key={stat.label} {...stat} index={i} />
          ))}
        </section>

        {/* Alerts */}
        <div className="mt-6 space-y-3">
          {error && (
            <Banner tone="error" onClose={() => setError("")}>
              {error}
            </Banner>
          )}
          {notice && (
            <Banner tone="success" onClose={() => setNotice("")}>
              {notice}
            </Banner>
          )}
        </div>

        {/* Segmented control */}
        <div
          className="mb-rise mt-10 flex flex-wrap items-center justify-between gap-4"
          style={{ "--i": 6 }}
        >
          <div
            role="tablist"
            className="relative grid grid-cols-2 rounded-full bg-[#e8e8ed] p-1"
          >
            <span
              className="mb-thumb absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,.14)]"
              style={{ transform: `translateX(${activeIndex * 100}%)` }}
            />
            {tabs.map((tab) => (
              <button
                key={tab.key}
                role="tab"
                aria-selected={activeTab === tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative z-10 whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition-colors duration-300 ${
                  activeTab === tab.key ? "text-[#1d1d1f]" : "text-[#6e6e73]"
                }`}
              >
                {tab.label}
                {tab.count != null && (
                  <span className="ml-2 rounded-full bg-[#0071e3] px-1.5 py-0.5 text-[11px] font-semibold text-white">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <span className="text-sm text-[#6e6e73]">
            {deliveries.length} {deliveries.length === 1 ? "record" : "records"}
          </span>
        </div>

        {/* Delivery list */}
        <section className="mt-6">
          {loading ? (
            <div className="space-y-5">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : deliveries.length === 0 ? (
            <div className="mb-pop rounded-[28px] bg-white px-6 py-24 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f5f5f7] text-[#6e6e73]">
                <Icon d={ICONS.box} className="h-7 w-7" />
              </div>
              <h2 className="mt-6 text-2xl font-semibold tracking-tight">
                {activeTab === "pending"
                  ? "Nothing waiting for a volunteer."
                  : "No deliveries yet."}
              </h2>
              <p className="mx-auto mt-2 max-w-md text-[15px] leading-6 text-[#6e6e73]">
                {activeTab === "pending"
                  ? "Accepted food requests appear here as soon as a delivery is ready to be assigned."
                  : "Deliveries show up here as food requests are accepted and processed."}
              </p>
            </div>
          ) : (
            <div key={activeTab} className="space-y-5">
              {deliveries.map((delivery, index) => {
                const id = delivery._id;
                const donation = delivery.donation || {};
                const donor = donation.donor || {};
                const recipient = delivery.recipient || {};
                const volunteer = delivery.volunteer || {};
                const foodRequest = delivery.foodRequest || {};
                const status = getStatus(delivery.status);

                const isExpanded = expandedDelivery === id;
                const isPending =
                  delivery.status === "PENDING" && !delivery.volunteer;

                return (
                  <article
                    key={id}
                    className="mb-card mb-rise overflow-hidden rounded-[28px] bg-white"
                    style={{ "--i": Math.min(index, 8) }}
                  >
                    {/* Heading */}
                    <div className="flex flex-col justify-between gap-5 p-6 sm:flex-row sm:items-start sm:p-8">
                      <div className="flex min-w-0 items-start gap-5">
                        {donation.foodImage?.url ? (
                          <img
                            src={donation.foodImage.url}
                            alt={donation.foodName || "Donated food"}
                            className="h-20 w-20 shrink-0 rounded-2xl object-cover"
                          />
                        ) : (
                          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#f5f5f7] text-[#86868b]">
                            <Icon
                              d={ICONS.box}
                              className="h-8 w-8"
                              strokeWidth={1.4}
                            />
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-3">
                            <h2 className="text-[22px] font-semibold tracking-[-0.02em]">
                              {donation.foodName || "Food donation"}
                            </h2>
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${status.pill}`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                              />
                              {(delivery.status || "UNKNOWN").replaceAll(
                                "_",
                                " ",
                              )}
                            </span>
                          </div>

                          <p className="mt-1 text-[15px] text-[#6e6e73]">
                            {donation.category || "Uncategorized"} ·{" "}
                            {foodRequest.quantityRequested ??
                              donation.quantity ??
                              "—"}{" "}
                            {donation.quantityUnit || "units"}
                          </p>

                          <p className="mt-2 break-all text-xs text-[#a1a1a6]">
                            Delivery ID: {id}
                          </p>
                        </div>
                      </div>

                      {isPending ? (
                        <button
                          onClick={() =>
                            isExpanded
                              ? setExpandedDelivery(null)
                              : loadVolunteers(id)
                          }
                          aria-expanded={isExpanded}
                          className="mb-btn inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#0071e3] px-5 py-2.5 text-[15px] font-medium text-white hover:bg-[#0077ed]"
                        >
                          {isExpanded ? "Close" : "Find volunteers"}
                          <Icon
                            d={ICONS.chevron}
                            className="h-4 w-4 transition-transform duration-500 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)]"
                            strokeWidth={2.2}
                          />
                        </button>
                      ) : (
                        <div className="rounded-2xl bg-[#f5f5f7] px-5 py-3.5 sm:min-w-[200px]">
                          <p className="text-xs font-medium text-[#86868b]">
                            Assigned volunteer
                          </p>
                          <p className="mt-1 text-[15px] font-semibold">
                            {delivery.volunteer
                              ? getName(volunteer)
                              : "Not assigned"}
                          </p>
                          <PhoneLink number={volunteer.phoneNumber} />
                        </div>
                      )}
                    </div>

                    {/* Pickup & recipient */}
                    <div className="grid gap-8 border-t border-[#f0f0f2] p-6 sm:p-8 md:grid-cols-2">
                      <div className="space-y-5">
                        <h3 className="flex items-center gap-2 text-[15px] font-semibold">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fff4e0] text-[#b25e00]">
                            <Icon d={ICONS.pin} className="h-4 w-4" />
                          </span>
                          Pickup
                        </h3>

                        <Field label="Donor">
                          <p className="font-medium">{getName(donor)}</p>
                          <PhoneLink number={donor.phoneNumber} />
                        </Field>

                        <Field
                          label="Address"
                          hint={`Coordinates: ${getCoordinates(
                            delivery.pickupLocation || donation.pickupLocation,
                          )}`}
                        >
                          {delivery.pickupAddress ||
                            donation.pickupAddress ||
                            "Address unavailable"}
                        </Field>
                      </div>

                      <div className="space-y-5">
                        <h3 className="flex items-center gap-2 text-[15px] font-semibold">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8f2ff] text-[#0066cc]">
                            <Icon d={ICONS.home} className="h-4 w-4" />
                          </span>
                          Drop-off
                        </h3>

                        <Field label="Recipient">
                          <p className="font-medium">{getName(recipient)}</p>
                          <PhoneLink number={recipient.phoneNumber} />
                        </Field>

                        <Field
                          label="Address"
                          hint={`Coordinates: ${getCoordinates(
                            delivery.deliveryLocation || recipient.location,
                          )}`}
                        >
                          {delivery.deliveryAddress ||
                            recipient.address ||
                            "Address unavailable"}
                        </Field>
                      </div>
                    </div>

                    {/* Extra info */}
                    <div className="grid gap-5 bg-[#fbfbfd] p-6 sm:grid-cols-3 sm:p-8">
                      <Field label="Quantity requested">
                        <span className="font-medium">
                          {foodRequest.quantityRequested ?? "—"}{" "}
                          {donation.quantityUnit || ""}
                        </span>
                      </Field>
                      <Field label="Requested">
                        <span className="font-medium">
                          {formatDate(
                            foodRequest.createdAt || delivery.createdAt,
                          )}
                        </span>
                      </Field>
                      <Field label="Assigned">
                        <span className="font-medium">
                          {formatDate(delivery.acceptedAt)}
                        </span>
                      </Field>

                      {foodRequest.message && (
                        <div className="sm:col-span-3">
                          <Field label="Message from recipient">
                            <span className="text-[#515154]">
                              {foodRequest.message}
                            </span>
                          </Field>
                        </div>
                      )}
                    </div>

                    {/* Volunteer picker (animated expand) */}
                    {isPending && (
                      <div
                        className="mb-expand"
                        data-open={isExpanded}
                        aria-hidden={!isExpanded}
                        inert={!isExpanded ? "" : undefined}
                      >
                        <div>
                          <div className="border-t border-[#f0f0f2] p-6 sm:p-8">
                            <h3 className="text-[22px] font-semibold tracking-[-0.02em]">
                              Nearby volunteers
                            </h3>
                            <p className="mt-1 text-[15px] text-[#6e6e73]">
                              Ranked by straight-line distance from the pickup
                              location.
                            </p>

                            <div className="mt-6">
                              {loadingVolunteers[id] ? (
                                <div className="space-y-3">
                                  {[0, 1, 2].map((n) => (
                                    <div
                                      key={n}
                                      className="mb-skeleton h-[76px] rounded-2xl"
                                    />
                                  ))}
                                </div>
                              ) : volunteers[id]?.length ? (
                                <div className="space-y-3">
                                  {volunteers[id].map((person) => {
                                    const selected =
                                      selectedVolunteers[id] === person._id;

                                    return (
                                      <button
                                        type="button"
                                        key={person._id}
                                        onClick={() =>
                                          setSelectedVolunteers((p) => ({
                                            ...p,
                                            [id]: person._id,
                                          }))
                                        }
                                        aria-pressed={selected}
                                        className={`flex w-full flex-col justify-between gap-4 rounded-2xl p-4 text-left transition-all duration-500 [transition-timing-function:cubic-bezier(0.28,0.11,0.32,1)] sm:flex-row sm:items-center ${
                                          selected
                                            ? "bg-[#f2f8ff] shadow-[inset_0_0_0_2px_#0071e3]"
                                            : "bg-[#f5f5f7] shadow-[inset_0_0_0_2px_transparent] hover:bg-[#ededf0]"
                                        }`}
                                      >
                                        <div className="flex items-center gap-4">
                                          <div
                                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors duration-500 ${
                                              selected
                                                ? "bg-[#0071e3] text-white"
                                                : "bg-white text-[#6e6e73]"
                                            }`}
                                          >
                                            {getName(person)
                                              .split(" ")
                                              .map((part) => part[0])
                                              .slice(0, 2)
                                              .join("")
                                              .toUpperCase()}
                                          </div>

                                          <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                              <p className="text-[15px] font-semibold">
                                                {getName(person)}
                                              </p>
                                              {person.recommendedRank === 1 && (
                                                <span className="rounded-full bg-[#e6f7ec] px-2 py-0.5 text-xs font-semibold text-[#1d7a3a]">
                                                  Nearest
                                                </span>
                                              )}
                                            </div>
                                            <p className="mt-0.5 text-[13px] text-[#6e6e73]">
                                              {person.email ||
                                                "No email provided"}
                                            </p>
                                            <p className="text-[13px] text-[#6e6e73]">
                                              {person.phoneNumber ||
                                                "No phone provided"}
                                            </p>
                                          </div>
                                        </div>

                                        <div className="flex items-center justify-between gap-5 sm:justify-end">
                                          <div className="text-left sm:text-right">
                                            <p className="text-xl font-semibold tracking-tight">
                                              {person.pickupDistanceKm} km
                                            </p>
                                            <p className="text-xs text-[#86868b]">
                                              from pickup
                                            </p>
                                            {person.dropoffDistanceKm !=
                                              null && (
                                              <p className="mt-0.5 text-xs text-[#6e6e73]">
                                                {person.dropoffDistanceKm} km to
                                                drop-off
                                              </p>
                                            )}
                                          </div>

                                          <span
                                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all duration-500 ${
                                              selected
                                                ? "scale-100 bg-[#0071e3] text-white"
                                                : "scale-90 bg-white shadow-[inset_0_0_0_1.5px_#d2d2d7]"
                                            }`}
                                          >
                                            <Icon
                                              d={ICONS.check}
                                              strokeWidth={2.6}
                                              className={`h-3.5 w-3.5 transition-all duration-500 ${
                                                selected
                                                  ? "scale-100 opacity-100"
                                                  : "scale-50 opacity-0"
                                              }`}
                                            />
                                          </span>
                                        </div>
                                      </button>
                                    );
                                  })}

                                  <div className="flex flex-col justify-between gap-4 pt-4 sm:flex-row sm:items-center">
                                    <p className="text-sm text-[#6e6e73]">
                                      {selectedVolunteers[id]
                                        ? "Volunteer selected. Confirm to assign."
                                        : "Select a volunteer to continue."}
                                    </p>

                                    <button
                                      onClick={() => assignVolunteer(id)}
                                      disabled={
                                        !selectedVolunteers[id] || assigning[id]
                                      }
                                      className="mb-btn inline-flex items-center justify-center gap-2 rounded-full bg-[#0071e3] px-6 py-3 text-[15px] font-medium text-white hover:bg-[#0077ed] disabled:cursor-not-allowed disabled:bg-[#d2d2d7] disabled:text-white/80"
                                    >
                                      {assigning[id] && (
                                        <span className="mb-spin h-4 w-4 rounded-full border-2 border-white/40 border-t-white" />
                                      )}
                                      {assigning[id]
                                        ? "Assigning…"
                                        : "Confirm assignment"}
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="rounded-2xl bg-[#f5f5f7] p-6">
                                  <p className="text-[17px] font-semibold">
                                    No eligible volunteers found.
                                  </p>
                                  <p className="mt-1.5 text-[15px] leading-6 text-[#6e6e73]">
                                    Make sure volunteers have valid latitude and
                                    longitude in their profiles and don't
                                    already have an active delivery.
                                  </p>
                                  <button
                                    onClick={() => {
                                      setVolunteers((p) => {
                                        const updated = { ...p };
                                        delete updated[id];
                                        return updated;
                                      });
                                      loadVolunteers(id);
                                    }}
                                    className="mt-4 text-[15px] font-medium text-[#0066cc] hover:underline"
                                  >
                                    Try again
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default AssignDelivery;
