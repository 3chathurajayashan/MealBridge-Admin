import React, { useState } from "react";
import logo from "../../assets/lgg.png";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Truck,
  MapPin,
  HeartHandshake,
  UserCheck,
  ClipboardList,
  LayoutDashboard,
  ChevronRight,
  UtensilsCrossed,
} from "lucide-react";
import { motion } from "framer-motion";
import img1 from "../../../public/bg2.jpg";
import Live from "../AdminComponent/Map/Live";
import {
  FiUsers,
  FiMapPin,
  FiGift,
  FiActivity,
  FiTrendingUp,
  FiArrowUpRight,
  FiShield,
  FiCheckCircle,
} from "react-icons/fi";

const currentUser = {
  id: "6a9294b1be46d08193cd8e5e",
  fullName: "chathura jayashan",
  email: "chathura@gmail.com",
  phoneNumber: "0760429501",
  profileImage: {
    url: "https://res.cloudinary.com/dau59mvx0/image/upload/v1787991216/meal-bridge/profile-images/shfxlwdoy45quposp2iv.jpg",
    publicId: "meal-bridge/profile-images/shfxlwdoy45quposp2iv",
  },
  role: "ADMIN",
  address: "Homagama,Panagoda",
  location: { latitude: 6.7271, longitude: 79.8612 },
  isActive: true,
};

import { MessageSquare, AlertTriangle, Star, ShieldAlert } from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "#dashboard", icon: LayoutDashboard },
  { name: "User Management", href: "/admin/user", icon: Users },
  { name: "Delivery Management", href: "/admin/delivers", icon: Truck },
  { name: "Location Configs", href: "#locations", icon: MapPin },
  {
    name: "Donor Requests",
    href: "/admin/donations",
    icon: HeartHandshake,
    badge: 3,
  },
  {
    name: "Recipient Requests",
    href: "/admin/requests",
    icon: UserCheck,
    badge: 5,
  },
  { name: "Request Assigns", href: "#assigns", icon: ClipboardList },
  { name: "Feedbacks", href: "#feedbacks", icon: Star, badge: 12 },
  { name: "Complaints", href: "#complaints", icon: AlertTriangle, badge: 2 },
  {
    name: "Team Conversations",
    href: "#conversations",
    icon: MessageSquare,
    badge: 4,
  },
];

