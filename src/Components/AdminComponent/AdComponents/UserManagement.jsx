import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  Search,
  Plus,
  Download,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  LayoutDashboard,
  ListChecks,
  Activity,
  Settings as SettingsIcon,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit3,
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
  Phone,
  Mail,
  Calendar,
  ArrowUpDown,
  Bell,
  Users as UsersIcon,
  TrendingUp,
  AlertTriangle,
  Map as MapIcon,
  Package,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Design tokens                                                       */
/* Ink navy sidebar, warm neutral canvas, deep teal (verified/fresh)   */
/* + burnt terracotta (attention) as the two accents. Role colors are  */
/* functional coding, not decoration, and repeat identically across    */
/* the table, map pins, and avatars so the eye learns them fast.       */
/* ------------------------------------------------------------------ */

const ROLE_META = {
  Donator: { color: "#146C5B", bg: "#E6F2EF", label: "Donator" },
  Recipient: { color: "#B4531F", bg: "#FBEAE0", label: "Recipient" },
  Volunteer: { color: "#4C4FA3", bg: "#ECEBF9", label: "Volunteer" },
  "Delivery Person": {
    color: "#2B6CB0",
    bg: "#E7F0FA",
    label: "Delivery Person",
  },
};

const STATUS_META = {
  Active: { color: "#1F8A57", bg: "#E7F6EE", dot: "#1F8A57" },
  Inactive: { color: "#667085", bg: "#F1F2F4", dot: "#98A2B3" },
  Suspended: { color: "#C0392B", bg: "#FCEAE8", dot: "#C0392B" },
};

const VERIFY_META = {
  Verified: { color: "#1F8A57", bg: "#E7F6EE", Icon: ShieldCheck },
  Pending: { color: "#B4531F", bg: "#FBEAE0", Icon: ShieldQuestion },
  Rejected: { color: "#C0392B", bg: "#FCEAE8", Icon: ShieldAlert },
};

const ROLES = ["Donator", "Recipient", "Volunteer", "Delivery Person"];
const STATUSES = ["Active", "Inactive", "Suspended"];
const VERIFICATIONS = ["Verified", "Pending", "Rejected"];

/* ------------------------------------------------------------------ */
/* Mock data                                                            */
/* ------------------------------------------------------------------ */

const seedUsers = [
  {
    id: 1,
    name: "Sophia Chen",
    email: "sophia.c@example.com",
    phone: "(415) 555-0142",
    role: "Donator",
    status: "Active",
    verification: "Verified",
    location: { lat: 37.7749, lng: -122.4194, name: "Financial District, SF" },
    joinedDate: "2025-01-14",
    lastActive: "2026-08-29T08:12:00",
    metric: 34,
    metricLabel: "meals donated",
  },
  {
    id: 2,
    name: "Marcus Vance",
    email: "marcus.v@community.org",
    phone: "(415) 555-0198",
    role: "Recipient",
    status: "Active",
    verification: "Verified",
    location: { lat: 37.7599, lng: -122.4148, name: "Mission District, SF" },
    joinedDate: "2025-02-01",
    lastActive: "2026-08-28T17:40:00",
    metric: 12,
    metricLabel: "pickups received",
  },
  {
    id: 3,
    name: "Elena Rostova",
    email: "elena.r@volunteer.net",
    phone: "(415) 555-0110",
    role: "Volunteer",
    status: "Inactive",
    verification: "Pending",
    location: { lat: 37.7692, lng: -122.4467, name: "Haight-Ashbury, SF" },
    joinedDate: "2024-11-20",
    lastActive: "2026-08-11T09:05:00",
    metric: 6,
    metricLabel: "shifts completed",
  },
  {
    id: 4,
    name: "David Kim",
    email: "david.logistics@express.io",
    phone: "(415) 555-0176",
    role: "Delivery Person",
    status: "Active",
    verification: "Verified",
    location: { lat: 37.7558, lng: -122.4444, name: "Noe Valley, SF" },
    joinedDate: "2024-12-05",
    lastActive: "2026-08-29T07:58:00",
    metric: 214,
    metricLabel: "deliveries",
  },
  {
    id: 5,
    name: "Priya Nair",
    email: "priya.nair@freshfields.co",
    phone: "(415) 555-0133",
    role: "Donator",
    status: "Active",
    verification: "Pending",
    location: { lat: 37.7935, lng: -122.3964, name: "North Beach, SF" },
    joinedDate: "2026-06-18",
    lastActive: "2026-08-27T14:20:00",
    metric: 5,
    metricLabel: "meals donated",
  },
  {
    id: 6,
    name: "James O'Connor",
    email: "j.oconnor@mailbox.com",
    phone: "(415) 555-0187",
    role: "Recipient",
    status: "Suspended",
    verification: "Rejected",
    location: { lat: 37.7845, lng: -122.4079, name: "Nob Hill, SF" },
    joinedDate: "2025-09-02",
    lastActive: "2026-07-30T11:11:00",
    metric: 3,
    metricLabel: "pickups received",
  },
  {
    id: 7,
    name: "Aisha Bello",
    email: "aisha.bello@volunteer.net",
    phone: "(415) 555-0121",
    role: "Volunteer",
    status: "Active",
    verification: "Verified",
    location: { lat: 37.7431, lng: -122.4193, name: "Bernal Heights, SF" },
    joinedDate: "2025-04-09",
    lastActive: "2026-08-29T06:30:00",
    metric: 41,
    metricLabel: "shifts completed",
  },
  {
    id: 8,
    name: "Tom Alvarez",
    email: "tom.alvarez@express.io",
    phone: "(415) 555-0165",
    role: "Delivery Person",
    status: "Inactive",
    verification: "Pending",
    location: { lat: 37.7275, lng: -122.4449, name: "Excelsior, SF" },
    joinedDate: "2026-03-22",
    lastActive: "2026-08-05T16:02:00",
    metric: 58,
    metricLabel: "deliveries",
  },
  {
    id: 9,
    name: "Grace Park",
    email: "grace.park@harvesttable.com",
    phone: "(415) 555-0154",
    role: "Donator",
    status: "Active",
    verification: "Verified",
    location: { lat: 37.7879, lng: -122.4074, name: "Union Square, SF" },
    joinedDate: "2024-08-30",
    lastActive: "2026-08-29T09:02:00",
    metric: 122,
    metricLabel: "meals donated",
  },
  {
    id: 10,
    name: "Liam Foster",
    email: "liam.foster@gmail.com",
    phone: "(415) 555-0190",
    role: "Recipient",
    status: "Active",
    verification: "Pending",
    location: { lat: 37.7614, lng: -122.4331, name: "Castro, SF" },
    joinedDate: "2026-07-11",
    lastActive: "2026-08-26T13:47:00",
    metric: 1,
    metricLabel: "pickups received",
  },
];

