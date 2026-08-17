import React, { useState, useEffect } from "react";

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-md border-b border-black/10 py-3 shadow-sm"
          : "bg-white py-5"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <a
          href="#"
          className="text-black font-semibold text-lg tracking-tight flex items-center gap-2 group"
        >
          MealBridge
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-light text-zinc-600">
          <a
            href="#overview"
            className="hover:text-black transition-colors duration-200"
          >
            Overview
          </a>
          <a
            href="#meals"
            className="hover:text-black transition-colors duration-200"
          >
            Meals
          </a>
          <a
            href="#impact"
            className="hover:text-black transition-colors duration-200"
          >
            Impact
          </a>
          <a
            href="#partners"
            className="hover:text-black transition-colors duration-200"
          >
            Partners
          </a>
          <a
            href="#support"
            className="hover:text-black transition-colors duration-200"
          >
            Support
          </a>
        </nav>

        {/* Action Button */}
        <div className="hidden md:flex items-center space-x-4">
          <a
            href="/signin"
            className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium px-4 py-2 rounded-full transition-all duration-300 shadow-sm hover:shadow-orange-500/20"
          >
            Get Started
          </a>
        </div>

        {/* Mobile Menu Trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-black focus:outline-none"
          aria-label="Toggle Menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {mobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 8h16M4 16h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-black/10 px-6 py-8 shadow-lg transition-all animate-fadeIn">
          <nav className="flex flex-col space-y-6 text-lg font-light text-zinc-700">
            <a
              href="#overview"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-orange-500 transition-colors"
            >
              Overview
            </a>
            <a
              href="#meals"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-orange-500 transition-colors"
            >
              Meals
            </a>
            <a
              href="#impact"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-orange-500 transition-colors"
            >
              Impact
            </a>
            <a
              href="#partners"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-orange-500 transition-colors"
            >
              Partners
            </a>
            <a
              href="#support"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-orange-500 transition-colors"
            >
              Support
            </a>
            <div className="pt-4">
              <a
                href="#donate"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center bg-orange-500 text-white font-medium py-3 rounded-full shadow-md"
              >
                Get Started
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Header;