export function SideBar({ activeItem, setActiveItem }) {
  const navigate = useNavigate();
  return (
    <aside className="w-68 h-screen bg-[#ffffff] border-r border-[#E5E5EA] flex flex-col justify-between font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Display','SF_Pro_Text','Helvetica_Neue',Helvetica,Arial,sans-serif] select-none shadow-[1px_0_10px_rgba(0,0,0,0.02)] sticky top-0">
      {/* Top Header / Branding Section */}
      <div className="p-5">
        <div className="flex items-center gap-3 px-2 mb-8">
          <img
            src={logo}
            alt="MealBridge Logo"
            className="w-50 h-40 object-contain"
          />
        </div>

        {/* Section Label */}
        <div className="px-3 mb-2">
          <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
            Main Navigation
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.name;

            return (
              <button
                key={item.name}
                onClick={() => {
                  setActiveItem(item.name);

                  if (item.href.startsWith("/")) {
                    navigate(item.href);
                  }
                }}
                className={`w-full group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 text-left ${
                  isActive
                    ? "bg-white text-[#1D1D1F] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#E5E5EA]/80 font-semibold"
                    : "text-[#424245] hover:bg-black/[0.03] hover:text-[#1D1D1F]"
                }`}
              >
                {/* Active Indicator Accent Bar */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-[#FF5E62] rounded-r-full" />
                )}

                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive
                        ? "text-[#FF5E62]"
                        : "text-[#86868B] group-hover:text-[#1D1D1F]"
                    }`}
                  />
                  <span className="tracking-tight">{item.name}</span>
                </div>

                {/* Optional Counter Badges */}
                {item.badge ? (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? "bg-[#FF5E62] text-white shadow-sm shadow-orange-500/20"
                        : "bg-[#E5E5EA] text-[#424245]"
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#86868B]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / User Profile Summary */}
      <div className="p-3 m-3 rounded-2xl bg-white border border-[#E5E5EA]/80 shadow-sm flex items-center gap-3 backdrop-blur-md">
        <img
          src={currentUser.profileImage.url}
          alt={currentUser.fullName}
          className="w-9 h-9 rounded-xl object-cover border border-[#E5E5EA] shadow-inner"
        />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-[#1D1D1F] truncate tracking-tight leading-tight capitalize">
            {currentUser.fullName}
          </p>
          <p className="text-[11px] text-[#86868B] truncate font-normal mt-0.5">
            {currentUser.email}
          </p>
        </div>
      </div>
    </aside>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

function DisplayDashboard() {
  const stats = [
    {
      title: "Active Donors",
      value: "1,482",
      change: "+12.4%",
      isPositive: true,
      icon: FiUsers,
      description: "Registered restaurants & vendors",
    },
    {
      title: "Live Locations",
      value: "38",
      change: "+4.1%",
      isPositive: true,
      icon: FiMapPin,
      description: "Active collection points",
    },
    {
      title: "Donation Requests",
      value: "324",
      change: "-2.3%",
      isPositive: false,
      icon: FiGift,
      description: "Pending dispatch & verification",
    },
    {
      title: "Meals Distributed",
      value: "28,450",
      change: "+18.2%",
      isPositive: true,
      icon: FiTrendingUp,
      description: "Total impact this month",
    },
  ];

  const recentUpdates = [
    {
      id: 1,
      recipient: "Hope Community Shelter",
      items: "120 Surplus Meal Packets",
      status: "Delivered",
      time: "10 mins ago",
      location: "Colombo 07 Hub",
    },
    {
      id: 2,
      recipient: "Children Care Foundation",
      items: "85 Bakery & Produce Boxes",
      status: "In Transit",
      time: "25 mins ago",
      location: "Dehiwala Route A",
    },
    {
      id: 3,
      recipient: "Elderly Care Home",
      items: "200 Fresh Meal Servings",
      status: "Verified",
      time: "1 hour ago",
      location: "Nugegoda Center",
    },
  ];

  return (
    <motion.div
      className="flex-1 min-h-screen bg-[#FBFBFD] text-[#1D1D1F] p-8 lg:p-12 font-sans overflow-y-auto selection:bg-[#000000] selection:text-[#FFFFFF]"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Top Header Section */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl p-8 lg:p-10 mb-8 border border-[#D2D2D7]/40 shadow-sm bg-cover bg-center"
        style={{
          backgroundImage: `url(${img1})`,
        }}
      >
        {/* Dark overlay for contrast and clarity */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight text-white capitalize">
              Welcome, {currentUser.fullName}!
            </h1>
            <p className="text-sm text-gray-300 mt-1 font-normal">
              Here is your MealBridge system command overview.
            </p>
          </div>
          <div className="mt-6 md:mt-0 flex items-center gap-3">
            <button className="px-5 py-2.5 text-sm font-medium bg-white text-[#1D1D1F] rounded-full hover:bg-gray-100 transition-all shadow-md">
              Export Analytics
            </button>
          </div>
        </div>
      </motion.div>

      {/* Statistics Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon;

          // Apple-inspired solid vibrant/muted tile colors (no gradients) with matching text contrasts
          const cardStyles = [
            {
              bg: "bg-[#0071E3]", // Apple Blue
              textPrimary: "text-white",
              textSecondary: "text-white/80",
              iconBg: "bg-white/15 text-white",
              border: "border-transparent",
              barBg: "bg-white/20",
              barFill: "bg-white",
            },
            {
              bg: "bg-[#1D1D1F]", // Apple Dark Charcoal
              textPrimary: "text-white",
              textSecondary: "text-[#86868B]",
              iconBg: "bg-white/10 text-white",
              border: "border-transparent",
              barBg: "bg-white/10",
              barFill: "bg-[#0071E3]",
            },
            {
              bg: "bg-[#E8EEF5]", // Clean Light Blue-Grey
              textPrimary: "text-[#1D1D1F]",
              textSecondary: "text-[#6E6E73]",
              iconBg: "bg-white text-[#0071E3] shadow-xs",
              border: "border-[#D2D2D7]/40",
              barBg: "bg-black/5",
              barFill: "bg-[#0071E3]",
            },
            {
              bg: "bg-[#F5F5F7]", // Apple Light Gray
              textPrimary: "text-[#1D1D1F]",
              textSecondary: "text-[#6E6E73]",
              iconBg: "bg-white text-[#1D1D1F] shadow-xs",
              border: "border-[#D2D2D7]/60",
              barBg: "bg-black/5",
              barFill: "bg-[#1D1D1F]",
            },
          ];

          const style = cardStyles[index % cardStyles.length];

          return (
            <motion.div
              key={index}
              whileHover={{
                y: -6,
                transition: { duration: 0.2, ease: "easeOut" },
              }}
              className={`${style.bg} ${style.border} border p-8 rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.04)] flex flex-col justify-between transition-all duration-300`}
            >
              {/* Top Section: Icon & Badge */}
              <div className="flex items-center justify-between mb-6">
                <div
                  className={`w-12 h-12 rounded-2xl ${style.iconBg} flex items-center justify-center`}
                >
                  <Icon className="w-6 h-6 stroke-[1.5]" />
                </div>
                <span
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                    style.bg === "bg-[#0071E3]" || style.bg === "bg-[#1D1D1F]"
                      ? "bg-white/20 text-white"
                      : stat.isPositive
                        ? "bg-[#34C759]/15 text-[#248A3D]"
                        : "bg-[#FF3B30]/15 text-[#D70015]"
                  }`}
                >
                  {stat.change}
                </span>
              </div>

              {/* Middle Section: Content */}
              <div className="space-y-2">
                <p
                  className={`text-sm font-medium tracking-wide ${style.textSecondary}`}
                >
                  {stat.title}
                </p>
                <h3
                  className={`text-3xl font-semibold tracking-tight ${style.textPrimary}`}
                >
                  {stat.value}
                </h3>
                <p
                  className={`text-xs font-normal leading-relaxed pt-1 ${style.textSecondary}`}
                >
                  {stat.description}
                </p>
              </div>

              {/* Bottom Section: Real-world micro element (Progress/Activity Bar) */}
              <div
                className={`mt-6 pt-4 border-t ${style.bg === "bg-[#0071E3]" || style.bg === "bg-[#1D1D1F]" ? "border-white/10" : "border-black/[0.04]"} flex items-center justify-between text-xs ${style.textSecondary}`}
              >
                <span className="font-medium">Target Capacity</span>
                <div
                  className={`w-24 h-1.5 ${style.barBg} rounded-full overflow-hidden`}
                >
                  <div
                    className={`h-full rounded-full ${style.barFill}`}
                    style={{
                      width: `${Math.min(Math.max((index + 1) * 22, 35), 90)}%`,
                    }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Live Location & System Activity */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-8">
          {/* Live Fleet Map Section Integration */}
          <div className="bg-[#FFFFFF] p-6 lg:p-8 rounded-2xl border border-[#D2D2D7]/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-[#1D1D1F] tracking-tight">
                  Active Fleet & Live Coordinates
                </h2>
                <p className="text-xs text-[#86868B]">
                  Real-time logistics monitoring across active delivery routes
                </p>
              </div>
            </div>
            <Live />
          </div>

          {/* Location Tracking Summary Card */}
          <div className="bg-[#FFFFFF] p-6 lg:p-8 rounded-2xl border border-[#D2D2D7]/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-[#1D1D1F] tracking-tight">
                  Regional Route Distribution
                </h2>
                <p className="text-xs text-[#86868B]">
                  Driver capacity status per coverage zone
                </p>
              </div>
              <span className="text-xs font-medium text-[#0066CC] hover:underline cursor-pointer flex items-center gap-1">
                View map <FiArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA]">
                <p className="text-xs text-[#86868B] mb-1">Colombo Central</p>
                <p className="text-lg font-semibold text-[#1D1D1F]">
                  14 Drivers
                </p>
                <p className="text-[11px] text-[#34C759] mt-1 font-medium">
                  All routes optimal
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA]">
                <p className="text-xs text-[#86868B] mb-1">Western Suburbs</p>
                <p className="text-lg font-semibold text-[#1D1D1F]">
                  12 Drivers
                </p>
                <p className="text-[11px] text-[#34C759] mt-1 font-medium">
                  All routes optimal
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA]">
                <p className="text-xs text-[#86868B] mb-1">Southern Corridor</p>
                <p className="text-lg font-semibold text-[#1D1D1F]">
                  12 Drivers
                </p>
                <p className="text-[11px] text-[#FF9500] mt-1 font-medium">
                  1 minor delay
                </p>
              </div>
            </div>
          </div>

          {/* Recipient Updates Table Card */}
          <div className="bg-[#FFFFFF] p-6 lg:p-8 rounded-2xl border border-[#D2D2D7]/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-[#1D1D1F] tracking-tight">
                  Recipient Updates & Dispatches
                </h2>
                <p className="text-xs text-[#86868B]">
                  Latest updates reported by verified community shelters
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E5E5EA] text-xs font-semibold text-[#86868B] uppercase tracking-wider">
                    <th className="pb-3 font-medium">Recipient Entity</th>
                    <th className="pb-3 font-medium">Donation Package</th>
                    <th className="pb-3 font-medium">Location Hub</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F5F7] text-sm">
                  {recentUpdates.map((update) => (
                    <tr
                      key={update.id}
                      className="group hover:bg-[#F9F9FB] transition-colors"
                    >
                      <td className="py-4 font-medium text-[#1D1D1F]">
                        {update.recipient}
                      </td>
                      <td className="py-4 text-[#48484A]">{update.items}</td>
                      <td className="py-4 text-[#86868B]">{update.location}</td>
                      <td className="py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            update.status === "Delivered"
                              ? "bg-[#34C759]/10 text-[#248A3D]"
                              : update.status === "In Transit"
                                ? "bg-[#0066CC]/10 text-[#004499]"
                                : "bg-[#FF9500]/10 text-[#B26B00]"
                          }`}
                        >
                          {update.status}
                        </span>
                      </td>
                      <td className="py-4 text-right text-xs text-[#86868B]">
                        {update.time}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Quick Verification & System Health */}
        <motion.div variants={itemVariants} className="space-y-8">
          {/* Quick Action / Verification Card */}
          <div className="bg-[#FFFFFF] p-6 lg:p-8 rounded-2xl border border-[#D2D2D7]/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
            <h2 className="text-lg font-semibold text-[#1D1D1F] tracking-tight mb-1">
              Pending Approvals
            </h2>
            <p className="text-xs text-[#86868B] mb-6">
              New user accounts and vendor registrations awaiting verification
            </p>

            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-[#E5E5EA] bg-[#FAFAFC] flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-[#1D1D1F]">
                    Grand Hotel Kitchen
                  </h4>
                  <p className="text-xs text-[#86868B]">
                    Vendor Account • Colombo
                  </p>
                </div>
                <button className="px-3 py-1.5 text-xs font-medium bg-[#0066CC] text-white rounded-lg hover:bg-[#004499] transition-all">
                  Review
                </button>
              </div>

              <div className="p-4 rounded-xl border border-[#E5E5EA] bg-[#FAFAFC] flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-[#1D1D1F]">
                    Green Valley Shelter
                  </h4>
                  <p className="text-xs text-[#86868B]">
                    Recipient Entity • Kandy
                  </p>
                </div>
                <button className="px-3 py-1.5 text-xs font-medium bg-[#0066CC] text-white rounded-lg hover:bg-[#004499] transition-all">
                  Review
                </button>
              </div>
            </div>

            <button className="w-full mt-6 py-2.5 text-xs font-medium text-[#1D1D1F] bg-[#F5F5F7] rounded-xl hover:bg-[#E5E5EA] transition-all">
              View All Pendings (12)
            </button>
          </div>

          {/* System Performance Card */}
          <div className="bg-[#1D1D1F] text-[#FFFFFF] p-6 lg:p-8 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold tracking-tight text-[#FFFFFF]">
                Infrastructure Health
              </h2>
              <span className="w-2.5 h-2.5 rounded-full bg-[#34C759]"></span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-[#A1A1A6] mb-1">
                  <span>Microservices Uptime</span>
                  <span className="text-[#FFFFFF]">99.98%</span>
                </div>
                <div className="w-full h-1.5 bg-[#333336] rounded-full overflow-hidden">
                  <div className="w-full h-full bg-[#34C759] rounded-full"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-[#A1A1A6] mb-1">
                  <span>Database Response Latency</span>
                  <span className="text-[#FFFFFF]">14ms</span>
                </div>
                <div className="w-full h-1.5 bg-[#333336] rounded-full overflow-hidden">
                  <div className="w-[85%] h-full bg-[#0A84FF] rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#333336] flex items-center justify-between text-xs text-[#A1A1A6]">
              <span>Docker & Kubernetes Cluster</span>
              <span className="text-[#34C759] font-medium">
                All Nodes Healthy
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export function AdminLayout() {
  const [activeItem, setActiveItem] = useState("Dashboard");

  return (
    <div className="flex h-screen bg-[#FBFBFD] overflow-hidden">
      <SideBar activeItem={activeItem} setActiveItem={setActiveItem} />
      <main className="flex-1 overflow-y-auto">
        {activeItem === "Dashboard" && <DisplayDashboard />}
        {activeItem !== "Dashboard" && (
          <div className="flex h-full items-center justify-center p-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight mb-2">
                {activeItem} Section
              </h2>
              <p className="text-sm text-[#86868B]">
                This module view is currently being loaded.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminLayout;
