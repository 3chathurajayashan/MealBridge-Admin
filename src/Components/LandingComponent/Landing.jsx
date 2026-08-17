import React from "react";
import Header from "../HeaderComponent/Header";
import logo from "../../assets/lg3.png";
import mb1 from "../../assets/mb12.jpg";
import mb2 from "../../assets/mb6.png";
import mb3 from "../../assets/mb8.jpg";
import mb4 from "../../assets/mb9.jpg";
import mb5 from "../../assets/mb11.jpg";
import mb6 from "../../assets/bg2.png";

function Landing() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Header />

      {/* Hero Section */}
      <main className="pt-40 pb-24 px-6">
        <div className="max-w-6xl mx-auto text-center">
          {/* Small Logo */}

          {/* Main Headline */}
          <h1 className="text-8xl font-medium tracking-tighter text-black mb-6 max-w-6xl mx-auto">
            Manage{" "}
            <span className="bg-gradient-to-r from-[#007AFF] via-[#AF52DE] via-[#FF9500] to-[#FF2D55] bg-clip-text text-transparent">
              MealBridge
            </span>{" "}
            workload
            <br />
            as you wish <span className="text-orange-500">+</span> latest
            features.
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-zinc-600 mb-10 max-w-xl mx-auto">
            Claim, customize, and publish—for free.
          </p>

          {/* Signup Form */}
          <form className="flex items-center justify-center gap-4 max-w-lg mx-auto mb-6">
            <input
              type="text"
              placeholder="yourname"
              className="flex-grow px-5 py-4 rounded-full border border-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
            />
            <span className="text-zinc-500 font-mono text-sm">
              .MealBridge.Admin
            </span>
            <button
              type="submit"
              className="px-8 py-4 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition shadow-sm"
            >
              Sign in
            </button>
          </form>

          {/* No Credit Card Notice */}
          <p className="text-xs text-zinc-500 flex items-center justify-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            No unauthorized requests allowed
          </p>
        </div>

        {/* Mobile Showcase Section */}
        <section className="mt-24 relative overflow-hidden py-10">
          {/* Gradient fade at the bottom */}
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-white via-white/80 to-transparent z-30 pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 relative z-0">
            <div className="flex items-center justify-center -space-x-4 md:-space-x-6">
              {/* PHONE 1 (Leftmost - Rotated Left) */}
              <div className="relative w-[210px] md:w-[250px] h-[440px] md:h-[520px] rounded-[42px] bg-zinc-950 border-[6px] border-zinc-800 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.25)] rotate-[-12deg] origin-bottom hover:rotate-0 hover:scale-105 transition-all duration-500 z-10">
                {/* Dynamic Island / Speaker Notch */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full z-20 pointer-events-none" />
                <div className="w-full h-full rounded-[30px] overflow-hidden bg-white">
                  <img
                    src={mb1}
                    alt="App screenshot 1"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              </div>

              {/* PHONE 2 (Inner Left - Mildly Rotated) */}
              <div className="relative w-[230px] md:w-[270px] h-[480px] md:h-[560px] rounded-[46px] bg-zinc-950 border-[6px] border-zinc-800 p-2 shadow-[0_25px_60px_rgba(0,0,0,0.3)] rotate-[-6deg] origin-bottom hover:rotate-0 hover:scale-105 transition-all duration-500 z-20">
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-20 pointer-events-none" />
                <div className="w-full h-full rounded-[34px] overflow-hidden bg-white">
                  <img
                    src={mb2}
                    alt="App screenshot 2"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              </div>

              {/* PHONE 3 (Center - Straight & Tallest) */}
              <div className="relative w-[250px] md:w-[300px] h-[520px] md:h-[620px] rounded-[50px] bg-zinc-950 border-[6px] border-zinc-800 p-2 shadow-[0_30px_70px_rgba(0,0,0,0.35)] rotate-0 hover:scale-105 transition-all duration-500 z-30">
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-20 pointer-events-none" />
                <div className="w-full h-full rounded-[38px] overflow-hidden bg-white">
                  <img
                    src={mb3}
                    alt="App screenshot 3"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              </div>

              {/* PHONE 4 (Inner Right - Mildly Rotated) */}
              <div className="relative w-[230px] md:w-[270px] h-[480px] md:h-[560px] rounded-[46px] bg-zinc-950 border-[6px] border-zinc-800 p-2 shadow-[0_25px_60px_rgba(0,0,0,0.3)] rotate-[6deg] origin-bottom hover:rotate-0 hover:scale-105 transition-all duration-500 z-20">
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-20 pointer-events-none" />
                <div className="w-full h-full rounded-[34px] overflow-hidden bg-white">
                  <img
                    src={mb4}
                    alt="App screenshot 4"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              </div>

              {/* PHONE 5 (Rightmost - Rotated Right) */}
              <div className="relative w-[210px] md:w-[250px] h-[440px] md:h-[520px] rounded-[42px] bg-zinc-950 border-[6px] border-zinc-800 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.25)] rotate-[12deg] origin-bottom hover:rotate-0 hover:scale-105 transition-all duration-500 z-10">
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full z-20 pointer-events-none" />
                <div className="w-full h-full rounded-[30px] overflow-hidden bg-white">
                  <img
                    src={mb5}
                    alt="App screenshot 5"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Pre-Built Sections Section */}
      <section className="py-32 px-6 bg-zinc-50">
        <div className="max-w-4xl mx-auto text-center">
          {/* Join Notice */}
          <p className="text-sm font-medium text-blue-700 mb-6 flex items-center justify-center gap-2">
            <span className="relative flex h-2 w-2"></span>
          </p>

          {/* Main Headline */}
          <h2 className="text-6xl font-medium tracking-tighter text-black mb-6 max-w-2xl mx-auto">
            Use Real-Time data display Sections
          </h2>

          {/* Subtitle */}
          <p className="text-lg text-zinc-600 mb-10 max-w-3xl mx-auto">
            MealBridge Admin gives you complete control over your food-sharing
            platform. Manage users, donations, food requests, volunteers, and
            community activities—all from one simple and powerful dashboard.
          </p>

          {/* Admin Access CTA */}
          <div className="flex flex-col items-center justify-center gap-4 max-w-lg mx-auto mb-6">
            <div className="flex items-center gap-3">
              <span className="text-zinc-500 text-sm">
                Ready to manage MealBridge?
              </span>

              <button
                type="button"
                className="px-8 py-4 bg-black text-white rounded-full font-medium hover:bg-zinc-800 transition shadow-sm"
              >
                Enter Admin Dashboard
              </button>
            </div>
          </div>

          {/* No Credit Card Notice */}
          <p className="text-xs text-zinc-500 flex items-center justify-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            No Credit Card Required
          </p>

          {/* Floating Elements Section (As seen in the image) */}
          <div className="mt-28 grid grid-cols-3 gap-8 items-start">
            {/* Left Column: Stats, Resume, Contact Cards */}
            <div className="space-y-8">
              <div className="bg-white p-8 rounded-3xl shadow-lg border border-zinc-100 rotate-[-3deg]">
                <h4 className="font-semibold text-lg mb-4">Stats</h4>
                {/* Mock content */}
                <div className="space-y-3 text-zinc-600">
                  <p>50+ Projects completed</p>
                  <p>7+ Years experience</p>
                  <p>100+ Customers</p>
                </div>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-lg border border-zinc-100 rotate-[2deg]">
                <h4 className="font-semibold text-lg mb-4">Resume</h4>
                {/* Mock content */}
                <div className="space-y-3 text-zinc-600">
                  <p>Product Manager @ Apple</p>
                  <p>UX Lead @ Google</p>
                </div>
              </div>
            </div>

            {/* Center Column: Main Image */}
            <div className="mt-16 flex justify-center">
              <img
                src={mb6}
                alt="Main MealBridge screenshot"
                className="w-auto h-auto max-w-full object-contain"
              />
            </div>

            {/* Right Column: Stacks, FAQ, Showcase Cards */}
            <div className="space-y-8">
              <div className="bg-white p-8 rounded-3xl shadow-lg border border-zinc-100 rotate-[4deg]">
                <h4 className="font-semibold text-lg mb-4">My Stack</h4>
                {/* Mock icons */}
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-zinc-100 rounded-full"></div>
                  <div className="w-10 h-10 bg-zinc-100 rounded-full"></div>
                  <div className="w-10 h-10 bg-zinc-100 rounded-full"></div>
                </div>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-lg border border-zinc-100 rotate-[-2deg]">
                <h4 className="font-semibold text-lg mb-4">FAQ</h4>
                {/* Mock questions */}
                <div className="space-y-2 text-zinc-600 text-sm">
                  <p>How do I get started?</p>
                  <p>Is this free?</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer (Apple-Styled Professional Admin Section) */}
      <footer className="bg-[#09122d] text-[#86868b] py-12 px-6 text-xs font-light border-t border-[#333336]">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Top Section: Logo & Breadcrumb / Context */}
          <div className="border-b border-[#333336] pb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            {/* Logo & Brand Name Container */}
            <div className="flex items-center gap-4">
              {/* Logo Placeholder - Big and Viewable */}
              <div className="w-auto h-auto   flex items-center justify-center overflow-hidden shrink-0 ">
                <img
                  src={logo}
                  alt="Meal Bridge Logo"
                  className="w-128 h-108 object-contain"
                />
              </div>
              <div>
                <h3 className="text-[#f5f5f7] font-semibold text-sm tracking-tight">
                  Welcome to the Meal Bridge Admin
                </h3>
              </div>
            </div>

            {/* Social Proof */}
            <p className="text-[#a1a1a6]">
              Empowering <span className="text-[#f5f5f7] font-normal">1K+</span>{" "}
              administrators on{" "}
              <span className="text-[#f5f5f7] font-normal italic">
                admin mealbridge
              </span>
            </p>
          </div>

          {/* Middle Section: Directory / Quick Links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-left">
            <div className="space-y-3">
              <h4 className="text-[#f5f5f7] font-medium tracking-wide">
                Management
              </h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#dashboard"
                    className="hover:text-[#f5f5f7] transition-colors"
                  >
                    Admin Dashboard
                  </a>
                </li>
                <li>
                  <a
                    href="#analytics"
                    className="hover:text-[#f5f5f7] transition-colors"
                  >
                    System Metrics
                  </a>
                </li>
                <li>
                  <a
                    href="#rescues"
                    className="hover:text-[#f5f5f7] transition-colors"
                  >
                    Food Rescues
                  </a>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-[#f5f5f7] font-medium tracking-wide">
                System & Status
              </h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#health"
                    className="hover:text-[#f5f5f7] transition-colors"
                  >
                    Node Health
                  </a>
                </li>
                <li>
                  <a
                    href="#logs"
                    className="hover:text-[#f5f5f7] transition-colors"
                  >
                    Activity Logs
                  </a>
                </li>
                <li>
                  <a
                    href="#deployments"
                    className="hover:text-[#f5f5f7] transition-colors"
                  >
                    API Status
                  </a>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-[#f5f5f7] font-medium tracking-wide">
                Support
              </h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#support"
                    className="hover:text-[#f5f5f7] transition-colors"
                  >
                    Support Portal
                  </a>
                </li>
                <li>
                  <a
                    href="#docs"
                    className="hover:text-[#f5f5f7] transition-colors"
                  >
                    Admin Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="hover:text-[#f5f5f7] transition-colors"
                  >
                    IT Desk
                  </a>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-[#f5f5f7] font-medium tracking-wide">
                Legal & Privacy
              </h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#privacy"
                    className="hover:text-[#f5f5f7] transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#terms"
                    className="hover:text-[#f5f5f7] transition-colors"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="#security"
                    className="hover:text-[#f5f5f7] transition-colors"
                  >
                    Security Overview
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Section: Copyright */}
          <div className="border-t border-[#333336] pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[#6e6e73]">
            <p>
              Copyright © {new Date().getFullYear()} Meal Bridge Inc. All rights
              reserved.
            </p>
            <div className="flex gap-4">
              <span className="hover:text-[#86868b] cursor-pointer transition-colors"></span>
              <span>•</span>
              <span className="hover:text-[#86868b] cursor-pointer transition-colors">
                Sri Lanka Region
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
