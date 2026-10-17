import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import AdminApi from "../../../API/AdminApi";
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

const ROLE_META = {
  Donator: { color: "#000101", bg: "#5c6764", label: "Donator" },
  Recipient: { color: "#edeff4", bg: "#1b1613", label: "Recipient" },
  Volunteer: { color: "#dc1919", bg: "#0d0d10", label: "Volunteer" },
  "Delivery Person": {
    color: "#2B6CB0",
    bg: "#E7F0FA",
    label: "Delivery Person",
  },
  Admin: { color: "#1F8A57", bg: "#E7F6EE", label: "Admin" },
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
/* Mock audit seed data                                              */
/* ------------------------------------------------------------------ */

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
];

/* ------------------------------------------------------------------ */
/* Helpers                                                           */
/* ------------------------------------------------------------------ */

const initials = (name = "") =>
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
      u.location?.name,
      u.joinedDate,
    ]
      .map((v) => `"${String(v || "").replace(/"/g, '""')}"`)
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
/* Leaflet loader hook                                               */
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
      return () => clearInterval(check);
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
      [6.9271, 79.8612],
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
      if (!u.location?.lat || !u.location?.lng) return;
      const isFocus = focusUser && focusUser.id === u.id;
      const roleColor = ROLE_META[u.role]?.color || "#2B6CB0";

      const marker = L.marker([u.location.lat, u.location.lng], {
        icon: pinIcon(roleColor, isFocus),
      }).addTo(mapRef.current);

      marker.bindPopup(
        `<div style="font-family:Inter,sans-serif;min-width:160px">
           <div style="font-weight:600;font-size:13px;color:#101828;margin-bottom:2px">${u.name}</div>
           <div style="font-size:11px;color:${roleColor};font-weight:600;margin-bottom:4px">${u.role}</div>
           <div style="font-size:11px;color:#667085">${u.location?.name || ""}</div>
           <div style="font-size:11px;color:#667085;margin-top:2px">${u.status} &middot; ${u.verification}</div>
         </div>`,
      );
      if (onMarkerClick) marker.on("click", () => onMarkerClick(u));
      markersRef.current.push(marker);
    });

    if (focusUser && focusUser.location?.lat && focusUser.location?.lng) {
      mapRef.current.setView(
        [focusUser.location.lat, focusUser.location.lng],
        14,
        { animate: true },
      );
    } else if (users.length) {
      const validUsersWithCoords = users.filter(
        (u) => u.location?.lat && u.location?.lng,
      );
      if (validUsersWithCoords.length > 0) {
        const bounds = L.latLngBounds(
          validUsersWithCoords.map((u) => [u.location.lat, u.location.lng]),
        );
        mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      }
    }
  }, [users, focusUser, onMarkerClick]);

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
/* Small UI atoms                                                    */
/* ------------------------------------------------------------------ */

