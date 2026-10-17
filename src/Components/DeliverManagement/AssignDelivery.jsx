import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion } from "framer-motion";
import { MapPin, Navigation, Package, Phone, Search } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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

/* ───────────────────────── Map component (Leaflet) ───────────────────────── */
/* ───────────── Location helpers ─────────────
   Accepts {latitude, longitude}, {lat, lng}, or GeoJSON {coordinates:[lng,lat]} */

const toPoint = (loc) => {
  if (!loc || typeof loc !== "object") return null;

  let lat = loc.latitude ?? loc.lat;
  let lng = loc.longitude ?? loc.lng ?? loc.lon;

  if (Array.isArray(loc.coordinates) && loc.coordinates.length >= 2) {
    [lng, lat] = loc.coordinates;
  }

  if (lat == null || lng == null) return null;

  lat = Number(lat);
  lng = Number(lng);

  if (
    Number.isNaN(lat) ||
    Number.isNaN(lng) ||
    Math.abs(lat) > 90 ||
    Math.abs(lng) > 180 ||
    (lat === 0 && lng === 0)
  ) {
    return null;
  }

  return [lat, lng];
};

/* A user may keep coordinates under location, currentLocation, or at the top level. */
const userPoint = (user) =>
  toPoint(user?.location) || toPoint(user?.currentLocation) || toPoint(user);