const seedAudit = [
  {
    id: 1,
    actor: "You",
    action: "verified",
    target: "Grace Park",
    time: "2026-08-29T09:10:00",
  },
  {
    id: 2,
    actor: "You",
    action: "suspended",
    target: "James O'Connor",
    time: "2026-08-28T15:22:00",
  },
  {
    id: 3,
    actor: "Priya Shah (Admin)",
    action: "activated",
    target: "Tom Alvarez",
    time: "2026-08-27T10:04:00",
  },
  {
    id: 4,
    actor: "You",
    action: "added",
    target: "Priya Nair",
    time: "2026-06-18T12:00:00",
  },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

const initials = (name) =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const timeAgo = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
};

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const downloadCSV = (rows) => {
  const header = [
    "Name",
    "Email",
    "Phone",
    "Role",
    "Status",
    "Verification",
    "Location",
    "Joined",
  ];
  const lines = rows.map((u) =>
    [
      u.name,
      u.email,
      u.phone,
      u.role,
      u.status,
      u.verification,
      u.location.name,
      u.joinedDate,
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(","),
  );
  const csv = [header.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `gleanops-users-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

/* ------------------------------------------------------------------ */
/* Leaflet loader hook                                                  */
/* ------------------------------------------------------------------ */

function useLeaflet() {
  const [ready, setReady] = useState(!!window.L);
  useEffect(() => {
    if (window.L) {
      setReady(true);
      return;
    }
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href =
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
      document.head.appendChild(link);
    }
    if (!document.getElementById("leaflet-js")) {
      const script = document.createElement("script");
      script.id = "leaflet-js";
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
      script.async = true;
      script.onload = () => setReady(true);
      document.body.appendChild(script);
    } else {
      const check = setInterval(() => {
        if (window.L) {
          setReady(true);
          clearInterval(check);
        }
      }, 150);
    }
  }, []);
  return ready;
}

function pinIcon(color, big) {
  const size = big ? 34 : 26;
  return window.L.divIcon({
    className: "",
    html: `<div style="width:${size}px;height:${size}px;border-radius:50% 50% 50% 0;background:${color};transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,0.35);border:2px solid white;display:flex;align-items:center;justify-content:center;">
             <div style="width:${size * 0.32}px;height:${size * 0.32}px;background:white;border-radius:50%;transform:rotate(45deg);"></div>
           </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

function MapView({ users, height = 420, focusUser, onMarkerClick }) {
  const ready = useLeaflet();
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!ready || !containerRef.current || mapRef.current) return;
    const L = window.L;
    const map = L.map(containerRef.current, { scrollWheelZoom: false }).setView(
      [37.7699, -122.43],
      12.3,
    );
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [ready]);

  useEffect(() => {
    if (!mapRef.current || !window.L) return;
    const L = window.L;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    users.forEach((u) => {
      const isFocus = focusUser && focusUser.id === u.id;
      const marker = L.marker([u.location.lat, u.location.lng], {
        icon: pinIcon(ROLE_META[u.role].color, isFocus),
      }).addTo(mapRef.current);
      marker.bindPopup(
        `<div style="font-family:Inter,sans-serif;min-width:160px">
           <div style="font-weight:600;font-size:13px;color:#101828;margin-bottom:2px">${u.name}</div>
           <div style="font-size:11px;color:${ROLE_META[u.role].color};font-weight:600;margin-bottom:4px">${u.role}</div>
           <div style="font-size:11px;color:#667085">${u.location.name}</div>
           <div style="font-size:11px;color:#667085;margin-top:2px">${u.status} &middot; ${u.verification}</div>
         </div>`,
      );
      if (onMarkerClick) marker.on("click", () => onMarkerClick(u));
      markersRef.current.push(marker);
    });
    if (focusUser) {
      mapRef.current.setView(
        [focusUser.location.lat, focusUser.location.lng],
        14,
        { animate: true },
      );
    } else if (users.length) {
      const bounds = L.latLngBounds(
        users.map((u) => [u.location.lat, u.location.lng]),
      );
      mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [users, focusUser]);

  return (
    <div
      style={{ height }}
      className="relative w-full rounded-2xl overflow-hidden border border-[#E4E7EC] bg-[#F1F2F4]"
    >
      <div ref={containerRef} className="w-full h-full" />
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-[#667085] bg-[#F1F2F4]">
          Loading map…
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Small UI atoms                                                       */
/* ------------------------------------------------------------------ */

function Avatar({ user, size = 36 }) {
  const meta = ROLE_META[user.role];
  const ring = STATUS_META[user.status].dot;
  return (
    <div
      className="relative flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <div
        className="w-full h-full rounded-full flex items-center justify-center font-semibold"
        style={{
          background: meta.bg,
          color: meta.color,
          fontSize: size * 0.36,
        }}
      >
        {initials(user.name)}
      </div>
      <span
        className="absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-white"
        style={{ width: size * 0.32, height: size * 0.32, background: ring }}
        title={user.status}
      />
    </div>
  );
}

function RoleBadge({ role }) {
  const m = ROLE_META[role];
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ background: m.bg, color: m.color }}
    >
      {role}
    </span>
  );
}

function StatusPill({ status }) {
  const m = STATUS_META[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ background: m.bg, color: m.color }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: m.dot }}
      />
      {status}
    </span>
  );
}

