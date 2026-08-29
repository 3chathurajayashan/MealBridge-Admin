import React from "react";
import { motion } from "framer-motion";
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
  // Stat card data for surplus food platform
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
      className="min-h-screen bg-[#FBFBFD] text-[#1D1D1F] p-8 lg:p-12 font-sans selection:bg-[#000000] selection:text-[#FFFFFF]"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Top Header Section */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col md:flex-row md:items-center justify-between pb-8 mb-8 border-b border-[#D2D2D7]/40"
      >
        <div>
          <div className="flex items-center gap-2 text-xs font-medium tracking-wider text-[#86868B] uppercase mb-1">
            <span className="w-2 h-2 rounded-full bg-[#34C759] animate-pulse"></span>
            System Live & Operating
          </div>
          <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight text-[#1D1D1F]">
            Dashboard Overview
          </h1>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-3">
          <button className="px-4 py-2 text-sm font-medium bg-[#1D1D1F] text-[#FFFFFF] rounded-full hover:bg-[#333333] transition-all shadow-sm">
            Export Analytics
          </button>
        </div>
      </motion.div>

      {/* Statistics Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#D2D2D7]/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#F5F5F7] flex items-center justify-center text-[#1D1D1F]">
                  <Icon className="w-5 h-5 stroke-[1.5]" />
                </div>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    stat.isPositive
                      ? "bg-[#34C759]/10 text-[#248A3D]"
                      : "bg-[#FF3B30]/10 text-[#D70015]"
                  }`}
                >
                  {stat.change}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-[#86868B] mb-1">
                  {stat.title}
                </p>
                <h3 className="text-2xl font-semibold tracking-tight text-[#1D1D1F] mb-2">
                  {stat.value}
                </h3>
                <p className="text-xs text-[#86868B] font-normal">
                  {stat.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Live Location & System Activity */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-8">
          {/* Location Tracking Summary Card */}
          <div className="bg-[#FFFFFF] p-6 lg:p-8 rounded-2xl border border-[#D2D2D7]/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-[#1D1D1F] tracking-tight">
                  Active Fleet & Location Tracks
                </h2>
                <p className="text-xs text-[#86868B]">
                  Real-time logistics monitoring across active routes
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

export default DisplayDashboard;
