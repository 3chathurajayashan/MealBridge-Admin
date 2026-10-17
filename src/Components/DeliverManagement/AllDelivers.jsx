import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import QRCode from "qrcode";
import {
  Search,
  RefreshCw,
  Package,
  CheckCircle2,
  Clock3,
  Truck,
  MapPin,
  CalendarDays,
  UserRound,
  Mail,
  Phone,
  UtensilsCrossed,
  AlertCircle,
  ExternalLink,
  X,
  MoreHorizontal,
  Download,
  Trash2,
  Copy,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Ban,
  Check,
  QrCode,
} from "lucide-react";
import { DonationsApi } from "../../API/donations.api";

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

const STATUSES = ["AVAILABLE", "CLAIMED", "COMPLETED", "CANCELLED", "EXPIRED"];

const STATUS_DOT = {
  AVAILABLE: "bg-[#34c759]",
  CLAIMED: "bg-[#ff9f0a]",
  COMPLETED: "bg-[#0071e3]",
  CANCELLED: "bg-[#ff3b30]",
  EXPIRED: "bg-[#8e8e93]",
};

const SORTS = {
  newest: "Newest first",
  oldest: "Oldest first",
  expiring: "Expiring soonest",
  name: "Name A–Z",
  quantity: "Quantity high–low",
};

const PAGE_SIZES = [10, 25, 50];