function VerifyBadge({ verification }) {
  const m = VERIFY_META[verification];
  const Icon = m.Icon;
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ background: m.bg, color: m.color }}
    >
      <Icon size={12} />
      {verification}
    </span>
  );
}

function Toast({ toasts }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 items-end">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="bg-[#101828] text-white text-sm px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          {t.type === "success" && (
            <CheckCircle2 size={15} className="text-emerald-400" />
          )}
          {t.type === "error" && <XCircle size={15} className="text-red-400" />}
          {t.type === "info" && <Bell size={15} className="text-blue-400" />}
          {t.message}
        </div>
      ))}
    </div>
  );
}

function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  danger,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${danger ? "bg-[#FCEAE8]" : "bg-[#E7F6EE]"}`}
          >
            <AlertTriangle
              size={18}
              className={danger ? "text-[#C0392B]" : "text-[#1F8A57]"}
            />
          </div>
          <h3 className="text-base font-semibold text-[#101828]">{title}</h3>
        </div>
        <p className="text-sm text-[#667085] mb-6">{body}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-medium text-[#344054] hover:bg-[#F1F2F4] rounded-full transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-xs font-medium text-white rounded-full transition-colors ${danger ? "bg-[#C0392B] hover:bg-[#A6301F]" : "bg-[#146C5B] hover:bg-[#0F5647]"}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main app                                                             */
/* ------------------------------------------------------------------ */

export default function GleanOpsAdmin() {
  const [users, setUsers] = useState(seedUsers);
  const [audit, setAudit] = useState(seedAudit);
  const [tab, setTab] = useState("overview"); // overview | directory | map | activity | settings

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [verifyFilter, setVerifyFilter] = useState("All");
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const [selectedIds, setSelectedIds] = useState([]);
  const [drawerUser, setDrawerUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null); // null = closed, {} = add, object = edit
  const [confirm, setConfirm] = useState(null); // {title, body, danger, onConfirm}
  const [toasts, setToasts] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);

  const pushToast = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }, []);

  const logAudit = useCallback((action, target) => {
    setAudit((a) => [
      {
        id: Date.now(),
        actor: "You",
        action,
        target,
        time: new Date().toISOString(),
      },
      ...a,
    ]);
  }, []);

  /* ---------- derived data ---------- */

  const filteredUsers = useMemo(() => {
    let list = users.filter((u) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.includes(q);
      const matchesRole = roleFilter === "All" || u.role === roleFilter;
      const matchesStatus = statusFilter === "All" || u.status === statusFilter;
      const matchesVerify =
        verifyFilter === "All" || u.verification === verifyFilter;
      return matchesSearch && matchesRole && matchesStatus && matchesVerify;
    });
    list = [...list].sort((a, b) => {
      let av = a[sortKey],
        bv = b[sortKey];
      if (sortKey === "joinedDate" || sortKey === "lastActive") {
        av = new Date(av);
        bv = new Date(bv);
      }
      if (typeof av === "string") {
        av = av.toLowerCase();
        bv = bv.toLowerCase();
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [
    users,
    searchQuery,
    roleFilter,
    statusFilter,
    verifyFilter,
    sortKey,
    sortDir,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const pagedUsers = filteredUsers.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  useEffect(() => {
    setPage(1);
  }, [searchQuery, roleFilter, statusFilter, verifyFilter]);

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status === "Active").length;
    const pending = users.filter((u) => u.verification === "Pending").length;
    const suspended = users.filter((u) => u.status === "Suspended").length;
    const byRole = ROLES.map((r) => ({
      role: r,
      count: users.filter((u) => u.role === r).length,
    }));
    return { total, active, pending, suspended, byRole };
  }, [users]);

  /* ---------- actions ---------- */

  const toggleSelect = (id) =>
    setSelectedIds((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
    );

  const toggleSelectAllOnPage = () => {
    const pageIds = pagedUsers.map((u) => u.id);
    const allSelected = pageIds.every((id) => selectedIds.includes(id));
    setSelectedIds((s) =>
      allSelected
        ? s.filter((id) => !pageIds.includes(id))
        : [...new Set([...s, ...pageIds])],
    );
  };

  const setUserField = (id, patch) =>
    setUsers((us) => us.map((u) => (u.id === id ? { ...u, ...patch } : u)));

  const requestStatusChange = (user, newStatus) => {
    setOpenMenuId(null);
    if (
      newStatus === "Suspended" ||
      (user.status === "Active" && newStatus === "Inactive" && false)
    ) {
      setConfirm({
        title: `Suspend ${user.name}?`,
        body: "This immediately revokes platform access. They'll be notified by email and can appeal from their account page.",
        danger: true,
        confirmLabel: "Suspend account",
        onConfirm: () => {
          setUserField(user.id, { status: "Suspended" });
          logAudit("suspended", user.name);
          pushToast(`${user.name} was suspended`, "error");
          setConfirm(null);
        },
      });
    } else {
      setUserField(user.id, { status: newStatus });
      logAudit(newStatus === "Active" ? "activated" : "deactivated", user.name);
      pushToast(`${user.name} is now ${newStatus.toLowerCase()}`, "success");
    }
  };

  const requestVerify = (user, verification) => {
    setOpenMenuId(null);
    setUserField(user.id, { verification });
    logAudit(verification === "Verified" ? "verified" : "rejected", user.name);
    pushToast(
      `${user.name} marked ${verification.toLowerCase()}`,
      verification === "Rejected" ? "error" : "success",
    );
  };

  const requestDelete = (user) => {
    setOpenMenuId(null);
    setConfirm({
      title: `Delete ${user.name}?`,
      body: "This permanently removes their profile, history, and location data. This can't be undone.",
      danger: true,
      confirmLabel: "Delete permanently",
      onConfirm: () => {
        setUsers((us) => us.filter((u) => u.id !== user.id));
        setSelectedIds((s) => s.filter((id) => id !== user.id));
        logAudit("deleted", user.name);
        pushToast(`${user.name} was deleted`, "error");
        setConfirm(null);
        if (drawerUser?.id === user.id) setDrawerUser(null);
      },
    });
  };

  const bulkAction = (action) => {
    const targets = users.filter((u) => selectedIds.includes(u.id));
    if (!targets.length) return;
    if (action === "delete") {
      setConfirm({
        title: `Delete ${targets.length} user${targets.length > 1 ? "s" : ""}?`,
        body: "This permanently removes their profiles, history, and location data. This can't be undone.",
        danger: true,
        confirmLabel: "Delete permanently",
        onConfirm: () => {
          setUsers((us) => us.filter((u) => !selectedIds.includes(u.id)));
          logAudit("bulk-deleted", `${targets.length} users`);
          pushToast(`Deleted ${targets.length} users`, "error");
          setSelectedIds([]);
          setConfirm(null);
        },
      });
      return;
    }
    if (action === "activate") {
      setUsers((us) =>
        us.map((u) =>
          selectedIds.includes(u.id) ? { ...u, status: "Active" } : u,
        ),
      );
      logAudit("bulk-activated", `${targets.length} users`);
      pushToast(`Activated ${targets.length} users`);
    }
    if (action === "suspend") {
      setUsers((us) =>
        us.map((u) =>
          selectedIds.includes(u.id) ? { ...u, status: "Suspended" } : u,
        ),
      );
      logAudit("bulk-suspended", `${targets.length} users`);
      pushToast(`Suspended ${targets.length} users`, "error");
    }
    if (action === "export") {
      downloadCSV(targets);
      pushToast(`Exported ${targets.length} users to CSV`, "info");
    }
    setSelectedIds([]);
  };

  const saveUser = (data) => {
    if (data.id) {
      setUserField(data.id, data);
      logAudit("edited", data.name);
      pushToast(`${data.name} updated`);
    } else {
      const newUser = {
        ...data,
        id: Math.max(0, ...users.map((u) => u.id)) + 1,
        status: "Active",
        verification: "Pending",
        joinedDate: new Date().toISOString().slice(0, 10),
        lastActive: new Date().toISOString(),
        metric: 0,
        metricLabel:
          data.role === "Delivery Person"
            ? "deliveries"
            : data.role === "Volunteer"
              ? "shifts completed"
              : data.role === "Recipient"
                ? "pickups received"
                : "meals donated",
        location: {
          lat: 37.7749 + (Math.random() - 0.5) * 0.06,
          lng: -122.4194 + (Math.random() - 0.5) * 0.06,
          name: data.locationName || "San Francisco, CA",
        },
      };
      setUsers((us) => [newUser, ...us]);
      logAudit("added", newUser.name);
      pushToast(`${newUser.name} added to directory`);
    }
    setEditingUser(null);
  };

  const sortToggle = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  /* ---------- render ---------- */

  const NavItem = ({ id, icon: Icon, label, badge }) => (
    <button
      onClick={() => {
        setTab(id);
        setOpenMenuId(null);
      }}
      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
        tab === id
          ? "bg-white/10 text-white"
          : "text-[#9AA4B2] hover:text-white hover:bg-white/5"
      }`}
    >
      <Icon size={17} />
      <span className="flex-1 text-left">{label}</span>
      {badge > 0 && (
        <span className="text-[10px] font-semibold bg-[#B4531F] text-white px-1.5 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </button>
  );

  return (
    <div className="min-h-screen flex bg-[#F7F8FA] text-[#101828] font-sans antialiased">
      {/* ---------------- Sidebar ---------------- */}
      <aside className="hidden md:flex w-60 flex-shrink-0 flex-col bg-[#0F172A] px-4 py-6 gap-6">
        <div className="flex items-center gap-2.5 px-2">
          <div className="w-8 h-8 rounded-lg bg-[#146C5B] flex items-center justify-center">
            <Package size={16} className="text-white" />
          </div>
          <div>
            <div className="text-white font-semibold text-sm leading-tight">
              GleanOps
            </div>
            <div className="text-[#9AA4B2] text-[10px]">Admin console</div>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          <NavItem id="overview" icon={LayoutDashboard} label="Overview" />
          <NavItem id="directory" icon={ListChecks} label="Directory" />
          <NavItem id="map" icon={MapIcon} label="Live map" />
          <NavItem id="activity" icon={Activity} label="Activity log" />
          <NavItem id="settings" icon={SettingsIcon} label="Settings" />
        </nav>

        <div className="mt-auto px-2">
          <div className="text-[10px] uppercase tracking-wider text-[#9AA4B2] mb-2 font-semibold">
            Needs review
          </div>
          <button
            onClick={() => {
              setTab("directory");
              setVerifyFilter("Pending");
            }}
            className="w-full text-left text-xs text-white bg-white/5 hover:bg-white/10 rounded-xl px-3 py-2.5 transition-colors"
          >
            {stats.pending} pending verification{stats.pending !== 1 ? "s" : ""}
          </button>
        </div>
      </aside>

      {/* ---------------- Main ---------------- */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#E4E7EC] px-5 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-lg font-semibold tracking-tight text-[#101828] capitalize">
              {tab === "overview"
                ? "Overview"
                : tab === "directory"
                  ? "User directory"
                  : tab === "map"
                    ? "Live map"
                    : tab === "activity"
                      ? "Activity log"
                      : "Settings"}
            </h1>
            <p className="text-xs text-[#667085] mt-0.5 hidden sm:block">
              {tab === "overview" &&
                "Platform health across donators, recipients, volunteers, and drivers."}
              {tab === "directory" &&
                "Manage access, verification, and roles for every account."}
              {tab === "map" &&
                "Real-time positions of every active account in your service area."}
              {tab === "activity" &&
                "Recent admin actions across the platform."}
              {tab === "settings" && "Console preferences."}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => setEditingUser({})}
              className="bg-[#146C5B] hover:bg-[#0F5647] text-white text-sm font-medium px-4 py-2 rounded-full transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
            >
              <Plus size={15} />{" "}
              <span className="hidden sm:inline">Add user</span>
            </button>
            <div className="w-9 h-9 rounded-full bg-[#146C5B] text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
              AD
            </div>
          </div>
        </header>

        <main className="flex-1 px-5 sm:px-8 py-6 max-w-7xl w-full mx-auto">
          {/* -------- Overview -------- */}
          {tab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  icon={UsersIcon}
                  label="Total users"
                  value={stats.total}
                  tint="#146C5B"
                />
                <StatCard
                  icon={TrendingUp}
                  label="Active"
                  value={stats.active}
                  tint="#1F8A57"
                />
                <StatCard
                  icon={ShieldQuestion}
                  label="Pending verification"
                  value={stats.pending}
                  tint="#B4531F"
                />
                <StatCard
                  icon={AlertTriangle}
                  label="Suspended"
                  value={stats.suspended}
                  tint="#C0392B"
                />
              </div>

              <div className="grid lg:grid-cols-5 gap-4">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E4E7EC] p-5">
                  <h3 className="text-sm font-semibold text-[#101828] mb-4">
                    Users by role
                  </h3>
                  <div className="space-y-3">
                    {stats.byRole.map(({ role, count }) => (
                      <div key={role} className="flex items-center gap-3">
                        <div className="w-28 text-xs text-[#475467] flex-shrink-0">
                          {role}
                        </div>
                        <div className="flex-1 h-2.5 rounded-full bg-[#F1F2F4] overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${(count / stats.total) * 100}%`,
                              background: ROLE_META[role].color,
                            }}
                          />
                        </div>
                        <div className="w-6 text-xs font-semibold text-[#101828] text-right">
                          {count}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-3 bg-white rounded-2xl border border-[#E4E7EC] p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-[#101828]">
                      Service area
                    </h3>
                    <button
                      onClick={() => setTab("map")}
                      className="text-xs font-medium text-[#146C5B] hover:underline"
                    >
                      Open full map →
                    </button>
                  </div>
                  <MapView users={users} height={240} />
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#E4E7EC] p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-[#101828]">
                    Recent activity
                  </h3>
                  <button
                    onClick={() => setTab("activity")}
                    className="text-xs font-medium text-[#146C5B] hover:underline"
                  >
                    View all →
                  </button>
                </div>
                <div className="divide-y divide-[#F1F2F4]">
                  {audit.slice(0, 4).map((a) => (
                    <AuditRow key={a.id} a={a} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* -------- Directory -------- */}
          {tab === "directory" && (
            <div className="space-y-4">
              {/* Controls */}
              <div className="bg-white p-4 rounded-2xl border border-[#E4E7EC] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                <div className="w-full lg:w-72 relative">
                  <Search
                    size={15}
                    className="absolute inset-y-0 left-3 my-auto text-[#98A2B3]"
                  />
                  <input
                    type="text"
                    placeholder="Search name, email, or phone…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-[#F7F8FA] border border-transparent focus:border-[#146C5B] focus:bg-white rounded-xl text-sm outline-none transition-all"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {["All", ...ROLES].map((r) => (
                    <FilterPill
                      key={r}
                      active={roleFilter === r}
                      onClick={() => setRoleFilter(r)}
                      label={r}
                    />
                  ))}
                  <span className="w-px h-5 bg-[#E4E7EC] mx-1 hidden sm:block" />
                  {["All", ...STATUSES].map((s) => (
                    <FilterPill
                      key={s}
                      active={statusFilter === s}
                      onClick={() => setStatusFilter(s)}
                      label={s}
                    />
                  ))}
                  <span className="w-px h-5 bg-[#E4E7EC] mx-1 hidden sm:block" />
                  {["All", ...VERIFICATIONS].map((v) => (
                    <FilterPill
                      key={v}
                      active={verifyFilter === v}
                      onClick={() => setVerifyFilter(v)}
                      label={v}
                    />
                  ))}
                </div>
              </div>

              {/* Bulk action bar */}
              {selectedIds.length > 0 && (
                <div className="bg-[#101828] text-white rounded-2xl px-5 py-3 flex items-center justify-between">
                  <span className="text-sm">{selectedIds.length} selected</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => bulkAction("activate")}
                      className="text-xs font-medium px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      Activate
                    </button>
                    <button
                      onClick={() => bulkAction("suspend")}
                      className="text-xs font-medium px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      Suspend
                    </button>
                    <button
                      onClick={() => bulkAction("export")}
                      className="text-xs font-medium px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-1"
                    >
                      <Download size={12} />
                      Export
                    </button>
                    <button
                      onClick={() => bulkAction("delete")}
                      className="text-xs font-medium px-3 py-1.5 rounded-full bg-[#C0392B] hover:bg-[#A6301F] transition-colors flex items-center gap-1"
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                    <button
                      onClick={() => setSelectedIds([])}
                      className="text-xs text-[#9AA4B2] hover:text-white ml-1"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}

              {/* Table */}
              <div className="bg-white rounded-2xl border border-[#E4E7EC] overflow-visible">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#F1F2F4] text-[11px] font-semibold text-[#98A2B3] uppercase tracking-wider bg-[#FAFAFB]">
                        <th className="py-3 pl-6 pr-2 w-8">
                          <input
                            type="checkbox"
                            checked={
                              pagedUsers.length > 0 &&
                              pagedUsers.every((u) =>
                                selectedIds.includes(u.id),
                              )
                            }
                            onChange={toggleSelectAllOnPage}
                            className="rounded border-[#D0D5DD]"
                          />
                        </th>
                        <SortableTh
                          label="User"
                          k="name"
                          sortKey={sortKey}
                          sortDir={sortDir}
                          onClick={sortToggle}
                        />
                        <th className="py-3 px-3">Role</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3">Verification</th>
                        <th className="py-3 px-3">Location</th>
                        <SortableTh
                          label="Joined"
                          k="joinedDate"
                          sortKey={sortKey}
                          sortDir={sortDir}
                          onClick={sortToggle}
                        />
                        <SortableTh
                          label="Last active"
                          k="lastActive"
                          sortKey={sortKey}
                          sortDir={sortDir}
                          onClick={sortToggle}
                        />
                        <th className="py-3 px-3 text-right pr-6">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1F2F4] text-sm">
                      {pagedUsers.length > 0 ? (
                        pagedUsers.map((user) => (
                          <tr
                            key={user.id}
                            className="hover:bg-[#FAFAFB] transition-colors"
                          >
                            <td className="py-3.5 pl-6 pr-2">
                              <input
                                type="checkbox"
                                checked={selectedIds.includes(user.id)}
                                onChange={() => toggleSelect(user.id)}
                                className="rounded border-[#D0D5DD]"
                              />
                            </td>
                            <td className="py-3.5 px-3">
                              <button
                                onClick={() => setDrawerUser(user)}
                                className="flex items-center gap-3 text-left"
                              >
                                <Avatar user={user} />
                                <div>
                                  <div className="font-medium text-[#101828]">
                                    {user.name}
                                  </div>
                                  <div className="text-xs text-[#98A2B3]">
                                    {user.email}
                                  </div>
                                </div>
                              </button>
                            </td>
                            <td className="py-3.5 px-3">
                              <RoleBadge role={user.role} />
                            </td>
                            <td className="py-3.5 px-3">
                              <StatusPill status={user.status} />
                            </td>
                            <td className="py-3.5 px-3">
                              <VerifyBadge verification={user.verification} />
                            </td>
                            <td className="py-3.5 px-3">
                              <button
                                onClick={() => setDrawerUser(user)}
                                className="text-xs font-medium text-[#146C5B] hover:underline flex items-center gap-1"
                              >
                                <MapPin size={12} /> {user.location.name}
                              </button>
                            </td>
                            <td className="py-3.5 px-3 text-xs text-[#667085] font-mono">
                              {fmtDate(user.joinedDate)}
                            </td>
                            <td className="py-3.5 px-3 text-xs text-[#667085] font-mono">
                              {timeAgo(user.lastActive)}
                            </td>
                            <td className="py-3.5 px-3 pr-6 text-right relative">
                              <button
                                onClick={() =>
                                  setOpenMenuId(
                                    openMenuId === user.id ? null : user.id,
                                  )
                                }
                                className="p-1.5 rounded-lg hover:bg-[#F1F2F4] transition-colors"
                              >
                                <MoreVertical
                                  size={15}
                                  className="text-[#667085]"
                                />
                              </button>
                              {openMenuId === user.id && (
                                <div className="absolute right-6 top-10 z-40 w-48 bg-white border border-[#E4E7EC] rounded-xl shadow-lg py-1.5 text-left">
                                  <MenuItem
                                    icon={Edit3}
                                    label="Edit details"
                                    onClick={() => {
                                      setEditingUser(user);
                                      setOpenMenuId(null);
                                    }}
                                  />
                                  {user.verification !== "Verified" && (
                                    <MenuItem
                                      icon={ShieldCheck}
                                      label="Mark verified"
                                      onClick={() =>
                                        requestVerify(user, "Verified")
                                      }
                                    />
                                  )}
                                  {user.verification !== "Rejected" && (
                                    <MenuItem
                                      icon={ShieldAlert}
                                      label="Reject verification"
                                      onClick={() =>
                                        requestVerify(user, "Rejected")
                                      }
                                    />
                                  )}
                                  {user.status !== "Active" && (
                                    <MenuItem
                                      icon={CheckCircle2}
                                      label="Activate"
                                      onClick={() =>
                                        requestStatusChange(user, "Active")
                                      }
                                    />
                                  )}
                                  {user.status === "Active" && (
                                    <MenuItem
                                      icon={XCircle}
                                      label="Deactivate"
                                      onClick={() =>
                                        requestStatusChange(user, "Inactive")
                                      }
                                    />
                                  )}
                                  {user.status !== "Suspended" && (
                                    <MenuItem
                                      icon={AlertTriangle}
                                      label="Suspend account"
                                      onClick={() =>
                                        requestStatusChange(user, "Suspended")
                                      }
                                      danger
                                    />
                                  )}
                                  <div className="h-px bg-[#F1F2F4] my-1" />
                                  <MenuItem
                                    icon={Trash2}
                                    label="Delete user"
                                    onClick={() => requestDelete(user)}
                                    danger
                                  />
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="9"
                            className="py-14 text-center text-[#98A2B3] text-sm"
                          >
                            No users match your filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-6 py-3.5 border-t border-[#F1F2F4]">
                  <span className="text-xs text-[#667085]">
                    Showing {pagedUsers.length ? (page - 1) * pageSize + 1 : 0}–
                    {Math.min(page * pageSize, filteredUsers.length)} of{" "}
                    {filteredUsers.length}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="p-1.5 rounded-lg border border-[#E4E7EC] disabled:opacity-40 hover:bg-[#F1F2F4] transition-colors"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <span className="text-xs text-[#475467] px-2">
                      {page} / {totalPages}
                    </span>
                    <button
                      disabled={page === totalPages}
                      onClick={() => setPage((p) => p + 1)}
                      className="p-1.5 rounded-lg border border-[#E4E7EC] disabled:opacity-40 hover:bg-[#F1F2F4] transition-colors"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* -------- Map -------- */}
          {tab === "map" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-1.5">
                {["All", ...ROLES].map((r) => (
                  <FilterPill
                    key={r}
                    active={roleFilter === r}
                    onClick={() => setRoleFilter(r)}
                    label={r}
                  />
                ))}
              </div>
              <MapView
                users={
                  roleFilter === "All"
                    ? users
                    : users.filter((u) => u.role === roleFilter)
                }
                height={520}
                onMarkerClick={setDrawerUser}
              />
              <div className="flex flex-wrap gap-4">
                {ROLES.map((r) => (
                  <div
                    key={r}
                    className="flex items-center gap-2 text-xs text-[#475467]"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: ROLE_META[r].color }}
                    />
                    {r}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* -------- Activity -------- */}
          {tab === "activity" && (
            <div className="bg-white rounded-2xl border border-[#E4E7EC] p-5">
              <div className="divide-y divide-[#F1F2F4]">
                {audit.map((a) => (
                  <AuditRow key={a.id} a={a} />
                ))}
              </div>
            </div>
          )}

          {/* -------- Settings -------- */}
          {tab === "settings" && (
            <div className="bg-white rounded-2xl border border-[#E4E7EC] p-8 text-center text-sm text-[#667085]">
              Admin role permissions, notification rules, and API access will
              live here.
            </div>
          )}
        </main>
      </div>

      {/* ---------------- Drawer: user detail ---------------- */}
      {drawerUser && (
        <div
          className="fixed inset-0 z-[80] bg-black/30 backdrop-blur-sm flex justify-end"
          onClick={() => setDrawerUser(null)}
        >
          <div
            className="bg-white w-full max-w-md h-full overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-[#F1F2F4] flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar user={drawerUser} size={48} />
                <div>
                  <div className="font-semibold text-[#101828]">
                    {drawerUser.name}
                  </div>
                  <div className="text-xs text-[#98A2B3]">
                    {drawerUser.role} · #
                    {String(drawerUser.id).padStart(4, "0")}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setDrawerUser(null)}
                className="w-8 h-8 rounded-full bg-[#F1F2F4] flex items-center justify-center hover:bg-[#E4E7EC] transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex flex-wrap gap-2">
                <StatusPill status={drawerUser.status} />
                <VerifyBadge verification={drawerUser.verification} />
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-[#F7F8FA] rounded-xl p-3">
                  <div className="text-[10px] uppercase text-[#98A2B3] font-semibold mb-1">
                    {drawerUser.metricLabel}
                  </div>
                  <div className="text-xl font-semibold text-[#101828]">
                    {drawerUser.metric}
                  </div>
                </div>
                <div className="bg-[#F7F8FA] rounded-xl p-3">
                  <div className="text-[10px] uppercase text-[#98A2B3] font-semibold mb-1">
                    Member since
                  </div>
                  <div className="text-sm font-semibold text-[#101828] pt-1.5">
                    {fmtDate(drawerUser.joinedDate)}
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-[#475467]">
                  <Mail size={14} className="text-[#98A2B3]" />{" "}
                  {drawerUser.email}
                </div>
                <div className="flex items-center gap-2 text-[#475467]">
                  <Phone size={14} className="text-[#98A2B3]" />{" "}
                  {drawerUser.phone}
                </div>
                <div className="flex items-center gap-2 text-[#475467]">
                  <Clock size={14} className="text-[#98A2B3]" /> Active{" "}
                  {timeAgo(drawerUser.lastActive)}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-[#475467] mb-2 flex items-center gap-1.5">
                  <MapPin size={13} /> Last known location
                </div>
                <MapView
                  users={[drawerUser]}
                  height={200}
                  focusUser={drawerUser}
                />
                <div className="text-xs text-[#98A2B3] mt-1.5">
                  {drawerUser.location.name}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    setEditingUser(drawerUser);
                    setDrawerUser(null);
                  }}
                  className="flex-1 text-xs font-medium border border-[#E4E7EC] text-[#344054] rounded-full py-2.5 hover:bg-[#F1F2F4] transition-colors flex items-center justify-center gap-1.5"
                >
                  <Edit3 size={13} /> Edit
                </button>
                {drawerUser.status !== "Suspended" ? (
                  <button
                    onClick={() => requestStatusChange(drawerUser, "Suspended")}
                    className="flex-1 text-xs font-medium border border-[#F3D6D2] text-[#C0392B] rounded-full py-2.5 hover:bg-[#FCEAE8] transition-colors"
                  >
                    Suspend
                  </button>
                ) : (
                  <button
                    onClick={() => requestStatusChange(drawerUser, "Active")}
                    className="flex-1 text-xs font-medium border border-[#CDE9DA] text-[#1F8A57] rounded-full py-2.5 hover:bg-[#E7F6EE] transition-colors"
                  >
                    Reactivate
                  </button>
                )}
                <button
                  onClick={() => requestDelete(drawerUser)}
                  className="text-xs font-medium bg-[#C0392B] hover:bg-[#A6301F] text-white rounded-full py-2.5 px-4 transition-colors flex items-center gap-1.5"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- Add / Edit modal ---------------- */}
      {editingUser !== null && (
        <UserFormModal
          initial={editingUser}
          onCancel={() => setEditingUser(null)}
          onSave={saveUser}
        />
      )}

      <ConfirmDialog
        open={!!confirm}
        title={confirm?.title}
        body={confirm?.body}
        danger={confirm?.danger}
        confirmLabel={confirm?.confirmLabel}
        onConfirm={confirm?.onConfirm}
        onCancel={() => setConfirm(null)}
      />

      <Toast toasts={toasts} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* More small components                                                */
/* ------------------------------------------------------------------ */

function StatCard({ icon: Icon, label, value, tint }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E4E7EC] p-4 flex items-center gap-3.5">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${tint}1A` }}
      >
        <Icon size={18} style={{ color: tint }} />
      </div>
      <div>
        <div className="text-xl font-semibold text-[#101828] leading-tight">
          {value}
        </div>
        <div className="text-xs text-[#667085]">{label}</div>
      </div>
    </div>
  );
}

function FilterPill({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all whitespace-nowrap ${
        active
          ? "bg-[#101828] text-white shadow-sm"
          : "bg-[#F7F8FA] text-[#475467] hover:bg-[#EDEEF1]"
      }`}
    >
      {label}
    </button>
  );
}

function SortableTh({ label, k, sortKey, sortDir, onClick }) {
  const active = sortKey === k;
  return (
    <th className="py-3 px-3">
      <button
        onClick={() => onClick(k)}
        className={`flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider ${active ? "text-[#101828]" : "text-[#98A2B3]"}`}
      >
        {label}{" "}
        <ArrowUpDown
          size={11}
          className={
            active ? (sortDir === "asc" ? "" : "rotate-180") : "opacity-40"
          }
        />
      </button>
    </th>
  );
}

function MenuItem({ icon: Icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium hover:bg-[#F7F8FA] transition-colors ${danger ? "text-[#C0392B]" : "text-[#344054]"}`}
    >
      <Icon size={14} /> {label}
    </button>
  );
}

function AuditRow({ a }) {
  const verbColor =
    {
      verified: "#1F8A57",
      activated: "#1F8A57",
      added: "#146C5B",
      suspended: "#C0392B",
      rejected: "#C0392B",
      deleted: "#C0392B",
      "bulk-deleted": "#C0392B",
      "bulk-suspended": "#C0392B",
      deactivated: "#667085",
      edited: "#2B6CB0",
      "bulk-activated": "#1F8A57",
    }[a.action] || "#667085";
  return (
    <div className="flex items-center gap-3 py-3">
      <div
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ background: verbColor }}
      />
      <div className="flex-1 text-sm text-[#344054]">
        <span className="font-medium text-[#101828]">{a.actor}</span>{" "}
        {a.action.replace("-", " ")}{" "}
        <span className="font-medium text-[#101828]">{a.target}</span>
      </div>
      <div className="text-xs text-[#98A2B3] font-mono flex-shrink-0">
        {timeAgo(a.time)}
      </div>
    </div>
  );
}

function UserFormModal({ initial, onCancel, onSave }) {
  const isEdit = !!initial.id;
  const [form, setForm] = useState({
    id: initial.id,
    name: initial.name || "",
    email: initial.email || "",
    phone: initial.phone || "",
    role: initial.role || "Donator",
    locationName: initial.location?.name || "San Francisco, CA",
    status: initial.status,
    verification: initial.verification,
  });

  const submit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email) return;
    onSave(isEdit ? { ...initial, ...form } : form);
  };

  return (
    <div className="fixed inset-0 z-[85] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-[#F1F2F4] flex justify-between items-center">
          <h3 className="text-base font-semibold text-[#101828]">
            {isEdit ? "Edit user" : "Add new platform user"}
          </h3>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-full bg-[#F1F2F4] flex items-center justify-center hover:bg-[#E4E7EC] transition-colors"
          >
            <X size={15} />
          </button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <Field label="Full name">
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Alex Mercer"
              className="input"
            />
          </Field>
          <Field label="Email address">
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="alex.m@example.com"
              className="input"
            />
          </Field>
          <Field label="Phone">
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="(415) 555-0100"
              className="input"
            />
          </Field>
          <Field label="System role">
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="input"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Base location">
            <input
              value={form.locationName}
              onChange={(e) =>
                setForm({ ...form, locationName: e.target.value })
              }
              placeholder="e.g. Downtown, SF"
              className="input"
            />
          </Field>
          <style>{`.input{width:100%;padding:.5rem .75rem;background:#F7F8FA;border:1px solid transparent;border-radius:.75rem;font-size:.875rem;outline:none;transition:.15s}.input:focus{border-color:#146C5B;background:#fff}`}</style>
          <div className="pt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs font-medium text-[#475467] hover:bg-[#F1F2F4] rounded-full transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#146C5B] hover:bg-[#0F5647] text-white text-xs font-medium px-5 py-2 rounded-full transition-all shadow-sm active:scale-95"
            >
              {isEdit ? "Save changes" : "Save user"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#475467] mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}
