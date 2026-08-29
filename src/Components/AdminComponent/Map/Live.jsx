import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Navigation,
  Phone,
  BatteryCharging,
  ShieldCheck,
  Clock,
  Search,
} from "lucide-react";

export default function DeliveryPersonsMapSection() {
  // Sample data for delivery persons
  const [deliveryPersons, setDeliveryPersons] = useState([
    {
      id: 1,
      name: "Kasun Perera",
      status: "On Delivery",
      location: "Colombo 07, Cinnamon Gardens",
      battery: "88%",
      speed: "34 km/h",
      eta: "12 mins",
      phone: "+94 77 123 4567",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      color: "bg-[#34C759]",
    },
    {
      id: 2,
      name: "Nuwan Silva",
      status: "Idle / Ready",
      location: "Dehiwala Junction",
      battery: "94%",
      speed: "0 km/h",
      eta: "Available",
      phone: "+94 71 987 6543",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      color: "bg-[#0071E3]",
    },
    {
      id: 3,
      name: "Avishka Fernando",
      status: "Returning",
      location: "Bambalapadiya Station Rd",
      battery: "45%",
      speed: "28 km/h",
      eta: "25 mins",
      phone: "+94 75 456 7890",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      color: "bg-[#FF9500]",
    },
  ]);

  const [selectedPerson, setSelectedPerson] = useState(deliveryPersons[0]);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPersons = deliveryPersons.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-[#1D1D1F]">
            Live Fleet Tracking
          </h2>
          <p className="text-sm text-[#86868B] mt-1">
            Real-time coordinates and status of all active delivery personnel.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#F5F5F7] px-3.5 py-2 rounded-full border border-[#D2D2D7]/50 text-xs font-medium text-[#1D1D1F]">
            <span className="w-2 h-2 rounded-full bg-[#34C759] animate-pulse" />
            <span>3 Drivers Online</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar List + Map View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[650px]">
        {/* Left Side: Delivery Persons List (4 Cols) */}
        <div className="lg:col-span-4 bg-[#F5F5F7]/70 backdrop-blur-xl border border-[#D2D2D7]/60 rounded-3xl p-5 flex flex-col h-full shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
          {/* Search Box */}
          <div className="relative mb-4">
            <Search className="w-4 h-4 text-[#86868B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search driver or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/80 border border-[#D2D2D7]/60 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#1D1D1F] placeholder-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-all"
            />
          </div>

          {/* List */}
          <div className="space-y-3 overflow-y-auto pr-1 flex-1">
            {filteredPersons.map((person) => {
              const isSelected = selectedPerson.id === person.id;
              return (
                <motion.div
                  key={person.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setSelectedPerson(person)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                    isSelected
                      ? "bg-white border-[#0071E3]/40 shadow-[0_8px_20px_rgba(0,113,227,0.08)]"
                      : "bg-white/60 border-black/[0.04] hover:bg-white/90"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={person.avatar}
                          alt={person.name}
                          className="w-10 h-10 rounded-full object-cover border border-black/10"
                        />
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ${person.color} border-2 border-white`}
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-[#1D1D1F]">
                          {person.name}
                        </h4>
                        <span className="text-[11px] font-medium text-[#86868B]">
                          {person.status}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-[#0071E3] bg-[#0071E3]/10 px-2 py-1 rounded-lg">
                      {person.eta}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#6E6E73] pt-2 border-t border-black/[0.04]">
                    <div className="flex items-center gap-1.5 truncate max-w-[160px]">
                      <MapPin className="w-3.5 h-3.5 text-[#86868B] shrink-0" />
                      <span className="truncate">{person.location}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <BatteryCharging className="w-3.5 h-3.5 text-[#34C759]" />
                        {person.battery}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Map Container (8 Cols) */}
        <div className="lg:col-span-8 bg-[#EAEAEA] border border-[#D2D2D7]/60 rounded-3xl relative overflow-hidden flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
          {/* Simulated Map Visual Background */}
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#86868B_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* Map Top Floating Bar */}
          <div className="relative z-10 p-5 flex items-center justify-between">
            <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-black/5 shadow-sm flex items-center gap-2 text-xs font-medium text-[#1D1D1F]">
              <Navigation className="w-3.5 h-3.5 text-[#0071E3]" />
              <span>
                Viewing Live Coordinates:{" "}
                <strong className="text-[#0071E3]">
                  {selectedPerson.name}
                </strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button className="bg-white/80 hover:bg-white backdrop-blur-md px-3 py-2 rounded-xl border border-black/5 text-xs font-medium text-[#1D1D1F] shadow-sm transition-all">
                Satellite View
              </button>
              <button className="bg-[#1D1D1F] text-white px-3 py-2 rounded-xl text-xs font-medium shadow-sm hover:bg-black transition-all">
                Recenter Map
              </button>
            </div>
          </div>

          {/* Central Map Pins / Interactive Graphic Area */}
          <div className="relative z-10 flex-1 flex items-center justify-center p-8">
            {/* Simulated Radar Ping / Selected Driver Pin Highlight */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0.8 }}
              animate={{ scale: 1.1, opacity: 1 }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="absolute bg-[#0071E3]/15 w-48 h-48 rounded-full pointer-events-none"
            />

            {/* Driver Marker Card on Map */}
            <div className="bg-white/90 backdrop-blur-xl p-4 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.12)] border border-black/10 max-w-xs w-full">
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={selectedPerson.avatar}
                  alt={selectedPerson.name}
                  className="w-12 h-12 rounded-full object-cover border border-black/10"
                />
                <div>
                  <h4 className="text-sm font-semibold text-[#1D1D1F]">
                    {selectedPerson.name}
                  </h4>
                  <p className="text-xs text-[#86868B]">
                    {selectedPerson.status}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs bg-[#F5F5F7] p-3 rounded-xl mb-3">
                <div className="flex justify-between">
                  <span className="text-[#86868B]">Current Location:</span>
                  <span className="font-medium text-[#1D1D1F]">
                    {selectedPerson.location}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#86868B]">Current Speed:</span>
                  <span className="font-medium text-[#1D1D1F]">
                    {selectedPerson.speed}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#86868B]">Estimated Time:</span>
                  <span className="font-medium text-[#0071E3]">
                    {selectedPerson.eta}
                  </span>
                </div>
              </div>

              <a
                href={`tel:${selectedPerson.phone}`}
                className="w-full bg-[#0071E3] hover:bg-[#0077ED] text-white py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Driver ({selectedPerson.phone})</span>
              </a>
            </div>
          </div>

          {/* Map Bottom Legend Bar */}
          <div className="relative z-10 p-5 bg-white/70 backdrop-blur-md border-t border-black/5 flex items-center justify-between text-xs text-[#6E6E73]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#34C759]" /> On
                Delivery
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0071E3]" /> Idle
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF9500]" />{" "}
                Returning
              </span>
            </div>
            <div className="font-medium text-[#1D1D1F] flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-[#34C759]" />
              <span>Encrypted GPS Tracking Active</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
