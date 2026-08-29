import React, { useState } from "react";
import {
  Search,
  Bell,
  Mail,
  ChevronDown,
  Settings,
  LogOut,
  User,
  ShieldCheck,
  Plus,
  Sun,
  Moon,
  Activity,
} from "lucide-react";

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

export function AdminHeader() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <header className="h-16 w-full bg-white/80 backdrop-blur-md border-b border-[#D2D2D7]/60 px-6 flex items-center justify-between font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Display','SF_Pro_Text','Helvetica_Neue',Helvetica,Arial,sans-serif] select-none sticky top-0 z-40">
      {/* Left Section: Global Search Bar & System Status */}
      <div className="flex items-center gap-6 flex-1 max-w-xl">
        <div className="relative w-full max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#86868B]">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search users, deliveries, or locations..."
            className="w-full bg-[#F5F5F7] text-[#1D1D1F] text-[13px] placeholder-[#86868B] pl-10 pr-10 py-2 rounded-xl border border-transparent focus:border-[#0066CC]/40 focus:bg-white focus:outline-none transition-all duration-200 shadow-inner"
          />
          <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-[#86868B]">
            <Search className="w-4 h-4" />
          </span>
        </div>

        {/* Live System Health Badge */}
      </div>

      {/* Right Section: Actions, Theme, Utilities & Profile */}
      <div className="flex items-center gap-3">
        {/* Quick Action Button */}
        <button
          onClick={() => alert("Open Quick Create Modal")}
          className="hidden sm:flex items-center gap-1.5 bg-[#0066CC] hover:bg-[#0055B3] text-white text-[13px] font-medium px-3.5 py-2 rounded-xl transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Entry</span>
        </button>
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            alert("Navigating to Home Page");
          }}
          className="hidden sm:flex items-center gap-1.5 text-[13px] font-medium text-[#424245] hover:text-[#FF5E62] px-3.5 py-2 rounded-xl hover:bg-[#F5F5F7] transition-all"
        >
          <Plus className="w-4 h-4 text-[#86868B]" />
          <span>Home Page</span>
        </a>

        <div className="hidden sm:block h-5 w-[1px] bg-[#D2D2D7]/60 mx-1" />

        {/* Theme Mode Toggle Button */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2.5 rounded-xl text-[#424245] hover:bg-[#F5F5F7] hover:text-[#1D1D1F] transition-colors"
          title="Toggle Theme"
        >
          {isDarkMode ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>

        {/* Email / Messages Button */}
        <div className="relative">
          <button
            onClick={() => {
              setIsMessagesOpen(!isMessagesOpen);
              setIsNotificationsOpen(false);
              setIsProfileOpen(false);
            }}
            className="relative p-2.5 rounded-xl text-[#424245] hover:bg-[#F5F5F7] hover:text-[#1D1D1F] transition-colors"
            title="Messages"
          >
            <Mail className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-[#0066CC] rounded-full ring-2 ring-white animate-pulse" />
          </button>

          {/* Messages Dropdown Preview */}
          {isMessagesOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#D2D2D7]/60 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-[#D2D2D7]/40 flex items-center justify-between">
                <h3 className="text-[13px] font-semibold text-[#1D1D1F]">
                  Messages
                </h3>
                <span className="text-[11px] font-medium text-[#0066CC] cursor-pointer hover:underline">
                  Mark all read
                </span>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-[#D2D2D7]/20">
                <div className="p-3 hover:bg-[#F5F5F7] transition-colors cursor-pointer">
                  <p className="text-[12px] font-semibold text-[#1D1D1F]">
                    Sarah Jenkins
                  </p>
                  <p className="text-[11px] text-[#86868B] truncate">
                    Updated the delivery configuration parameters...
                  </p>
                  <span className="text-[10px] text-[#86868B]/70 mt-1 block">
                    5m ago
                  </span>
                </div>
                <div className="p-3 hover:bg-[#F5F5F7] transition-colors cursor-pointer">
                  <p className="text-[12px] font-semibold text-[#1D1D1F]">
                    Michael Chen
                  </p>
                  <p className="text-[11px] text-[#86868B] truncate">
                    New donor request awaiting approval verification.
                  </p>
                  <span className="text-[10px] text-[#86868B]/70 mt-1 block">
                    1h ago
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notification Bell Button */}
        <div className="relative">
          <button
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              setIsMessagesOpen(false);
              setIsProfileOpen(false);
            }}
            className="relative p-2.5 rounded-xl text-[#424245] hover:bg-[#F5F5F7] hover:text-[#1D1D1F] transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
          </button>

          {/* Notifications Dropdown */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#D2D2D7]/60 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-[#D2D2D7]/40 flex items-center justify-between">
                <h3 className="text-[13px] font-semibold text-[#1D1D1F]">
                  Notifications
                </h3>
                <span className="text-[11px] font-medium text-[#0066CC] cursor-pointer hover:underline">
                  Clear all
                </span>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-[#D2D2D7]/20">
                <div className="p-3 hover:bg-[#F5F5F7] transition-colors cursor-pointer">
                  <p className="text-[12px] font-medium text-[#1D1D1F]">
                    System Backup Completed
                  </p>
                  <p className="text-[11px] text-[#86868B]">
                    Database snapshot successfully secured.
                  </p>
                  <span className="text-[10px] text-[#86868B]/70 mt-1 block">
                    10m ago
                  </span>
                </div>
                <div className="p-3 hover:bg-[#F5F5F7] transition-colors cursor-pointer">
                  <p className="text-[12px] font-medium text-[#1D1D1F]">
                    New Recipient Registered
                  </p>
                  <p className="text-[11px] text-[#86868B]">
                    Awaiting regional location assignment.
                  </p>
                  <span className="text-[10px] text-[#86868B]/70 mt-1 block">
                    2h ago
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="h-5 w-[1px] bg-[#D2D2D7]/60 mx-1" />

        {/* Profile Dropdown Component */}
        <div className="relative">
          <button
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotificationsOpen(false);
              setIsMessagesOpen(false);
            }}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-[#F5F5F7] transition-colors group"
          >
            <img
              src={currentUser.profileImage.url}
              alt={currentUser.fullName}
              className="w-8 h-8 rounded-full object-cover border border-[#D2D2D7]/60 shadow-sm"
            />
            <div className="hidden md:block text-left">
              <p className="text-[12px] font-semibold text-[#1D1D1F] leading-tight tracking-tight capitalize">
                {currentUser.fullName}
              </p>
              <p className="text-[10px] text-[#86868B] leading-tight uppercase font-medium">
                {currentUser.role}
              </p>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-[#86868B] transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#D2D2D7]/60 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-[#D2D2D7]/40">
                <p className="text-[12px] font-semibold text-[#1D1D1F]">
                  Signed in as
                </p>
                <p className="text-[11px] text-[#86868B] truncate">
                  {currentUser.email}
                </p>
              </div>

              <div className="py-1">
                <a
                  href="#profile"
                  className="flex items-center gap-2.5 px-4 py-2 text-[13px] text-[#424245] hover:bg-[#F5F5F7] hover:text-[#1D1D1F] transition-colors"
                >
                  <User className="w-4 h-4 text-[#86868B]" />
                  <span>Your Profile</span>
                </a>
                <a
                  href="#security"
                  className="flex items-center gap-2.5 px-4 py-2 text-[13px] text-[#424245] hover:bg-[#F5F5F7] hover:text-[#1D1D1F] transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-[#86868B]" />
                  <span>Security & Roles</span>
                </a>
                <a
                  href="#settings"
                  className="flex items-center gap-2.5 px-4 py-2 text-[13px] text-[#424245] hover:bg-[#F5F5F7] hover:text-[#1D1D1F] transition-colors"
                >
                  <Settings className="w-4 h-4 text-[#86868B]" />
                  <span>Preferences</span>
                </a>
              </div>

              <div className="border-t border-[#D2D2D7]/40 pt-1">
                <button
                  onClick={() => {
                    localStorage.clear(); // Clears all local storage data on sign out
                    // Alternatively, use localStorage.removeItem('token') if you only want to clear specific keys
                    window.location.href = "/"; // Redirects user to your sign-in page
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-rose-600 hover:bg-rose-50 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;