function Avatar({ user, size = 36 }) {
  const meta = ROLE_META[user.role] || { bg: "#E7F0FA", color: "#2B6CB0" };
  const ring = STATUS_META[user.status]?.dot || "#98A2B3";
  return (
    <div
      className="relative flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <div
        className="w-full h-full rounded-full flex items-center justify-center font-semibold overflow-hidden"
        style={{
          background: meta.bg,
          color: meta.color,
          fontSize: size * 0.36,
        }}
      >
        {user.profileImage ? (
          <img
            src={user.profileImage}
            alt={user.name}
            className="w-full h-full object-cover"
          />
        ) : (
          initials(user.name)
        )}
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
  const m = ROLE_META[role] || { bg: "#E7F0FA", color: "#2B6CB0" };
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
  const m = STATUS_META[status] || {
    color: "#667085",
    bg: "#F1F2F4",
    dot: "#98A2B3",
  };
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
  const m = VERIFY_META[verification] || VERIFY_META.Pending;
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
          className="bg-[#101828] text-white text-sm px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2"
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
/* Mapping API to UI model                                            */
/* ------------------------------------------------------------------ */
const mapApiUserToUiUser = (user) => {
  const roleMap = {
    DONOR: "Donator",
    RECIPIENT: "Recipient",
    VOLUNTEER: "Volunteer",
    DELIVERY_PERSON: "Delivery Person",
    DELIVERY: "Delivery Person",
    ADMIN: "Admin",
  };

  return {
    id: user._id,
    name: user.fullName || "Unknown User",
    email: user.email || "",
    phone: user.phoneNumber || "",
    role: roleMap[user.role] || user.role || "Unknown",
    status: user.isActive ? "Active" : "Inactive",
    verification:
      user.verificationStatus === "VERIFIED"
        ? "Verified"
        : user.verificationStatus === "REJECTED"
          ? "Rejected"
          : "Pending",
    location: {
      lat: user.location?.latitude || 6.9271,
      lng: user.location?.longitude || 79.8612,
      name: user.address || "Location unavailable",
    },
    joinedDate: user.createdAt || new Date().toISOString(),
    lastActive: user.updatedAt || user.createdAt || new Date().toISOString(),
    metric: 0,
    metricLabel:
      user.role === "DELIVERY_PERSON"
        ? "deliveries"
        : user.role === "VOLUNTEER"
          ? "shifts completed"
          : user.role === "RECIPIENT"
            ? "pickups received"
            : "meals donated",
    profileImage: user.profileImage?.url || null,
  };
};

export default function GleanOpsAdmin() {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState("");
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
  const [confirm, setConfirm] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        setUsersError("");
        const response = await AdminApi.get("/admin/users");
        if (response.data.success) {
          const mappedUsers = response.data.users.map(mapApiUserToUiUser);
          setUsers(mappedUsers);
        } else {
          setUsersError("Failed to load users.");
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
        setUsersError(
          error.response?.data?.message ||
            "Failed to load users. Please try again.",
        );
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

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

  const setUserField = (id, patch) =>
    setUsers((us) => us.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  const requestStatusChange = (user, newStatus) => {
    setOpenMenuId(null);

    const isSuspending = newStatus === "Suspended";

    if (!isSuspending && newStatus !== "Active") return;

    setConfirm({
      title: `${isSuspending ? "Suspend" : "Activate"} ${user.name}?`,
      body: isSuspending
        ? "This will suspend the user's account and restrict platform access."
        : "This will reactivate the user's account and restore platform access.",
      danger: isSuspending,
      confirmLabel: isSuspending ? "Suspend account" : "Activate account",

      onConfirm: async () => {
        try {
          const endpoint = isSuspending
            ? `/admin/users/${user.id}/suspend`
            : `/admin/users/${user.id}/activate`;

          const response = await AdminApi.put(endpoint);
          const data = response.data;

          if (!data.success) {
            pushToast(
              data.message ||
                `Failed to ${isSuspending ? "suspend" : "activate"} user`,
              "error",
            );
            return;
          }

          // Update UI only after the backend confirms success.
          const updatedStatus =
            data.user?.isActive === false
              ? "Suspended"
              : data.user?.isActive === true
                ? "Active"
                : newStatus;

          setUserField(user.id, {
            status: updatedStatus,
          });

          // Record activity.
          logAudit(isSuspending ? "suspended" : "activated", user.name);

          // Notify user.
          pushToast(
            data.message ||
              `${user.name} was ${isSuspending ? "suspended" : "activated"}`,
            "success",
          );

          setConfirm(null);
        } catch (error) {
          console.error(
            `${isSuspending ? "Suspend" : "Activate"} User Error:`,
            error,
          );

          pushToast(
            error.response?.data?.message ||
              `Failed to ${isSuspending ? "suspend" : "activate"} user. Please try again.`,
            "error",
          );
        }
      },
    });
  };
  const requestVerify = async (user, verification) => {
    setOpenMenuId(null);

    const verificationStatus =
      verification === "Verified" ? "VERIFIED" : "REJECTED";

    try {
      const response = await AdminApi.put(
        `/admin/users/${user.id}/verification`,
        { verificationStatus },
      );

      if (!response.data.success) {
        pushToast(
          response.data.message || "Failed to update verification",
          "error",
        );
        return;
      }

      const updatedVerification =
        response.data.user?.verificationStatus === "VERIFIED"
          ? "Verified"
          : response.data.user?.verificationStatus === "REJECTED"
            ? "Rejected"
            : verification;

      setUserField(user.id, {
        verification: updatedVerification,
      });

      logAudit(
        updatedVerification === "Verified" ? "verified" : "rejected",
        user.name,
      );

      pushToast(
        response.data.message ||
          `${user.name} marked ${updatedVerification.toLowerCase()}`,
        "success",
      );
    } catch (error) {
      console.error("Update Verification Error:", error);

      pushToast(
        error.response?.data?.message ||
          "Failed to update verification. Please try again.",
        "error",
      );
    }
  };

  const requestDelete = (user) => {
    setOpenMenuId(null);

    setConfirm({
      title: `Delete ${user.name}?`,
      body: "This permanently removes their profile from the database. This action cannot be undone.",
      danger: true,
      confirmLabel: "Delete permanently",

      onConfirm: async () => {
        try {
          const response = await AdminApi.delete(`/admin/users/${user.id}`);

          if (!response.data.success) {
            pushToast(
              response.data.message || "Failed to delete user",
              "error",
            );
            return;
          }

          // Update the UI only after backend deletion succeeds.
          setUsers((currentUsers) =>
            currentUsers.filter((u) => u.id !== user.id),
          );

          setSelectedIds((selected) => selected.filter((id) => id !== user.id));

          logAudit("deleted", user.name);

          pushToast(
            response.data.message || `${user.name} was deleted`,
            "success",
          );

          setConfirm(null);

          if (drawerUser?.id === user.id) {
            setDrawerUser(null);
          }
        } catch (error) {
          console.error("Delete User Error:", error);

          pushToast(
            error.response?.data?.message ||
              "Failed to delete user. Please try again.",
            "error",
          );
        }
      },
    });
  };

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

      {/* ---------------- Main Area ---------------- */}
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
                "Manage profiles, verify accounts, and update permissions."}
              {tab === "map" &&
                "Real-time positions of every active account in your service area."}
              {tab === "activity" &&
                "Recent admin actions across the platform."}
              {tab === "settings" && "Console preferences."}
            </p>
          </div>
        </header>

        {/* Content body */}
        <main className="flex-1 p-5 sm:p-8 max-w-7xl w-full mx-auto">
          {/* DIRECTORY TAB */}
          {tab === "directory" && (
            <div className="space-y-6">
              {loadingUsers && (
                <div className="bg-white rounded-2xl border border-[#E4E7EC] p-6 text-center">
                  <div className="text-sm text-[#667085]">Loading users...</div>
                </div>
              )}

              {usersError && !loadingUsers && (
                <div className="bg-[#FCEAE8] border border-[#F3D6D2] rounded-2xl p-4 flex items-center justify-between">
                  <div className="text-sm text-[#C0392B]">{usersError}</div>
                  <button
                    onClick={() => window.location.reload()}
                    className="text-xs font-medium text-[#C0392B] hover:underline"
                  >
                    Retry
                  </button>
                </div>
              )}

              {!loadingUsers && !usersError && (
                <div className="bg-white rounded-2xl border border-[#E4E7EC] p-4 sm:p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
                    <div className="relative w-full sm:w-72">
                      <Search
                        className="absolute left-3.5 top-2.5 text-[#98A2B3]"
                        size={16}
                      />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-sm border border-[#E4E7EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#146C5B]/20 focus:border-[#146C5B]"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#E4E7EC] text-xs font-semibold text-[#667085]">
                          <th className="py-3 px-4">User</th>
                          <th className="py-3 px-4">Role</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">Verification</th>
                          <th className="py-3 px-4">Location</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E4E7EC] text-sm">
                        {pagedUsers.map((u) => (
                          <tr
                            key={u.id}
                            className="hover:bg-[#F7F8FA] transition-colors"
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <Avatar user={u} size={36} />
                                <div>
                                  <div className="font-medium text-[#101828]">
                                    {u.name}
                                  </div>
                                  <div className="text-xs text-[#667085]">
                                    {u.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <RoleBadge role={u.role} />
                            </td>
                            <td className="py-3 px-4">
                              <StatusPill status={u.status} />
                            </td>
                            <td className="py-3 px-4">
                              <VerifyBadge verification={u.verification} />
                            </td>
                            <td className="py-3 px-4 text-[#667085] text-xs">
                              {u.location?.name || "N/A"}
                            </td>
                            <td className="py-3 px-4 text-right relative">
                              <button
                                onClick={() =>
                                  setOpenMenuId(
                                    openMenuId === u.id ? null : u.id,
                                  )
                                }
                                className="p-1.5 hover:bg-[#F1F2F4] rounded-lg transition-colors"
                              >
                                <MoreVertical
                                  size={16}
                                  className="text-[#667085]"
                                />
                              </button>
                              {openMenuId === u.id && (
                                <div className="absolute right-4 top-12 z-20 w-44 bg-white rounded-xl shadow-lg border border-[#E4E7EC] py-1 text-left">
                                  <button
                                    onClick={() =>
                                      requestStatusChange(
                                        u,
                                        u.status === "Active"
                                          ? "Suspended"
                                          : "Active",
                                      )
                                    }
                                    className="w-full px-4 py-2 text-xs text-[#344054] hover:bg-[#F7F8FA]"
                                  >
                                    {u.status === "Active"
                                      ? "Suspend user"
                                      : "Activate user"}
                                  </button>
                                  <button
                                    onClick={() =>
                                      requestVerify(
                                        u,
                                        u.verification === "Verified"
                                          ? "Rejected"
                                          : "Verified",
                                      )
                                    }
                                    className="w-full px-4 py-2 text-xs text-[#344054] hover:bg-[#F7F8FA]"
                                  >
                                    {u.verification === "Verified"
                                      ? "Reject verification"
                                      : "Verify user"}
                                  </button>
                                  <button
                                    onClick={() => requestDelete(u)}
                                    className="w-full px-4 py-2 text-xs text-[#C0392B] hover:bg-[#FCEAE8]"
                                  >
                                    Delete user
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                        {pagedUsers.length === 0 && (
                          <tr>
                            <td
                              colSpan="6"
                              className="py-8 text-center text-sm text-[#667085]"
                            >
                              No users found matching your search.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#E4E7EC]">
                      <span className="text-xs text-[#667085]">
                        Page {page} of {totalPages}
                      </span>
                      <div className="flex gap-2">
                        <button
                          disabled={page === 1}
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          className="px-3 py-1 text-xs border border-[#E4E7EC] rounded-lg disabled:opacity-50"
                        >
                          Previous
                        </button>
                        <button
                          disabled={page === totalPages}
                          onClick={() =>
                            setPage((p) => Math.min(totalPages, p + 1))
                          }
                          className="px-3 py-1 text-xs border border-[#E4E7EC] rounded-lg disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* OVERVIEW TAB */}
          {tab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-[#E4E7EC]">
                  <div className="text-xs font-semibold text-[#667085] uppercase tracking-wider">
                    Total Users
                  </div>
                  <div className="text-2xl font-bold text-[#101828] mt-1">
                    {stats.total}
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-[#E4E7EC]">
                  <div className="text-xs font-semibold text-[#667085] uppercase tracking-wider">
                    Active Users
                  </div>
                  <div className="text-2xl font-bold text-[#1F8A57] mt-1">
                    {stats.active}
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-[#E4E7EC]">
                  <div className="text-xs font-semibold text-[#667085] uppercase tracking-wider">
                    Pending Verification
                  </div>
                  <div className="text-2xl font-bold text-[#B4531F] mt-1">
                    {stats.pending}
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-[#E4E7EC]">
                  <div className="text-xs font-semibold text-[#667085] uppercase tracking-wider">
                    Suspended
                  </div>
                  <div className="text-2xl font-bold text-[#C0392B] mt-1">
                    {stats.suspended}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#E4E7EC] p-6">
                <h3 className="text-base font-semibold text-[#101828] mb-4">
                  Quick Map Preview
                </h3>
                <MapView users={users} height={320} />
              </div>
            </div>
          )}

          {/* LIVE MAP TAB */}
          {tab === "map" && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-[#E4E7EC] p-6">
                <h3 className="text-base font-semibold text-[#101828] mb-2">
                  Live Fleet & User Locations
                </h3>
                <p className="text-xs text-[#667085] mb-4">
                  Click any marker to inspect user status and contact
                  information.
                </p>
                <MapView users={users} height={540} />
              </div>
            </div>
          )}

          {/* ACTIVITY LOG TAB */}
          {tab === "activity" && (
            <div className="bg-white rounded-2xl border border-[#E4E7EC] p-6">
              <h3 className="text-base font-semibold text-[#101828] mb-4">
                Admin Activity Log
              </h3>
              <div className="space-y-4">
                {audit.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-3 border-b border-[#E4E7EC] text-sm"
                  >
                    <div>
                      <span className="font-medium text-[#101828]">
                        {item.actor}
                      </span>
                      <span className="text-[#667085]"> {item.action} </span>
                      <span className="font-medium text-[#101828]">
                        {item.target}
                      </span>
                    </div>
                    <div className="text-xs text-[#667085]">
                      {timeAgo(item.time)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {tab === "settings" && (
            <div className="bg-white rounded-2xl border border-[#E4E7EC] p-6 max-w-xl">
              <h3 className="text-base font-semibold text-[#101828] mb-4">
                Console Preferences
              </h3>
              <p className="text-sm text-[#667085]">
                Console settings are currently locked to administrator defaults.
              </p>
            </div>
          )}
        </main>
      </div>

      <Toast toasts={toasts} />
      <ConfirmDialog
        open={!!confirm}
        title={confirm?.title}
        body={confirm?.body}
        confirmLabel={confirm?.confirmLabel}
        danger={confirm?.danger}
        onConfirm={confirm?.onConfirm}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