const userName = (user) =>
  user?.fullName ||
  [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
  "Volunteer";

/* ───────────── Styling ───────────── */

const COLORS = {
  pickup: "#ff9f0a",
  dropoff: "#0a84ff",
  volunteer: "#30d158",
  candidate: "#86868b",
  selected: "#0071e3",
};

const FONT =
  "-apple-system,BlinkMacSystemFont,'SF Pro Text',Helvetica,Arial,sans-serif";

// Marker text is placed into HTML, so keep letters/numbers only.
const safeLabel = (text) =>
  String(text ?? "")
    .replace(/[^\p{L}\p{N}]/gu, "")
    .slice(0, 2);

const pin = (color, text, size = 32, pulse = false) =>
  L.divIcon({
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${color};color:#fff;border:3px solid #fff;
      display:flex;align-items:center;justify-content:center;
      font:600 ${size > 30 ? 13 : 12}px ${FONT};
      box-shadow:0 4px 12px rgba(0,0,0,.28)${
        pulse ? `,0 0 0 6px ${color}33` : ""
      };">${safeLabel(text)}</div>`,
  });

const popupNode = (title, subtitle) => {
  const wrap = document.createElement("div");
  wrap.style.cssText = `font-family:${FONT};min-width:120px`;
  const t = document.createElement("div");
  t.textContent = title;
  t.style.cssText = "font-weight:600;font-size:13px;color:#1d1d1f";
  wrap.appendChild(t);
  if (subtitle) {
    const s = document.createElement("div");
    s.textContent = subtitle;
    s.style.cssText = "font-size:12px;color:#6e6e73;margin-top:2px";
    wrap.appendChild(s);
  }
  return wrap;
};

const LEGEND = [
  { key: "pickup", label: "Pickup", color: COLORS.pickup },
  { key: "dropoff", label: "Drop-off", color: COLORS.dropoff },
  { key: "volunteer", label: "Volunteer", color: COLORS.volunteer },
];

const TILES = {
  street: {
    // Free, no API key. (CARTO now stamps "API KEY REQUIRED" on keyless tiles.)
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    options: {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    options: {
      maxZoom: 19,
      attribution: "Tiles &copy; Esri, Maxar, Earthstar Geographics",
    },
  },
};

const fitPoints = (map, pts) => {
  if (!map || !pts?.length) return;
  if (pts.length === 1) {
    map.setView(pts[0], 15);
  } else {
    map.fitBounds(L.latLngBounds(pts), {
      padding: [56, 56],
      maxZoom: 16,
      animate: true,
    });
  }
};

/* ───────────── Component ───────────── */

function DeliveryMap({
  pickup, // location object
  dropoff, // location object
  volunteer, // assigned volunteer (user object)
  candidates = [], // volunteers; optional markerColor, markerLabel, subtitle
  selectedId, // highlighted candidate _id
  onSelectCandidate, // (id) => void, fired when a marker is clicked
  height = 300,
  fill = false, // true: fill a positioned parent instead of using `height`
  legend = true,
  candidateLabel = "Nearby volunteers",
  satellite = false,
  recenterKey = 0, // change this number to re-fit the view
  focusSelected = false, // zoom to selected candidate + its pickup/drop-off
}) {
  const elRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const tileRef = useRef(null);
  const boundsRef = useRef([]);
  const fitKeyRef = useRef("");
  const onSelectRef = useRef(onSelectCandidate);
  onSelectRef.current = onSelectCandidate;

  const pickupPt = toPoint(pickup);
  const dropoffPt = toPoint(dropoff);
  const volunteerPt = volunteer ? userPoint(volunteer) : null;

  const candidatePts = (candidates || [])
    .map((c) => ({ person: c, pt: userPoint(c) }))
    .filter((c) => c.pt);

  const hasAnything =
    pickupPt || dropoffPt || volunteerPt || candidatePts.length > 0;

  // "position" key decides when to refit; "style" key decides when to redraw.
  const positionKey = JSON.stringify([
    pickupPt,
    dropoffPt,
    volunteerPt,
    candidatePts.map((c) => [c.person._id, c.pt]),
  ]);
  const styleKey = JSON.stringify([
    positionKey,
    selectedId || "",
    candidatePts.map((c) => [c.person.markerColor, c.person.markerLabel]),
  ]);

  /* Create the map once */
  useEffect(() => {
    const map = L.map(elRef.current, {
      zoomControl: false,
      scrollWheelZoom: false, // avoid hijacking page scroll
    }).setView([7.8731, 80.7718], 7);

    L.control.zoom({ position: "bottomright" }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    // Keep the map correct while its container animates open or resizes.
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(elRef.current);

    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
      tileRef.current = null;
    };
  }, []);

  /* Street / satellite tiles */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (tileRef.current) map.removeLayer(tileRef.current);
    const t = TILES[satellite ? "satellite" : "street"];
    tileRef.current = L.tileLayer(t.url, t.options).addTo(map);
    tileRef.current.bringToBack();
  }, [satellite]);

  /* Draw markers + route lines */
  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();
    const all = [];
    let selectedPt = null;

    if (pickupPt) {
      L.marker(pickupPt, { icon: pin(COLORS.pickup, "P"), zIndexOffset: 400 })
        .bindPopup(popupNode("Pickup", "Donor location"))
        .addTo(layer);
      all.push(pickupPt);
    }

    if (dropoffPt) {
      L.marker(dropoffPt, { icon: pin(COLORS.dropoff, "D"), zIndexOffset: 400 })
        .bindPopup(popupNode("Drop-off", "Recipient location"))
        .addTo(layer);
      all.push(dropoffPt);
    }

    if (pickupPt && dropoffPt) {
      L.polyline([pickupPt, dropoffPt], {
        color: "#1d1d1f",
        weight: 2,
        opacity: 0.35,
        dashArray: "6 8",
      }).addTo(layer);
    }

    if (volunteerPt) {
      L.marker(volunteerPt, {
        icon: pin(COLORS.volunteer, "V", 36, true),
        zIndexOffset: 800,
      })
        .bindPopup(popupNode(userName(volunteer), "Assigned volunteer"))
        .addTo(layer);
      all.push(volunteerPt);

      if (pickupPt) {
        L.polyline([volunteerPt, pickupPt], {
          color: COLORS.volunteer,
          weight: 3,
          opacity: 0.8,
        }).addTo(layer);
      }
    }

    candidatePts.forEach(({ person, pt }, i) => {
      const isSelected = !!selectedId && person._id === selectedId;
      const label = person.markerLabel ?? person.recommendedRank ?? i + 1;
      const color =
        person.markerColor || (isSelected ? COLORS.selected : COLORS.candidate);
      const sub =
        person.subtitle ??
        (person.pickupDistanceKm != null
          ? `${person.pickupDistanceKm} km from pickup`
          : "");

      const marker = L.marker(pt, {
        icon: isSelected ? pin(color, label, 38, true) : pin(color, label, 30),
        zIndexOffset: isSelected ? 1000 : 200,
      })
        .bindPopup(popupNode(userName(person), sub))
        .addTo(layer);

      if (onSelectRef.current) {
        marker.on("click", () => onSelectRef.current?.(person._id));
      }

      all.push(pt);

      if (isSelected) {
        selectedPt = pt;
        if (pickupPt) {
          L.polyline([pt, pickupPt], { color, weight: 3, opacity: 0.85 }).addTo(
            layer,
          );
        }
      }
    });

    const focus =
      focusSelected && selectedPt
        ? [selectedPt, pickupPt, dropoffPt].filter(Boolean)
        : all;

    boundsRef.current = focus;

    // Refit only when the data/selection that matters actually changed.
    const fitKey = focusSelected ? styleKey : positionKey;
    if (fitKeyRef.current !== fitKey && focus.length) {
      fitKeyRef.current = fitKey;
      fitPoints(map, focus);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [styleKey]);

  /* Manual recenter */
  useEffect(() => {
    if (recenterKey) fitPoints(mapRef.current, boundsRef.current);
  }, [recenterKey]);

  const showCandidates = candidatePts.length > 0;

  return (
    <div
      className={
        fill
          ? "absolute inset-0 overflow-hidden"
          : "relative overflow-hidden rounded-2xl bg-[#f5f5f7] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]"
      }
    >
      <div
        ref={elRef}
        className="isolate"
        style={{ height: fill ? "100%" : height, width: "100%" }}
        role="region"
        aria-label="Map of delivery locations"
      />

      {legend && hasAnything && (
        <div
          className="pointer-events-none absolute left-3 top-3 z-[500] flex flex-wrap items-center gap-x-3 gap-y-1 rounded-full px-3 py-1.5 text-[12px] font-medium text-[#1d1d1f]"
          style={{
            background: "rgba(255,255,255,.82)",
            WebkitBackdropFilter: "saturate(180%) blur(12px)",
            backdropFilter: "saturate(180%) blur(12px)",
            boxShadow: "0 2px 10px rgba(0,0,0,.12)",
          }}
        >
          {LEGEND.filter((l) =>
            l.key === "volunteer" ? volunteerPt : true,
          ).map((l) => (
            <span key={l.key} className="inline-flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: l.color }}
              />
              {l.label}
            </span>
          ))}
          {showCandidates && (
            <span className="inline-flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: COLORS.candidate }}
              />
              {candidateLabel}
            </span>
          )}
        </div>
      )}

      {!hasAnything && (
        <div className="absolute inset-0 z-[500] flex flex-col items-center justify-center bg-[#f5f5f7] px-6 text-center">
          <p className="text-[15px] font-semibold text-[#1d1d1f]">
            Map unavailable
          </p>
          <p className="mt-1 max-w-xs text-[13px] leading-5 text-[#6e6e73]">
            No valid coordinates were found for this view.
          </p>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── Fleet tracking section ───────────────────────── */
/* Only volunteers with one of these delivery statuses are "on the road". */
const STATUS_META = {
  ACCEPTED: { label: "Heading to pickup", color: "#0a84ff" },
  PICKED_UP: { label: "Food picked up", color: "#bf5af2" },
  IN_TRANSIT: { label: "In transit", color: "#5e5ce6" },
};
const ACTIVE = Object.keys(STATUS_META);

const getInitials = (name) =>
  name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

function DeliveryPersonsMapSection({ deliveries = [], loading = false }) {
  const [selectedId, setSelectedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [satellite, setSatellite] = useState(false);
  const [recenterKey, setRecenterKey] = useState(0);

  /* Real volunteers, taken from deliveries that already have one assigned. */
  const persons = useMemo(
    () =>
      deliveries
        .filter(
          (d) =>
            d.volunteer &&
            typeof d.volunteer === "object" &&
            ACTIVE.includes(d.status),
        )
        .map((d) => {
          const volunteer = d.volunteer;
          const donation = d.donation || {};
          const recipient = d.recipient || {};
          const name = getName(volunteer);

          return {
            id: volunteer._id || d._id,
            name,
            phone: volunteer.phoneNumber,
            status: d.status,
            meta: STATUS_META[d.status],
            volunteer,
            foodName: donation.foodName || "Food donation",
            pickupAddress:
              d.pickupAddress ||
              donation.pickupAddress ||
              "Address unavailable",
            dropoffAddress:
              d.deliveryAddress || recipient.address || "Address unavailable",
            pickup: d.pickupLocation || donation.pickupLocation,
            dropoff: d.deliveryLocation || recipient.location,
          };
        }),
    [deliveries],
  );

  const filtered = persons.filter((p) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.pickupAddress.toLowerCase().includes(q) ||
      p.dropoffAddress.toLowerCase().includes(q) ||
      p.foodName.toLowerCase().includes(q)
    );
  });

  const selected =
    persons.find((p) => p.id === selectedId) ||
    filtered[0] ||
    persons[0] ||
    null;

  /* Every volunteer becomes a coloured pin; the selected one is highlighted. */
  const mapCandidates = useMemo(
    () =>
      filtered.map((p) => ({
        ...p.volunteer,
        _id: p.id,
        fullName: p.name,
        markerColor: p.meta.color,
        markerLabel: getInitials(p.name),
        subtitle: p.meta.label,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [persons, searchQuery],
  );

  /* ───── Loading / empty states ───── */

  if (loading && persons.length === 0) {
    return (
      <section className="mt-14">
        <div className="mb-skeleton h-[420px] rounded-[28px]" />
      </section>
    );
  }

  return (
    <section className="mt-14">
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 className="text-[28px] font-semibold tracking-[-0.025em] text-[#1d1d1f] sm:text-[34px]">
            Fleet tracking
          </h2>
          <p className="mt-1 text-[15px] text-[#6e6e73]">
            Volunteers currently on a delivery. Positions update when you
            refresh.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 self-start rounded-full bg-white px-3.5 py-2 text-xs font-medium text-[#1d1d1f] md:self-auto">
          <span
            className={`h-2 w-2 rounded-full ${
              persons.length ? "animate-pulse bg-[#30d158]" : "bg-[#86868b]"
            }`}
          />
          {persons.length} {persons.length === 1 ? "volunteer" : "volunteers"}{" "}
          on delivery
        </div>
      </div>

      {persons.length === 0 ? (
        <div className="rounded-[28px] bg-white px-6 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f5f5f7] text-[#6e6e73]">
            <Navigation className="h-6 w-6" />
          </div>
          <h3 className="mt-5 text-xl font-semibold tracking-tight">
            No volunteers on the road.
          </h3>
          <p className="mx-auto mt-2 max-w-md text-[15px] leading-6 text-[#6e6e73]">
            Once a delivery is assigned and accepted, the volunteer appears here
            with their position on the map.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:h-[650px] lg:grid-cols-12">
          {/* Volunteer list */}
          <div className="flex max-h-[420px] flex-col rounded-[28px] bg-white p-5 lg:col-span-4 lg:h-full lg:max-h-none">
            <div className="relative mb-4">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#86868b]" />
              <input
                type="text"
                placeholder="Search volunteer or address…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-[#d2d2d7]/60 bg-[#f5f5f7] py-2.5 pl-10 pr-4 text-[13px] text-[#1d1d1f] placeholder-[#86868b] transition-all focus:border-[#0071e3] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20"
              />
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {filtered.length === 0 && (
                <p className="px-2 py-8 text-center text-[13px] text-[#6e6e73]">
                  No volunteers match “{searchQuery}”.
                </p>
              )}

              {filtered.map((person) => {
                const isSelected = selected?.id === person.id;
                const heading =
                  person.status === "ACCEPTED"
                    ? person.pickupAddress
                    : person.dropoffAddress;

                return (
                  <motion.button
                    type="button"
                    key={person.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setSelectedId(person.id)}
                    aria-pressed={isSelected}
                    className={`w-full rounded-2xl border p-4 text-left transition-all ${
                      isSelected
                        ? "border-[#0071e3]/40 bg-[#f2f8ff] shadow-[0_8px_20px_rgba(0,113,227,0.08)]"
                        : "border-transparent bg-[#f5f5f7] hover:bg-[#ededf0]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold text-white"
                        style={{ background: person.meta.color }}
                      >
                        {getInitials(person.name)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="truncate text-sm font-semibold text-[#1d1d1f]">
                          {person.name}
                        </h4>
                        <span className="text-[11px] font-medium text-[#6e6e73]">
                          {person.meta.label}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-1.5 border-t border-black/[0.05] pt-3 text-xs text-[#6e6e73]">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-[#86868b]" />
                      <span className="truncate">{heading}</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Map */}
          <div className="relative flex h-[520px] flex-col justify-between overflow-hidden rounded-[28px] bg-[#e8e8ed] lg:col-span-8 lg:h-full">
            <DeliveryMap
              fill
              legend={false}
              candidateLabel="Volunteers"
              pickup={selected?.pickup}
              dropoff={selected?.dropoff}
              candidates={mapCandidates}
              selectedId={selected?.id}
              onSelectCandidate={setSelectedId}
              focusSelected
              satellite={satellite}
              recenterKey={recenterKey}
            />

            {/* Top bar */}
            <div className="pointer-events-none relative z-10 flex flex-wrap items-center justify-between gap-2 p-4">
              <div className="pointer-events-auto flex items-center gap-2 rounded-2xl bg-white/85 px-4 py-2 text-xs font-medium text-[#1d1d1f] shadow-sm backdrop-blur-md">
                <Navigation className="h-3.5 w-3.5 text-[#0071e3]" />
                <span>
                  Viewing:{" "}
                  <strong className="text-[#0071e3]">{selected?.name}</strong>
                </span>
              </div>

              <div className="pointer-events-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSatellite((s) => !s)}
                  aria-pressed={satellite}
                  className="rounded-xl bg-white/85 px-3 py-2 text-xs font-medium text-[#1d1d1f] shadow-sm backdrop-blur-md transition-all hover:bg-white"
                >
                  {satellite ? "Map view" : "Satellite view"}
                </button>
                <button
                  type="button"
                  onClick={() => setRecenterKey((k) => k + 1)}
                  className="rounded-xl bg-[#1d1d1f] px-3 py-2 text-xs font-medium text-white shadow-sm transition-all hover:bg-black"
                >
                  Recenter map
                </button>
              </div>
            </div>

            {/* Selected volunteer card */}
            {selected && (
              <div className="pointer-events-none relative z-10 px-4 pb-2">
                <motion.div
                  key={selected.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                  className="pointer-events-auto w-full max-w-xs rounded-2xl bg-white/90 p-4 shadow-[0_20px_40px_rgba(0,0,0,0.14)] backdrop-blur-xl"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                      style={{ background: selected.meta.color }}
                    >
                      {getInitials(selected.name)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="truncate text-sm font-semibold text-[#1d1d1f]">
                        {selected.name}
                      </h4>
                      <p className="text-xs text-[#6e6e73]">
                        {selected.meta.label}
                      </p>
                    </div>
                  </div>

                  <div className="mb-3 space-y-2.5 rounded-xl bg-[#f5f5f7] p-3 text-xs">
                    <div className="flex items-center gap-2 font-medium text-[#1d1d1f]">
                      <Package className="h-3.5 w-3.5 shrink-0 text-[#86868b]" />
                      <span className="truncate">{selected.foodName}</span>
                    </div>
                    <div>
                      <p className="text-[#86868b]">Pickup</p>
                      <p className="line-clamp-2 font-medium text-[#1d1d1f]">
                        {selected.pickupAddress}
                      </p>
                    </div>
                    <div>
                      <p className="text-[#86868b]">Drop-off</p>
                      <p className="line-clamp-2 font-medium text-[#1d1d1f]">
                        {selected.dropoffAddress}
                      </p>
                    </div>
                  </div>

                  {selected.phone && (
                    <a
                      href={`tel:${selected.phone}`}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0071e3] py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#0077ed]"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      Call {selected.phone}
                    </a>
                  )}
                </motion.div>
              </div>
            )}

            {/* Legend */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-t border-black/5 bg-white/75 px-5 py-3 text-xs text-[#6e6e73] backdrop-blur-md">
              <div className="flex flex-wrap items-center gap-4">
                {Object.values(STATUS_META).map((s) => (
                  <span key={s.label} className="flex items-center gap-1.5">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: s.color }}
                    />
                    {s.label}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ff9f0a]" />
                  Pickup
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#0a84ff]" />
                  Drop-off
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
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

        {/* Fleet tracking map */}
        <DeliveryPersonsMapSection
          deliveries={allDeliveries}
          loading={loading}
        />

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

                    {/* Map */}
                    <div className="border-t border-[#f0f0f2] p-6 sm:p-8">
                      <DeliveryMap
                        pickup={
                          delivery.pickupLocation || donation.pickupLocation
                        }
                        dropoff={
                          delivery.deliveryLocation || recipient.location
                        }
                        volunteer={delivery.volunteer ? volunteer : null}
                      />
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
                                  {/* Candidate map */}
                                  <DeliveryMap
                                    pickup={
                                      delivery.pickupLocation ||
                                      donation.pickupLocation
                                    }
                                    dropoff={
                                      delivery.deliveryLocation ||
                                      recipient.location
                                    }
                                    candidates={volunteers[id]}
                                    selectedId={selectedVolunteers[id]}
                                  />

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
