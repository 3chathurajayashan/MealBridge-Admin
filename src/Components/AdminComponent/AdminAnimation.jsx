import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";

const DURATION = 3500;
const STEPS = [
  "Verifying your session",
  "Loading your preferences",
  "Configuring your dashboard",
  "Finishing up",
];

const APPLE_EASE = [0.16, 1, 0.3, 1];

function AdminAnimation({ onComplete }) {
  const prefersReducedMotion = useReducedMotion();
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [done, setDone] = useState(false);
  const startRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    startRef.current = performance.now();

    const tick = (now) => {
      const elapsed = now - startRef.current;
      const pct = Math.min(1, elapsed / DURATION);

      const eased = 1 - Math.pow(1 - pct, 2);
      setProgress(eased * 100);

      const nextStep = Math.min(
        STEPS.length - 1,
        Math.floor(pct * STEPS.length),
      );
      setStepIndex(nextStep);

      if (pct < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setDone(true);
      }
    };

    if (prefersReducedMotion) {
      setProgress(100);
      setStepIndex(STEPS.length - 1);
      setDone(true);
    } else {
      rafRef.current = requestAnimationFrame(tick);
    }

    return () => cancelAnimationFrame(rafRef.current);
  }, [prefersReducedMotion]);

  useEffect(() => {
    const timer = setTimeout(
      () => {
        if (onComplete) {
          onComplete();
        } else {
          // Default fallback redirect to /admin/dashboard if onComplete prop isn't passed
          window.location.href = "/admin/dashboard";
        }
      },
      prefersReducedMotion ? 400 : DURATION + 800, // Extra pause to let user see "Workspace ready" and checkmark animation
    );

    return () => clearTimeout(timer);
  }, [onComplete, prefersReducedMotion]);

  const container = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.12, delayChildren: 0.1 },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: APPLE_EASE },
    },
  };

  return (
    <div
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-white text-[#1d1d1f]"
      style={{
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif",
      }}
    >
      {/* Immersive, ultra-smooth Apple hero ambient lighting with Google color notes */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-1/4 -top-1/4 h-[45rem] w-[45rem] rounded-full bg-[radial-gradient(circle_at_center,_rgba(66,133,244,0.09),_transparent_70%)] blur-[140px]"
        animate={
          prefersReducedMotion ? undefined : { x: [0, 50, 0], y: [0, 40, 0] }
        }
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-1/4 -right-1/4 h-[45rem] w-[45rem] rounded-full bg-[radial-gradient(circle_at_center,_rgba(234,67,53,0.07),_transparent_70%)] blur-[140px]"
        animate={
          prefersReducedMotion ? undefined : { x: [0, -40, 0], y: [0, -30, 0] }
        }
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute top-1/3 right-1/4 h-[38rem] w-[38rem] rounded-full bg-[radial-gradient(circle_at_center,_rgba(52,168,83,0.06),_transparent_70%)] blur-[140px]"
        animate={
          prefersReducedMotion ? undefined : { x: [0, -30, 0], y: [0, 35, 0] }
        }
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 flex flex-col items-center px-6 text-center max-w-4xl mx-auto"
      >
        {/* Abstract Minimalist Google-Colored Ring Element with elevated presence */}
        <motion.div variants={item} className="mb-12">
          <motion.div
            className="relative flex h-20 w-20 items-center justify-center"
            animate={prefersReducedMotion ? undefined : { rotate: 360 }}
            transition={{
              duration: 14,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-[#4285F4] border-r-[#EA4335] border-b-[#FBBC05] border-l-[#34A853]" />
            <motion.div
              className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#4285F4] to-[#34A853] opacity-30 blur-md"
              animate={
                prefersReducedMotion ? undefined : { scale: [1, 1.3, 1] }
              }
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        </motion.div>

        {/* Heading — Amplified typography following Apple's heroic scale */}
        <motion.h1
          variants={item}
          className="text-5xl font-semibold leading-[1.08] tracking-[-0.03em] text-[#1d1d1f] sm:text-6xl md:text-7xl lg:text-[5rem]"
        >
          Preparing your workspace.
        </motion.h1>

        {/* Subtitle — Wider, punchier, high-readability font sizing */}
        <motion.p
          variants={item}
          className="mt-6 max-w-xl text-xl font-normal leading-relaxed tracking-[-0.01em] text-[#86868b] sm:text-2xl"
        >
          Syncing real-time analytics and setting up your personal control
          center.
        </motion.p>

        {/* Progress bar — Wider with smooth Google color gradient */}
        <motion.div
          variants={item}
          className="mt-14 h-[4px] w-72 overflow-hidden rounded-full bg-black/[0.08] sm:w-80"
        >
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#4285F4] via-[#34A853] to-[#FBBC05]"
            style={{ width: `${progress}%` }}
            transition={{ ease: "linear" }}
          />
        </motion.div>

        {/* Status row — Enlarged typography for crisp legibility */}
        <motion.div
          variants={item}
          className="mt-8 flex h-6 items-center gap-3 text-sm font-medium tracking-[0.01em] text-[#86868b] sm:text-base"
        >
          <span className="relative flex h-2.5 w-2.5 items-center justify-center">
            <AnimatePresence mode="wait">
              {done ? (
                <motion.span
                  key="check"
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.35, ease: APPLE_EASE }}
                  className="flex h-4 w-4 items-center justify-center rounded-full bg-[#34A853]"
                >
                  <Check className="h-3 w-3 text-white" strokeWidth={3} />
                </motion.span>
              ) : (
                <motion.span key="pulse" exit={{ opacity: 0 }}></motion.span>
              )}
            </AnimatePresence>
          </span>

          <AnimatePresence mode="wait">
            <motion.span
              key={done ? "done" : stepIndex}
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -8, opacity: 0 }}
              transition={{ duration: 0.3, ease: APPLE_EASE }}
              className="text-[#1d1d1f] font-medium"
            >
              {done ? "Workspace ready" : STEPS[stepIndex]}
            </motion.span>
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default AdminAnimation;