const FONT = {
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
};

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const formatDate = (value) => {
  if (!value) return "Not specified";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not specified";
  return date.toLocaleString("en-LK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatShortDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-LK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatCategory = (category = "OTHER") =>
  String(category)
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const formatStatus = (status = "UNKNOWN") =>
  String(status).charAt(0).toUpperCase() +
  String(status).slice(1).toLowerCase();

const normStatus = (d) => (d.status || "UNKNOWN").toUpperCase();

const timeLeft = (value) => {
  if (!value) return null;
  const diff = new Date(value).getTime() - Date.now();
  if (Number.isNaN(diff)) return null;
  if (diff <= 0) return "Ended";
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min left`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 48) return `${hrs} hr left`;
  return `${Math.floor(hrs / 24)} days left`;
};

const csvCell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

const exportCsv = (rows) => {
  const headers = [
    "ID",
    "Food",
    "Category",
    "Quantity",
    "Unit",
    "Status",
    "Description",
    "Pickup address",
    "Latitude",
    "Longitude",
    "Available from",
    "Available until",
    "Created",
    "Claimed at",
    "Donor name",
    "Donor email",
    "Donor phone",
    "Claimed by name",
    "Claimed by email",
    "Claimed by phone",
  ];
  const lines = rows.map((d) =>
    [
      d._id,
      d.foodName,
      d.category,
      d.quantity,
      d.quantityUnit,
      d.status,
      d.description,
      d.pickupAddress,
      d.pickupLocation?.latitude,
      d.pickupLocation?.longitude,
      d.availableFrom,
      d.availableUntil,
      d.createdAt,
      d.claimedAt,
      d.donor?.fullName,
      d.donor?.email,
      d.donor?.phoneNumber,
      d.claimedBy?.fullName,
      d.claimedBy?.email,
      d.claimedBy?.phoneNumber,
    ]
      .map(csvCell)
      .join(","),
  );
  const blob = new Blob(
    [[headers.map(csvCell).join(","), ...lines].join("\n")],
    {
      type: "text/csv;charset=utf-8;",
    },
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `donations-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

/* ------------------------------- QR helpers ------------------------------- */
/*  The QR code encodes a link, not the data itself. Scanning opens the       */
/*  /donation/:id route (DonationScanPage below), which loads live details.   */

const donationQrUrl = (d) => `${window.location.origin}/donation/${d._id}`;

const downloadQr = async (d) => {
  const url = donationQrUrl(d);
  const qrSize = 720;
  const pad = 60;

  const qrCanvas = document.createElement("canvas");
  await QRCode.toCanvas(qrCanvas, url, {
    width: qrSize,
    margin: 1,
    errorCorrectionLevel: "M",
  });

  // Labeled card: QR + food name + ID
  const canvas = document.createElement("canvas");
  canvas.width = qrSize + pad * 2;
  canvas.height = qrSize + pad * 2 + 110;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(qrCanvas, pad, pad);

  ctx.textAlign = "center";
  ctx.fillStyle = "#1d1d1f";
  ctx.font = "600 38px -apple-system, Helvetica, Arial, sans-serif";
  ctx.fillText(
    String(d.foodName || "Donation").slice(0, 34),
    canvas.width / 2,
    qrSize + pad + 60,
  );
  ctx.fillStyle = "#86868b";
  ctx.font = "26px -apple-system, Helvetica, Arial, sans-serif";
  ctx.fillText(`ID: ${d._id}`, canvas.width / 2, qrSize + pad + 100);

  const a = document.createElement("a");
  a.href = canvas.toDataURL("image/png");
  a.download = `donation-qr-${d._id}.png`;
  a.click();
};

/* -------------------------------------------------------------------------- */
/*  API wiring (admin actions)                                                 */
/*  Delete is connected to DELETE /api/donations/:id via DonationsApi.         */
/*  Status controls only appear if DonationsApi.updateDonationStatus exists.   */
/* -------------------------------------------------------------------------- */

const CAN_UPDATE_STATUS =
  typeof DonationsApi.updateDonationStatus === "function";

const apiUpdateStatus = (id, status) =>
  DonationsApi.updateDonationStatus(id, status);

const apiDelete = (id) => DonationsApi.deleteDonation(id);

/* -------------------------------------------------------------------------- */
/*  Small UI pieces                                                            */
/* -------------------------------------------------------------------------- */

export function StatusPill({ status }) {
  const s = (status || "UNKNOWN").toUpperCase();
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap text-[13px] font-medium text-[#1d1d1f]">
      <span
        className={`h-2 w-2 rounded-full ${STATUS_DOT[s] || "bg-[#8e8e93]"}`}
      />
      {formatStatus(s)}
    </span>
  );
}

function Thumb({ donation, size = "h-12 w-12", icon = 20 }) {
  return donation.foodImage?.url ? (
    <img
      src={donation.foodImage.url}
      alt={donation.foodName}
      className={`${size} shrink-0 rounded-xl bg-[#f5f5f7] object-cover`}
    />
  ) : (
    <div
      className={`${size} flex shrink-0 items-center justify-center rounded-xl bg-[#f5f5f7] text-[#86868b]`}
    >
      <UtensilsCrossed size={icon} />
    </div>
  );
}

function Stat({ label, value, icon: Icon, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group rounded-3xl bg-white p-6 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] ${
        active
          ? "ring-2 ring-[#0071e3]"
          : "hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
      }`}
    >
      <div className="flex items-center justify-between text-[#86868b]">
        <span className="text-[15px] font-medium">{label}</span>
        <Icon size={20} strokeWidth={1.75} />
      </div>
      <p className="mt-4 text-[44px] font-semibold leading-none tracking-[-0.03em] text-[#1d1d1f]">
        {value}
      </p>
    </button>
  );
}

function Segmented({ value, onChange, options }) {
  return (
    <div className="inline-flex rounded-full bg-[#e8e8ed] p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-label={o.label}
          onClick={() => onChange(o.value)}
          className={`flex h-8 w-10 items-center justify-center rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] ${
            value === o.value
              ? "bg-white text-[#1d1d1f] shadow-sm"
              : "text-[#6e6e73] hover:text-[#1d1d1f]"
          }`}
        >
          <o.icon size={16} />
        </button>
      ))}
    </div>
  );
}

function Checkbox({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className={`flex h-[18px] w-[18px] items-center justify-center rounded-full border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] ${
        checked
          ? "border-[#0071e3] bg-[#0071e3] text-white"
          : "border-[#c7c7cc] bg-white hover:border-[#86868b]"
      }`}
    >
      {checked && <Check size={12} strokeWidth={3} />}
    </button>
  );
}

const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-full bg-[#0071e3] px-5 py-2 text-[14px] font-medium text-white transition hover:bg-[#0077ed] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 disabled:opacity-50";
const btnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-full bg-[#e8e8ed] px-5 py-2 text-[14px] font-medium text-[#1d1d1f] transition hover:bg-[#dcdce1] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] disabled:opacity-50";
const btnDanger =
  "inline-flex items-center justify-center gap-2 rounded-full bg-[#ff3b30] px-5 py-2 text-[14px] font-medium text-white transition hover:bg-[#e8342a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff3b30] focus-visible:ring-offset-2 disabled:opacity-50";

/* ---------------------------- Row action menu ---------------------------- */

function ActionMenu({ donation, onStatus, onDelete, onCopy, onQr, onClose }) {
  const current = normStatus(donation);
  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onClose} />
      <div
        role="menu"
        className="absolute right-0 top-10 z-40 w-56 overflow-hidden rounded-2xl bg-white/95 py-1.5 text-left shadow-[0_12px_40px_rgba(0,0,0,0.18)] ring-1 ring-black/5 backdrop-blur-xl"
      >
        {CAN_UPDATE_STATUS && (
          <>
            <p className="px-4 pb-1 pt-1.5 text-[12px] font-medium text-[#86868b]">
              Change status
            </p>
            {STATUSES.filter((s) => s !== current).map((s) => (
              <button
                key={s}
                type="button"
                role="menuitem"
                onClick={() => onStatus(donation, s)}
                className="flex w-full items-center gap-3 px-4 py-2 text-left text-[14px] text-[#1d1d1f] hover:bg-[#f5f5f7]"
              >
                <span className={`h-2 w-2 rounded-full ${STATUS_DOT[s]}`} />
                Mark as {s.toLowerCase()}
              </button>
            ))}
            <div className="my-1.5 h-px bg-[#e8e8ed]" />
          </>
        )}
        <button
          type="button"
          role="menuitem"
          onClick={() => onQr(donation)}
          className="flex w-full items-center gap-3 px-4 py-2 text-left text-[14px] text-[#1d1d1f] hover:bg-[#f5f5f7]"
        >
          <QrCode size={15} className="text-[#86868b]" />
          Download QR code
        </button>
        <button
          type="button"
          role="menuitem"
          onClick={() => onCopy(donation)}
          className="flex w-full items-center gap-3 px-4 py-2 text-left text-[14px] text-[#1d1d1f] hover:bg-[#f5f5f7]"
        >
          <Copy size={15} className="text-[#86868b]" />
          Copy donation ID
        </button>
        <button
          type="button"
          role="menuitem"
          onClick={() => onDelete([donation])}
          className="flex w-full items-center gap-3 px-4 py-2 text-left text-[14px] text-[#ff3b30] hover:bg-[#f5f5f7]"
        >
          <Trash2 size={15} />
          Delete donation
        </button>
      </div>
    </>
  );
}

/* ------------------------------- Detail sheet ---------------------------- */

export function Field({ icon: Icon, label, value }) {
  return (
    <div className="min-w-0 py-3">
      <p className="flex items-center gap-1.5 text-[12px] font-medium text-[#86868b]">
        {Icon && <Icon size={13} />}
        {label}
      </p>
      <p className="mt-1 break-words text-[15px] text-[#1d1d1f]">{value}</p>
    </div>
  );
}

export function PersonBlock({ title, person, emptyText }) {
  return (
    <div className="rounded-2xl bg-[#f5f5f7] p-5">
      <p className="text-[12px] font-medium text-[#86868b]">{title}</p>
      {!person ? (
        <p className="mt-3 text-[14px] text-[#6e6e73]">{emptyText}</p>
      ) : (
        <div className="mt-3 space-y-3">
          <div className="flex items-center gap-3">
            {person.profileImage?.url ? (
              <img
                src={person.profileImage.url}
                alt={person.fullName || title}
                className="h-11 w-11 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#86868b]">
                <UserRound size={20} />
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold text-[#1d1d1f]">
                {person.fullName || "Unknown user"}
              </p>
              {person._id && (
                <p className="truncate text-[12px] text-[#86868b]">
                  {person._id}
                </p>
              )}
            </div>
          </div>
          {person.email && (
            <a
              href={`mailto:${person.email}`}
              className="flex items-center gap-2 break-all text-[14px] text-[#0066cc] hover:underline"
            >
              <Mail size={14} className="shrink-0" />
              {person.email}
            </a>
          )}
          {person.phoneNumber && (
            <a
              href={`tel:${person.phoneNumber}`}
              className="flex items-center gap-2 text-[14px] text-[#0066cc] hover:underline"
            >
              <Phone size={14} className="shrink-0" />
              {person.phoneNumber}
            </a>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------ Pickup map ------------------------------- */
/*  Embedded Google map. No API key and no extra dependency needed.           */

export function PickupMap({ latitude, longitude, address }) {
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (latitude == null || longitude == null) return null;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const src = `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;

  return (
    <div className="mt-6 overflow-hidden rounded-3xl bg-[#f5f5f7]">
      <iframe
        title="Pickup location map"
        src={src}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="h-64 w-full border-0"
      />
      <div className="flex items-center justify-between gap-3 px-5 py-3 text-[14px]">
        <span className="flex min-w-0 items-center gap-1.5 text-[#6e6e73]">
          <MapPin size={14} className="shrink-0" />
          <span className="truncate">{address || "Pickup location"}</span>
        </span>
        <a
          href={`https://www.google.com/maps?q=${lat},${lng}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 text-[#0066cc] hover:underline"
        >
          Open in Maps
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
}

/* ------------------------------ QR preview ------------------------------- */

function QrPreview({ donation, onDownload }) {
  const [src, setSrc] = useState("");

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(donationQrUrl(donation), {
      width: 320,
      margin: 1,
      errorCorrectionLevel: "M",
    })
      .then((url) => !cancelled && setSrc(url))
      .catch(() => !cancelled && setSrc(""));
    return () => {
      cancelled = true;
    };
  }, [donation._id]);

  return (
    <div className="mt-4 flex items-center gap-5 rounded-2xl bg-[#f5f5f7] p-5">
      {src ? (
        <img
          src={src}
          alt={`QR code for ${donation.foodName}`}
          className="h-28 w-28 shrink-0 rounded-xl bg-white p-2"
        />
      ) : (
        <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-xl bg-white text-[#86868b]">
          <QrCode size={32} strokeWidth={1.5} />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-[12px] font-medium text-[#86868b]">QR code</p>
        <p className="mt-1 text-[14px] text-[#6e6e73]">
          Scan to open the full details of this donation.
        </p>
        <button
          type="button"
          onClick={() => onDownload(donation)}
          className={`${btnPrimary} mt-3`}
        >
          <Download size={15} />
          Download QR
        </button>
      </div>
    </div>
  );
}

function DetailSheet({
  donation,
  busy,
  onClose,
  onStatus,
  onDelete,
  onCopy,
  onQr,
}) {
  const [showRaw, setShowRaw] = useState(false);

  useEffect(() => {
    if (!donation) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [donation, onClose]);

  useEffect(() => setShowRaw(false), [donation?._id]);

  if (!donation) return null;

  const current = normStatus(donation);
  const loc = donation.pickupLocation;
  const hasLoc = loc?.latitude != null && loc?.longitude != null;
  const left =
    current === "AVAILABLE" ? timeLeft(donation.availableUntil) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="donation-title"
        className="flex h-full w-full max-w-xl flex-col bg-white shadow-2xl"
        style={FONT}
      >
        <header className="flex items-center justify-between border-b border-[#e8e8ed] px-6 py-4">
          <p className="text-[15px] font-semibold text-[#1d1d1f]">Donation</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8e8ed] text-[#6e6e73] hover:bg-[#dcdce1] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]"
          >
            <X size={16} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 pb-8">
          {donation.foodImage?.url ? (
            <img
              src={donation.foodImage.url}
              alt={donation.foodName}
              className="mt-6 h-64 w-full rounded-3xl bg-[#f5f5f7] object-cover"
            />
          ) : (
            <div className="mt-6 flex h-40 items-center justify-center rounded-3xl bg-[#f5f5f7] text-[#86868b]">
              <UtensilsCrossed size={44} strokeWidth={1.5} />
            </div>
          )}

          <h2
            id="donation-title"
            className="mt-6 text-[32px] font-semibold leading-tight tracking-[-0.02em] text-[#1d1d1f]"
          >
            {donation.foodName}
          </h2>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[15px] text-[#6e6e73]">
            <StatusPill status={donation.status} />
            <span>{formatCategory(donation.category)}</span>
            <span className="font-medium text-[#1d1d1f]">
              {donation.quantity} {donation.quantityUnit || "units"}
            </span>
            {left && <span>{left}</span>}
          </div>

          <p className="mt-6 whitespace-pre-wrap text-[15px] leading-relaxed text-[#424245]">
            {donation.description || "No description provided."}
          </p>

          {/* Admin actions */}
          <div className="mt-8 rounded-2xl bg-[#f5f5f7] p-5">
            <p className="text-[12px] font-medium text-[#86868b]">
              Admin actions
            </p>
            {CAN_UPDATE_STATUS && (
              <div className="mt-3 flex flex-wrap gap-2">
                {STATUSES.filter((s) => s !== current).map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={busy}
                    onClick={() => onStatus(donation, s)}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[13px] font-medium text-[#1d1d1f] shadow-sm transition hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] disabled:opacity-50"
                  >
                    <span className={`h-2 w-2 rounded-full ${STATUS_DOT[s]}`} />
                    Mark as {s.toLowerCase()}
                  </button>
                ))}
              </div>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onCopy(donation)}
                className={btnSecondary}
              >
                <Copy size={15} />
                Copy ID
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => onDelete([donation])}
                className={btnDanger}
              >
                <Trash2 size={15} />
                Delete
              </button>
            </div>
          </div>

          {/* QR code */}
          <QrPreview donation={donation} onDownload={onQr} />

          <div className="mt-6 divide-y divide-[#e8e8ed]">
            <Field
              icon={MapPin}
              label="Pickup address"
              value={donation.pickupAddress || "Not specified"}
            />
            <Field
              icon={Clock3}
              label="Available from"
              value={formatDate(donation.availableFrom)}
            />
            <Field
              icon={CalendarDays}
              label="Available until"
              value={formatDate(donation.availableUntil)}
            />
            <Field
              icon={CalendarDays}
              label="Created"
              value={formatDate(donation.createdAt)}
            />
            {donation.updatedAt && (
              <Field
                icon={CalendarDays}
                label="Last updated"
                value={formatDate(donation.updatedAt)}
              />
            )}
            {donation.claimedAt && (
              <Field
                icon={CheckCircle2}
                label="Claimed at"
                value={formatDate(donation.claimedAt)}
              />
            )}
            {donation.completedAt && (
              <Field
                icon={CheckCircle2}
                label="Completed at"
                value={formatDate(donation.completedAt)}
              />
            )}
            <Field label="Donation ID" value={donation._id} />
          </div>

          {/* Map replaces the raw latitude / longitude values */}
          {hasLoc && (
            <PickupMap
              latitude={loc.latitude}
              longitude={loc.longitude}
              address={donation.pickupAddress}
            />
          )}

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <PersonBlock
              title="Donor"
              person={donation.donor}
              emptyText="Donor information is unavailable."
            />
            <PersonBlock
              title="Claimed by"
              person={donation.claimedBy}
              emptyText="This donation has not been claimed."
            />
          </div>

          <button
            type="button"
            onClick={() => setShowRaw((v) => !v)}
            className="mt-8 text-[14px] text-[#0066cc] hover:underline"
          >
            {showRaw ? "Hide all fields" : "Show all fields"}
          </button>
          {showRaw && (
            <pre className="mt-3 max-h-80 overflow-auto rounded-2xl bg-[#f5f5f7] p-4 text-[12px] leading-5 text-[#424245]">
              {JSON.stringify(donation, null, 2)}
            </pre>
          )}
        </div>
      </aside>
    </div>
  );
}

/* ------------------------------ Confirm dialog --------------------------- */

function ConfirmDialog({ items, busy, onCancel, onConfirm }) {
  useEffect(() => {
    if (!items) return undefined;
    const onKey = (e) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [items, onCancel]);

  if (!items) return null;
  const many = items.length > 1;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      style={FONT}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        className="w-full max-w-sm rounded-3xl bg-white p-7 text-center shadow-2xl"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#ff3b30]/10 text-[#ff3b30]">
          <Trash2 size={22} />
        </div>
        <h3 className="mt-5 text-[21px] font-semibold tracking-[-0.01em] text-[#1d1d1f]">
          {many ? `Delete ${items.length} donations?` : "Delete this donation?"}
        </h3>
        <p className="mt-2 text-[15px] leading-relaxed text-[#6e6e73]">
          {many
            ? "These donations will be removed permanently. This can’t be undone."
            : `“${items[0].foodName}” will be removed permanently. This can’t be undone.`}
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className={btnDanger}
          >
            {busy ? "Deleting…" : "Delete"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className={btnSecondary}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page opened when a donation QR code is scanned                             */
/*  Route:  <Route path="/donation/:id" element={<DonationScanPage />} />      */
/*  Make sure DonationsApi.getDonationById(id) exists (adjust the name if      */
/*  your API calls it something else). Protect the route with login if you     */
/*  don't want donor / claimer contact details visible to everyone.            */
/* -------------------------------------------------------------------------- */

export function DonationScanPage() {
  const { id } = useParams();
  const [d, setD] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;
    setD(null);
    setErr("");
    DonationsApi.getDonationById(id)
      .then((res) => {
        if (!cancelled) setD(res?.data ?? res);
      })
      .catch((e) => {
        if (!cancelled)
          setErr(e instanceof Error ? e.message : "Unable to load donation.");
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (err) {
    return (
      <main
        className="mx-auto flex min-h-screen max-w-xl items-center justify-center p-6"
        style={FONT}
      >
        <div className="flex items-start gap-3 rounded-2xl bg-white p-5 ring-1 ring-[#ff3b30]/30">
          <AlertCircle size={20} className="mt-0.5 shrink-0 text-[#ff3b30]" />
          <div>
            <p className="text-[15px] font-semibold">Couldn’t load donation</p>
            <p className="mt-1 text-[14px] text-[#6e6e73]">{err}</p>
          </div>
        </div>
      </main>
    );
  }

  if (!d) {
    return (
      <main
        className="flex min-h-screen items-center justify-center bg-[#f5f5f7] text-[15px] text-[#6e6e73]"
        style={FONT}
      >
        Loading…
      </main>
    );
  }

  const left =
    normStatus(d) === "AVAILABLE" ? timeLeft(d.availableUntil) : null;

  return (
    <main className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]" style={FONT}>
      <div className="mx-auto max-w-xl px-5 pb-16 pt-8">
        {d.foodImage?.url ? (
          <img
            src={d.foodImage.url}
            alt={d.foodName}
            className="h-56 w-full rounded-3xl bg-white object-cover"
          />
        ) : (
          <div className="flex h-40 items-center justify-center rounded-3xl bg-white text-[#86868b]">
            <UtensilsCrossed size={44} strokeWidth={1.5} />
          </div>
        )}

        <h1 className="mt-6 text-[32px] font-semibold leading-tight tracking-[-0.02em]">
          {d.foodName}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[15px] text-[#6e6e73]">
          <StatusPill status={d.status} />
          <span>{formatCategory(d.category)}</span>
          <span className="font-medium text-[#1d1d1f]">
            {d.quantity} {d.quantityUnit || "units"}
          </span>
          {left && <span>{left}</span>}
        </div>

        <p className="mt-6 whitespace-pre-wrap text-[15px] leading-relaxed text-[#424245]">
          {d.description || "No description provided."}
        </p>

        <div className="mt-6 divide-y divide-[#e8e8ed] rounded-3xl bg-white px-6">
          <Field
            icon={MapPin}
            label="Pickup address"
            value={d.pickupAddress || "Not specified"}
          />
          <Field
            icon={Clock3}
            label="Available from"
            value={formatDate(d.availableFrom)}
          />
          <Field
            icon={CalendarDays}
            label="Available until"
            value={formatDate(d.availableUntil)}
          />
          <Field
            icon={CalendarDays}
            label="Created"
            value={formatDate(d.createdAt)}
          />
          {d.claimedAt && (
            <Field
              icon={CheckCircle2}
              label="Claimed at"
              value={formatDate(d.claimedAt)}
            />
          )}
          {d.completedAt && (
            <Field
              icon={CheckCircle2}
              label="Completed at"
              value={formatDate(d.completedAt)}
            />
          )}
          <Field label="Donation ID" value={d._id} />
        </div>

        <PickupMap
          latitude={d.pickupLocation?.latitude}
          longitude={d.pickupLocation?.longitude}
          address={d.pickupAddress}
        />

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <PersonBlock
            title="Donor"
            person={d.donor}
            emptyText="Donor information is unavailable."
          />
          <PersonBlock
            title="Claimed by"
            person={d.claimedBy}
            emptyText="This donation has not been claimed."
          />
        </div>
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

function AllDelivers() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [sort, setSort] = useState("newest");
  const [view, setView] = useState("table");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [detailId, setDetailId] = useState(null);
  const [menuId, setMenuId] = useState(null);
  const [confirmItems, setConfirmItems] = useState(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);

  const notify = useCallback((message, tone = "ok") => {
    setToast({ message, tone, key: Date.now() });
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const loadDonations = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const result = await DonationsApi.getAllDonations();
      setDonations(Array.isArray(result) ? result : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load donations.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDonations();
  }, [loadDonations]);

  /* ----------------------------- Derived data ---------------------------- */

  const stats = useMemo(() => {
    const count = (s) => donations.filter((d) => normStatus(d) === s).length;
    return {
      total: donations.length,
      available: count("AVAILABLE"),
      claimed: count("CLAIMED"),
      completed: count("COMPLETED"),
    };
  }, [donations]);

  const categories = useMemo(
    () => [...new Set(donations.map((d) => d.category).filter(Boolean))].sort(),
    [donations],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = donations.filter((d) => {
      if (statusFilter !== "ALL" && normStatus(d) !== statusFilter)
        return false;
      if (categoryFilter !== "ALL" && d.category !== categoryFilter)
        return false;
      if (!q) return true;
      return [
        d.foodName,
        d.description,
        d.category,
        d.pickupAddress,
        d.status,
        d._id,
        d.donor?.fullName,
        d.donor?.email,
        d.donor?.phoneNumber,
        d.claimedBy?.fullName,
        d.claimedBy?.email,
        d.claimedBy?.phoneNumber,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q);
    });

    const time = (v) => (v ? new Date(v).getTime() : Infinity);
    const sorted = [...list];
    switch (sort) {
      case "oldest":
        sorted.sort((a, b) => time(a.createdAt) - time(b.createdAt));
        break;
      case "expiring":
        sorted.sort((a, b) => time(a.availableUntil) - time(b.availableUntil));
        break;
      case "name":
        sorted.sort((a, b) =>
          String(a.foodName).localeCompare(String(b.foodName)),
        );
        break;
      case "quantity":
        sorted.sort((a, b) => (b.quantity || 0) - (a.quantity || 0));
        break;
      default:
        sorted.sort((a, b) => -(time(a.createdAt) - time(b.createdAt)));
    }
    return sorted;
  }, [donations, search, statusFilter, categoryFilter, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  useEffect(
    () => setPage(1),
    [search, statusFilter, categoryFilter, sort, pageSize],
  );

  const detail = donations.find((d) => d._id === detailId) || null;
  const selectedRows = donations.filter((d) => selectedIds.has(d._id));
  const allPageSelected =
    pageRows.length > 0 && pageRows.every((d) => selectedIds.has(d._id));
  const filtersActive =
    search || statusFilter !== "ALL" || categoryFilter !== "ALL";

  /* ------------------------------- Actions ------------------------------- */

  const toggleOne = (id, on) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });

  const toggleAllPage = (on) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      pageRows.forEach((d) => (on ? next.add(d._id) : next.delete(d._id)));
      return next;
    });

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setCategoryFilter("ALL");
  };

  const copyId = async (donation) => {
    setMenuId(null);
    try {
      await navigator.clipboard.writeText(donation._id);
      notify("Donation ID copied");
    } catch {
      notify("Couldn’t copy the ID", "error");
    }
  };

  const handleQr = async (donation) => {
    setMenuId(null);
    try {
      await downloadQr(donation);
      notify("QR code downloaded");
    } catch {
      notify("Couldn’t create the QR code", "error");
    }
  };

  const changeStatus = async (targets, status) => {
    const list = Array.isArray(targets) ? targets : [targets];
    setMenuId(null);
    setBusy(true);
    const results = await Promise.allSettled(
      list.map((d) => apiUpdateStatus(d._id, status)),
    );
    const okIds = new Set(
      list
        .filter((_, i) => results[i].status === "fulfilled")
        .map((d) => d._id),
    );
    const failed = list.length - okIds.size;

    if (okIds.size) {
      setDonations((prev) =>
        prev.map((d) => (okIds.has(d._id) ? { ...d, status } : d)),
      );
    }
    setBusy(false);

    if (failed === 0) {
      notify(
        list.length === 1
          ? `Marked as ${status.toLowerCase()}`
          : `${list.length} donations marked as ${status.toLowerCase()}`,
      );
    } else {
      const firstError = results.find((r) => r.status === "rejected")?.reason;
      notify(
        `${failed} update${failed > 1 ? "s" : ""} failed. ${
          firstError instanceof Error ? firstError.message : ""
        }`.trim(),
        "error",
      );
    }
  };

  const confirmDelete = async () => {
    if (!confirmItems) return;
    setBusy(true);
    const results = await Promise.allSettled(
      confirmItems.map((d) => apiDelete(d._id)),
    );
    const okIds = new Set(
      confirmItems
        .filter((_, i) => results[i].status === "fulfilled")
        .map((d) => d._id),
    );
    const failed = confirmItems.length - okIds.size;

    if (okIds.size) {
      setDonations((prev) => prev.filter((d) => !okIds.has(d._id)));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        okIds.forEach((id) => next.delete(id));
        return next;
      });
      if (detailId && okIds.has(detailId)) setDetailId(null);
    }
    setBusy(false);
    setConfirmItems(null);

    if (failed === 0) {
      notify(
        okIds.size === 1
          ? "Donation deleted"
          : `${okIds.size} donations deleted`,
      );
    } else {
      const firstError = results.find((r) => r.status === "rejected")?.reason;
      notify(
        `${failed} deletion${failed > 1 ? "s" : ""} failed. ${
          firstError instanceof Error ? firstError.message : ""
        }`.trim(),
        "error",
      );
    }
  };

  const askDelete = (items) => {
    setMenuId(null);
    setConfirmItems(items);
  };

  /* ------------------------------- Render -------------------------------- */

  const renderMenu = (d) => (
    <div className="relative inline-block">
      <button
        type="button"
        aria-label={`Actions for ${d.foodName}`}
        aria-haspopup="menu"
        aria-expanded={menuId === d._id}
        onClick={(e) => {
          e.stopPropagation();
          setMenuId(menuId === d._id ? null : d._id);
        }}
        className="flex h-8 w-8 items-center justify-center rounded-full text-[#6e6e73] transition hover:bg-[#e8e8ed] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]"
      >
        <MoreHorizontal size={18} />
      </button>
      {menuId === d._id && (
        <ActionMenu
          donation={d}
          onStatus={changeStatus}
          onDelete={askDelete}
          onCopy={copyId}
          onQr={handleQr}
          onClose={() => setMenuId(null)}
        />
      )}
    </div>
  );

  return (
    <main
      className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] antialiased"
      style={FONT}
    >
      {/* Sticky translucent bar */}
      <div className="sticky top-0 z-20 border-b border-black/5 bg-[#f5f5f7]/80 backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between px-5 sm:px-8">
          <p className="text-[15px] font-semibold tracking-tight">
            MealBridge Admin
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                exportCsv(selectedRows.length ? selectedRows : filtered)
              }
              disabled={loading || filtered.length === 0}
              className={btnSecondary}
            >
              <Download size={15} />
              <span className="hidden sm:inline">
                Export{" "}
                {selectedRows.length
                  ? `${selectedRows.length} selected`
                  : "CSV"}
              </span>
            </button>
            <button
              type="button"
              onClick={() => loadDonations(true)}
              disabled={loading || refreshing}
              className={btnPrimary}
            >
              <RefreshCw
                size={15}
                className={refreshing ? "animate-spin" : ""}
              />
              <span className="hidden sm:inline">
                {refreshing ? "Refreshing…" : "Refresh"}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-5 pb-24 pt-12 sm:px-8">
        {/* Heading */}
        <header>
          <h1 className="text-[40px] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-[56px]">
            All donations.
          </h1>
          <p className="mt-3 max-w-xl text-[19px] leading-snug text-[#6e6e73]">
            Review every food donation, update its status, and manage records in
            one place.
          </p>
        </header>

        {/* Stats (also act as quick filters) */}
        <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            label="Total"
            value={stats.total}
            icon={Package}
            active={statusFilter === "ALL"}
            onClick={() => setStatusFilter("ALL")}
          />
          <Stat
            label="Available"
            value={stats.available}
            icon={Clock3}
            active={statusFilter === "AVAILABLE"}
            onClick={() => setStatusFilter("AVAILABLE")}
          />
          <Stat
            label="Claimed"
            value={stats.claimed}
            icon={Truck}
            active={statusFilter === "CLAIMED"}
            onClick={() => setStatusFilter("CLAIMED")}
          />
          <Stat
            label="Completed"
            value={stats.completed}
            icon={CheckCircle2}
            active={statusFilter === "COMPLETED"}
            onClick={() => setStatusFilter("COMPLETED")}
          />
        </section>

        {/* Toolbar */}
        <section className="mt-10 flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search
              size={17}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#86868b]"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search food, donor, address, ID"
              className="h-11 w-full rounded-full bg-white pl-11 pr-4 text-[15px] outline-none ring-1 ring-black/5 transition placeholder:text-[#86868b] focus:ring-2 focus:ring-[#0071e3]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
              className="h-11 rounded-full bg-white px-4 text-[14px] font-medium outline-none ring-1 ring-black/5 focus:ring-2 focus:ring-[#0071e3]"
            >
              <option value="ALL">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {formatStatus(s)}
                </option>
              ))}
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter by category"
              className="h-11 rounded-full bg-white px-4 text-[14px] font-medium outline-none ring-1 ring-black/5 focus:ring-2 focus:ring-[#0071e3]"
            >
              <option value="ALL">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {formatCategory(c)}
                </option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort donations"
              className="h-11 rounded-full bg-white px-4 text-[14px] font-medium outline-none ring-1 ring-black/5 focus:ring-2 focus:ring-[#0071e3]"
            >
              {Object.entries(SORTS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>

            <Segmented
              value={view}
              onChange={setView}
              options={[
                { value: "table", label: "Table view", icon: List },
                { value: "grid", label: "Grid view", icon: LayoutGrid },
              ]}
            />
          </div>
        </section>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 px-1 text-[14px] text-[#6e6e73]">
          <p>
            Showing{" "}
            <span className="font-semibold text-[#1d1d1f]">
              {filtered.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-[#1d1d1f]">
              {donations.length}
            </span>{" "}
            donations
          </p>
          {filtersActive && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-[#0066cc] hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 flex items-start gap-3 rounded-2xl bg-white p-5 ring-1 ring-[#ff3b30]/30">
            <AlertCircle size={20} className="mt-0.5 shrink-0 text-[#ff3b30]" />
            <div className="flex-1">
              <p className="text-[15px] font-semibold">
                Couldn’t load donations
              </p>
              <p className="mt-1 text-[14px] text-[#6e6e73]">{error}</p>
              <button
                type="button"
                onClick={() => loadDonations()}
                className="mt-3 text-[14px] text-[#0066cc] hover:underline"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Bulk bar */}
        {selectedRows.length > 0 && (
          <div className="sticky top-[68px] z-10 mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#1d1d1f] px-5 py-3 text-white shadow-lg">
            <p className="text-[14px] font-medium">
              {selectedRows.length} selected
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {CAN_UPDATE_STATUS && (
                <>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => changeStatus(selectedRows, "COMPLETED")}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-1.5 text-[13px] font-medium hover:bg-white/25 disabled:opacity-50"
                  >
                    <CheckCircle2 size={14} />
                    Complete
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => changeStatus(selectedRows, "CANCELLED")}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-1.5 text-[13px] font-medium hover:bg-white/25 disabled:opacity-50"
                  >
                    <Ban size={14} />
                    Cancel
                  </button>
                </>
              )}
              <button
                type="button"
                disabled={busy}
                onClick={() => askDelete(selectedRows)}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#ff3b30] px-4 py-1.5 text-[13px] font-medium hover:bg-[#e8342a] disabled:opacity-50"
              >
                <Trash2 size={14} />
                Delete
              </button>
              <button
                type="button"
                onClick={() => setSelectedIds(new Set())}
                className="px-2 text-[13px] text-white/70 hover:text-white"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <section className="mt-4">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-3xl bg-white p-5">
                  <div className="h-36 rounded-2xl bg-[#f5f5f7]" />
                  <div className="mt-4 h-4 w-3/4 rounded-full bg-[#f5f5f7]" />
                  <div className="mt-3 h-3 w-1/2 rounded-full bg-[#f5f5f7]" />
                </div>
              ))}
            </div>
          ) : !error && filtered.length === 0 ? (
            <div className="rounded-3xl bg-white px-6 py-20 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f5f5f7] text-[#86868b]">
                <Package size={26} strokeWidth={1.5} />
              </div>
              <h3 className="mt-5 text-[21px] font-semibold tracking-[-0.01em]">
                {donations.length === 0
                  ? "No donations yet"
                  : "No matching donations"}
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-[15px] text-[#6e6e73]">
                {donations.length === 0
                  ? "New donations will appear here as soon as donors post them."
                  : "Try a different search term, status, or category."}
              </p>
              {filtersActive && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className={`${btnPrimary} mt-6`}
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : !error && view === "table" ? (
            <div className="overflow-hidden rounded-3xl bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] text-left">
                  <thead>
                    <tr className="border-b border-[#e8e8ed] text-[12px] font-medium text-[#86868b]">
                      <th className="w-12 py-4 pl-6">
                        <Checkbox
                          checked={allPageSelected}
                          onChange={toggleAllPage}
                          label="Select all on this page"
                        />
                      </th>
                      <th className="px-4 py-4 font-medium">Donation</th>
                      <th className="px-4 py-4 font-medium">Donor</th>
                      <th className="px-4 py-4 font-medium">Quantity</th>
                      <th className="px-4 py-4 font-medium">Pickup</th>
                      <th className="px-4 py-4 font-medium">Window</th>
                      <th className="px-4 py-4 font-medium">Status</th>
                      <th className="w-16 py-4 pr-6 text-right font-medium">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.map((d) => {
                      const checked = selectedIds.has(d._id);
                      const left =
                        normStatus(d) === "AVAILABLE"
                          ? timeLeft(d.availableUntil)
                          : null;
                      return (
                        <tr
                          key={d._id}
                          onClick={() => setDetailId(d._id)}
                          className={`cursor-pointer border-b border-[#f0f0f3] transition last:border-0 ${
                            checked
                              ? "bg-[#0071e3]/[0.05]"
                              : "hover:bg-[#fafafc]"
                          }`}
                        >
                          <td className="py-4 pl-6">
                            <Checkbox
                              checked={checked}
                              onChange={(on) => toggleOne(d._id, on)}
                              label={`Select ${d.foodName}`}
                            />
                          </td>
                          <td className="max-w-[280px] px-4 py-4">
                            <div className="flex items-center gap-3">
                              <Thumb donation={d} />
                              <div className="min-w-0">
                                <p className="truncate text-[15px] font-semibold">
                                  {d.foodName}
                                </p>
                                <p className="mt-0.5 text-[13px] text-[#6e6e73]">
                                  {formatCategory(d.category)}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <p className="max-w-[180px] truncate text-[14px] font-medium">
                              {d.donor?.fullName || "Unknown donor"}
                            </p>
                            <p className="mt-0.5 max-w-[180px] truncate text-[13px] text-[#6e6e73]">
                              {d.donor?.email ||
                                d.donor?.phoneNumber ||
                                "No contact"}
                            </p>
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 text-[14px]">
                            <span className="font-semibold">{d.quantity}</span>{" "}
                            <span className="text-[#6e6e73]">
                              {d.quantityUnit || "units"}
                            </span>
                          </td>
                          <td className="max-w-[220px] px-4 py-4 text-[14px] text-[#424245]">
                            <span className="line-clamp-2">
                              {d.pickupAddress || "Not specified"}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 text-[13px] text-[#6e6e73]">
                            <p>{formatShortDate(d.availableFrom)}</p>
                            <p className="mt-0.5">
                              {left
                                ? left
                                : `to ${formatShortDate(d.availableUntil)}`}
                            </p>
                          </td>
                          <td className="px-4 py-4">
                            <StatusPill status={d.status} />
                          </td>
                          <td
                            className="py-4 pr-6 text-right"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {renderMenu(d)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : !error ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pageRows.map((d) => {
                const checked = selectedIds.has(d._id);
                const left =
                  normStatus(d) === "AVAILABLE"
                    ? timeLeft(d.availableUntil)
                    : null;
                return (
                  <article
                    key={d._id}
                    onClick={() => setDetailId(d._id)}
                    className={`group relative cursor-pointer rounded-3xl bg-white transition hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] ${
                      checked ? "ring-2 ring-[#0071e3]" : ""
                    }`}
                  >
                    <div className="relative">
                      {d.foodImage?.url ? (
                        <img
                          src={d.foodImage.url}
                          alt={d.foodName}
                          className="h-48 w-full rounded-t-3xl bg-[#f5f5f7] object-cover"
                        />
                      ) : (
                        <div className="flex h-48 items-center justify-center rounded-t-3xl bg-[#f5f5f7] text-[#86868b]">
                          <UtensilsCrossed size={36} strokeWidth={1.5} />
                        </div>
                      )}
                      <div className="absolute left-4 top-4 rounded-full bg-white/90 p-1.5 backdrop-blur">
                        <Checkbox
                          checked={checked}
                          onChange={(on) => toggleOne(d._id, on)}
                          label={`Select ${d.foodName}`}
                        />
                      </div>
                      <div
                        className="absolute right-3 top-3 rounded-full bg-white/90 backdrop-blur"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {renderMenu(d)}
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="break-words text-[19px] font-semibold tracking-[-0.01em]">
                            {d.foodName}
                          </h3>
                          <p className="mt-0.5 text-[13px] text-[#6e6e73]">
                            {formatCategory(d.category)}
                          </p>
                        </div>
                        <StatusPill status={d.status} />
                      </div>

                      <p className="mt-3 line-clamp-2 text-[14px] leading-relaxed text-[#6e6e73]">
                        {d.description || "No description provided."}
                      </p>

                      <dl className="mt-4 space-y-2 border-t border-[#f0f0f3] pt-4 text-[13px]">
                        <div className="flex justify-between gap-4">
                          <dt className="text-[#86868b]">Quantity</dt>
                          <dd className="font-semibold">
                            {d.quantity} {d.quantityUnit || "units"}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-4">
                          <dt className="text-[#86868b]">Donor</dt>
                          <dd className="max-w-[60%] truncate font-medium">
                            {d.donor?.fullName || "Unknown donor"}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-4">
                          <dt className="text-[#86868b]">Pickup</dt>
                          <dd className="max-w-[60%] truncate text-right">
                            {d.pickupAddress || "Not specified"}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-4">
                          <dt className="text-[#86868b]">
                            {left ? "Ends" : "Created"}
                          </dt>
                          <dd>{left || formatShortDate(d.createdAt)}</dd>
                        </div>
                      </dl>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : null}
        </section>

        {/* Pagination */}
        {!loading && !error && filtered.length > 0 && (
          <footer className="mt-6 flex flex-wrap items-center justify-between gap-3 text-[14px] text-[#6e6e73]">
            <label className="flex items-center gap-2">
              Rows
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="h-9 rounded-full bg-white px-3 text-[14px] font-medium text-[#1d1d1f] outline-none ring-1 ring-black/5 focus:ring-2 focus:ring-[#0071e3]"
              >
                {PAGE_SIZES.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex items-center gap-2">
              <span>
                Page {safePage} of {totalPages}
              </span>
              <button
                type="button"
                aria-label="Previous page"
                disabled={safePage <= 1}
                onClick={() => setPage(safePage - 1)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#1d1d1f] ring-1 ring-black/5 transition hover:bg-[#e8e8ed] disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                aria-label="Next page"
                disabled={safePage >= totalPages}
                onClick={() => setPage(safePage + 1)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#1d1d1f] ring-1 ring-black/5 transition hover:bg-[#e8e8ed] disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </footer>
        )}
      </div>

      <DetailSheet
        donation={detail}
        busy={busy}
        onClose={() => setDetailId(null)}
        onStatus={changeStatus}
        onDelete={askDelete}
        onCopy={copyId}
        onQr={handleQr}
      />

      <ConfirmDialog
        items={confirmItems}
        busy={busy}
        onCancel={() => !busy && setConfirmItems(null)}
        onConfirm={confirmDelete}
      />

      {toast && (
        <div
          key={toast.key}
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-2.5 rounded-full bg-[#1d1d1f]/95 px-5 py-3 text-[14px] font-medium text-white shadow-2xl backdrop-blur"
        >
          {toast.tone === "error" ? (
            <AlertCircle size={16} className="text-[#ff453a]" />
          ) : (
            <CheckCircle2 size={16} className="text-[#30d158]" />
          )}
          {toast.message}
        </div>
      )}
    </main>
  );
}

export default AllDelivers;
