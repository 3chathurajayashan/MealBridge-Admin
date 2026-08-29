import React, { useState, useEffect } from "react";
import { Shield, Terminal, Cpu, Navigation, Globe2, Radio } from "lucide-react";

export function AdminFooter() {
  const currentYear = new Date().getFullYear();

  // State for coordinates read from localStorage (defaulting to Colombo, Sri Lanka if not found)
  const [coords, setCoords] = useState({ lat: 6.9271, lng: 79.8612 });
  const [lastSynced, setLastSynced] = useState("Just now");

  useEffect(() => {
    // Read longitude and latitude from localStorage safely
    const storedLat = localStorage.getItem("admin_lat");
    const storedLng = localStorage.getItem("admin_lng");

    if (storedLat && storedLng) {
      setCoords({
        lat: parseFloat(storedLat),
        lng: parseFloat(storedLng),
      });
      setLastSynced(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    }
  }, []);

  // Generate high-grade professional dark/clean Google Maps embedded URL using coordinates
  const mapEmbedUrl = `https://maps.google.com/maps?q=${coords.lat},${coords.lng}&z=14&output=embed`;

  return (
    <footer className="w-full bg-[#F5F5F7]/90 backdrop-blur-2xl border-t border-[#D2D2D7]/80 py-6 px-8 font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Display','SF_Pro_Text','Helvetica_Neue',Helvetica,Arial,sans-serif] select-none text-[#86868B]">
      <div className="max-w-7xl mx-auto flex flex-col gap-5">
        {/* Top / Main Footer Info Row */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 pb-2 border-b border-[#D2D2D7]/40">
          {/* Left Column: Brand & Security Context */}
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-[#1D1D1F] flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                MB
              </div>
              <span className="text-[13px] font-semibold text-[#1D1D1F] tracking-tight">
                MealBridge Global Operations
              </span>
            </div>
            <span className="hidden sm:inline text-[#D2D2D7]">|</span>
            <p className="text-[12px] text-[#86868B] font-normal">
              Enterprise Management Console &copy; {currentYear}
            </p>
          </div>

          {/* Center Column: Diagnostic Metrics / Telemetry Pill */}
          <div className="flex items-center gap-4 bg-white/90 px-4 py-1.5 rounded-2xl border border-[#D2D2D7]/60 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-2 text-[11px] font-medium text-[#424245]">
              <Cpu className="w-3.5 h-3.5 text-[#0066CC]" />
              <span>
                Cluster:{" "}
                <strong className="text-[#1D1D1F] font-semibold">
                  lk-colombo-node-01
                </strong>
              </span>
            </div>
            <span className="text-[#D2D2D7]">/</span>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#424245]">
              <Terminal className="w-3.5 h-3.5 text-[#86868B]" />
              <span>
                Ping:{" "}
                <strong className="text-emerald-600 font-semibold">18ms</strong>
              </span>
            </div>
            <span className="text-[#D2D2D7]">/</span>
            <div className="flex items-center gap-1.5 text-[11px] font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-700 font-semibold">
                Operational
              </span>
            </div>
          </div>

          {/* Right Column: Regulatory & Security Links */}
          <div className="flex items-center gap-6 text-[12px] font-medium text-[#424245]">
            <a
              href="#compliance"
              className="hover:text-[#0066CC] transition-colors flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5 text-[#86868B]" />
              <span>SOC2 Certified</span>
            </a>
            <a
              href="#security"
              className="hover:text-[#0066CC] transition-colors"
            >
              Security Portal
            </a>
          </div>
        </div>

        {/* Bottom Row: Sleek Enterprise GIS Location Telemetry Panel */}
        <div className="w-full bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-[#D2D2D7]/60 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col md:flex-row items-center gap-5">
          {/* Admin Metadata Telemetry Sidebar */}
          <div className="flex flex-col justify-between w-full md:w-72 space-y-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0066CC]/10 to-[#0066CC]/5 border border-[#0066CC]/20 flex items-center justify-center text-[#0066CC] shadow-inner">
                <Navigation className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-[13px] font-semibold text-[#1D1D1F] tracking-tight">
                    Active Regional Node
                  </p>
                  <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
                </div>
                <p className="text-[11px] text-[#86868B] font-medium">
                  Sri Lanka Secure Gateway
                </p>
              </div>
            </div>

            <div className="bg-[#F5F5F7] p-3 rounded-xl border border-[#D2D2D7]/40 space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-[#86868B]">Latitude:</span>
                <span className="font-mono font-semibold text-[#1D1D1F]">
                  {coords.lat.toFixed(5)}° N
                </span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-[#86868B]">Longitude:</span>
                <span className="font-mono font-semibold text-[#1D1D1F]">
                  {coords.lng.toFixed(5)}° E
                </span>
              </div>
              <div className="flex justify-between text-[11px] pt-1 border-t border-[#D2D2D7]/40">
                <span className="text-[#86868B]">Telemetry Sync:</span>
                <span className="text-emerald-600 font-medium">
                  {lastSynced}
                </span>
              </div>
            </div>
          </div>

          {/* High-Fidelity Embedded Google Map Frame */}
          <div className="w-full h-36 md:h-32 rounded-xl overflow-hidden border border-[#D2D2D7]/60 bg-[#F5F5F7] relative shadow-inner group">
            <iframe
              title="Admin Sri Lanka Location Map"
              src={mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0, filter: "contrast(1.05) saturate(1.1)" }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            {/* Subtle overlay header tag on the map */}
            <div className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#D2D2D7]/60 text-[10px] font-semibold text-[#1D1D1F] shadow-sm flex items-center gap-1.5 pointer-events-none">
              <Globe2 className="w-3 h-3 text-[#0066CC]" />
              <span>Sri Lanka Operations Grid</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default AdminFooter;
