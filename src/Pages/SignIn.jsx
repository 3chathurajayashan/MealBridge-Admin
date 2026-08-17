import React, { useState } from "react";
import img1 from "../assets/sb1.jpg";
import logo from "../assets/lg3.png";

function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center font-['SF_Pro_Display','SF_Pro_Icons','Helvetica_Neue',Helvetica,Arial,sans-serif] antialiased">
      <div className="w-full h-screen bg-white grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
        {/* Left Side: Full-Height Banner with Image and Gradient Overlay */}
        <div className="relative p-12 lg:p-16 flex flex-col justify-between text-white overflow-hidden">
          {/* Background Image */}
          <img
            src={img1}
            alt="Background"
            className="absolute inset-0 w-full h-full object-cover z-0"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-blue-500/80 to-indigo-950/90 z-0"></div>

          {/* Abstract fluid background glow effect */}
          <div className="absolute -top-32 -left-32 w-[30rem] h-[30rem] bg-purple-500/30 rounded-full blur-3xl pointer-events-none z-0"></div>
          <div className="absolute -bottom-32 -right-32 w-[30rem] h-[30rem] bg-blue-400/30 rounded-full blur-3xl pointer-events-none z-0"></div>

          {/* Top Text / Branding */}
          <div className="relative z-10">
            <h1 className="text-4xl lg:text-5xl font-semibold tracking-tight leading-tight">
              Speed up your work <br />
              with our Web App
            </h1>
          </div>

          {/* Bottom Partners Section */}
          <div className="relative z-10 mt-16">
            <p className="text-xs text-blue-200 mb-4 font-medium tracking-wide">
              Our partners
            </p>
            <div className="flex flex-wrap items-center gap-8 opacity-90 text-sm font-medium">
              {/* Discord */}
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.927 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
                <span>Discord</span>
              </div>
              {/* Instagram */}
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                <span>Instagram</span>
              </div>
              {/* Spotify */}
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.599-.12-.42.18-.78.6-.9 4.56-1.021 8.52-.6 11.76 1.38.36.18.48.66.24 1.02zm1.44-3.84c-.301.48-.901.66-1.381.36-3.24-1.98-8.16-2.58-11.94-1.41-.54.18-1.14-.12-1.32-.66-.18-.54.12-1.14.66-1.32 4.2-1.26 9.6-6 13.38 1.8.3.48.12 1.08-.36 1.38zm.12-4.02C14.76 7.32 8.58 7.14 5 8.22c-.66.18-1.38-.18-1.56-.84-.18-.66.18-1.38.84-1.56 4.14-1.26 11.1-1.02 15.3 1.56.6.36.78 1.14.42 1.74-.36.6-1.14.78-1.74.42z" />
                </svg>
                <span>Spotify</span>
              </div>
              {/* YouTube */}
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                <span>YouTube</span>
              </div>
              {/* TikTok */}
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
                <span>TikTok</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form Component */}
        <div className="p-8 lg:p-20 flex flex-col justify-center bg-white h-full overflow-y-auto">
          <div className="max-w-md w-full mx-auto">
            {/* Header info */}
            <div className="mb-8">
              <h2 className="text-3xl font-semibold text-gray-900 tracking-tight">
                Get Started Now with MealBridge
              </h2>
              <p className="text-sm text-gray-500 mt-2">
                Please log in to your account to continue.
              </p>
            </div>

            <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
              {/* Name Field */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your name..."
                  className="w-full px-4 py-3 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-all placeholder:text-gray-400"
                />
              </div>

              {/* Email Address Field */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  placeholder="workmail@gmail.com"
                  defaultValue="workmail@gmail.com"
                  className="w-full px-4 py-3 text-sm bg-white border border-blue-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all text-gray-900 shadow-sm"
                />
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-medium text-gray-700">
                    Password
                  </label>
                  <a
                    href="#forgot"
                    className="text-xs font-medium text-blue-600 hover:text-blue-700 transition"
                  >
                    Forgot Password?
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    defaultValue="••••••••••••"
                    className="w-full px-4 py-3 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-all text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      {showPassword ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.8}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.8}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-center pt-1">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreed}
                  onChange={() => setAgreed(!agreed)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="terms" className="ml-2 text-xs text-gray-500">
                  I agree to the{" "}
                  <a
                    href="#terms"
                    className="text-gray-800 font-medium hover:underline"
                  >
                    Terms & Privacy
                  </a>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-orange-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl shadow-sm transition-all duration-200 active:scale-[0.99]"
              >
                Log in
              </button>

              {/* Switch to Signup */}
              <p className="text-center text-xs text-gray-500 pt-2">
                Have an account?{" "}
                <a
                  href="#signup"
                  className="text-blue-600 font-medium hover:underline"
                >
                  Sign up
                </a>
              </p>

              {/* Divider */}
              <div className="relative flex py-3 items-center">
                <div className="flex-grow border-t border-gray-100"></div>
                <span className="flex-shrink mx-4 text-xs text-gray-400 font-medium">
                  Or
                </span>
                <div className="flex-grow border-t border-gray-100"></div>
              </div>

              {/* Social Logins */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="flex items-center justify-center gap-2.5 py-3 px-3 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-50 active:scale-[0.99] transition-all"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.13 0-5.78-2.11-6.73-4.96H1.21v3.15C3.18 21.31 7.25 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.21C.44 8.15 0 9.88 0 12s.44 3.85 1.21 5.39l4.06-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.25 0 3.18 2.69 1.21 6.61l4.06 3.15c.95-2.85 3.6-4.96 6.73-4.96z"
                    />
                  </svg>
                  Login with Google
                </button>

                <button
                  type="button"
                  className="flex items-center justify-center gap-2.5 py-3 px-3 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-50 active:scale-[0.99] transition-all"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.31c.64-.78 1.08-1.87.96-2.96-1.03.04-2.27.69-2.99 1.47-.61.66-1.14 1.76-1 2.83 1.15.09 2.32-.56 3.03-1.34z" />
                  </svg>
                  Login with Apple
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
