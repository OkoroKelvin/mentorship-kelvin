"use client";

import React, { useState, useEffect } from "react";
import HeroSection from "@/components/HeroSection";
import ApplicationFunnel from "@/components/ApplicationFunnel";
import Footer from "@/components/Footer";
import { Sparkles, Clock, X } from "lucide-react";

export default function Home() {
  const [applyModalOpen, setApplyModalOpen] = useState(false);

  // Lock body scroll when apply modal is open
  useEffect(() => {
    if (applyModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [applyModalOpen]);

  // Open modal helper that syncs URL and session flag
  const handleOpenModal = () => {
    setApplyModalOpen(true);
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem("mentorship_modal_active", "true");
        const step = sessionStorage.getItem("mentorship_return_step") || "1";
        window.history.replaceState(null, "", `/?apply=true&step=${step}`);
      } catch {}
    }
  };

  // Close modal helper that cleans URL and session flag
  const handleCloseModal = () => {
    setApplyModalOpen(false);
    if (typeof window !== "undefined") {
      try {
        sessionStorage.removeItem("mentorship_modal_active");
        sessionStorage.removeItem("mentorship_return_step");
        window.history.replaceState(null, "", "/");
      } catch {}
    }
  };

  // Keyboard shortcut: Escape to close apply modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && applyModalOpen) {
        handleCloseModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [applyModalOpen]);

  // Auto-open apply modal if URL has ?apply=true, or if returning with an active draft / modal flag
  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkModalState = () => {
      const params = new URLSearchParams(window.location.search);
      const isApply = params.get("apply") === "true";
      const isModalActive = sessionStorage.getItem("mentorship_modal_active") === "true";
      const draft = sessionStorage.getItem("kelvin_mentorship_draft");

      if (isApply || isModalActive || draft) {
        setApplyModalOpen(true);
        try {
          sessionStorage.setItem("mentorship_modal_active", "true");
        } catch {}
      }
    };

    checkModalState();
    window.addEventListener("pageshow", checkModalState);
    window.addEventListener("popstate", checkModalState);

    return () => {
      window.removeEventListener("pageshow", checkModalState);
      window.removeEventListener("popstate", checkModalState);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#040711] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      <main className="flex-1">
        {/* Clean Hero Section */}
        <HeroSection onOpenApplyModal={handleOpenModal} />
      </main>

      {/* Footer */}
      <Footer />

      {/* Application Modal (Only visible when user clicks Apply) */}
      {applyModalOpen && (
        <div
          id="apply-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="apply-modal-title"
          className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseModal();
          }}
        >
          <div className="relative w-full max-w-4xl my-4 sm:my-8 gorilla-glass mirror-water-sheen rounded-3xl p-5 sm:p-10 animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Ambient inner glow */}
            <div className="absolute top-0 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

            {/* Close Button */}
            <button
              id="close-apply-modal-btn"
              onClick={handleCloseModal}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-xl text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors cursor-pointer z-30"
              aria-label="Close application modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Application Header */}
            <div className="text-center mb-8 sm:mb-10 space-y-3 sm:space-y-4 pr-8 pl-8 sm:px-4 relative z-10">
              <div className="flex flex-wrap items-center justify-center gap-2">
                <div
                  id="apply-modal-title"
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold uppercase tracking-wider"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Grow with Kelvin Okoro. Weekend Mentorship with Java
                </div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> A stipend will be given for the month
                </div>
              </div>

              {/* Status Pill */}
              <div className="pt-1 flex items-center justify-center text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" /> Takes 3 minutes
                </span>
              </div>
            </div>

            {/* 3-Step Interactive Funnel Form */}
            <div className="relative z-10">
              <ApplicationFunnel
                onClose={handleCloseModal}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
