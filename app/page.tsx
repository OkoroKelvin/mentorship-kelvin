"use client";

import React, { useState, useEffect } from "react";
import HeroSection from "@/components/HeroSection";
import ApplicationFunnel from "@/components/ApplicationFunnel";
import Footer from "@/components/Footer";
import MentorReviewModal from "@/components/MentorReviewModal";
import { getStoredApplicants } from "@/lib/applicantStore";
import { Sparkles, Clock, X } from "lucide-react";

export default function Home() {
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [applicantCount, setApplicantCount] = useState(4);

  // Keep track of applicant count
  useEffect(() => {
    const updateCount = () => {
      const apps = getStoredApplicants();
      setApplicantCount(apps.length);
    };
    updateCount();
    window.addEventListener("applicants_updated", updateCount);
    return () => window.removeEventListener("applicants_updated", updateCount);
  }, []);

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

  // Keyboard shortcut: Shift + M to open mentor modal, Escape to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (applyModalOpen) {
          setApplyModalOpen(false);
        }
      } else if (
        (e.key === "M" || e.key === "m") &&
        e.shiftKey &&
        !["INPUT", "TEXTAREA"].includes(
          (document.activeElement?.tagName as string) || ""
        )
      ) {
        e.preventDefault();
        setReviewModalOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [applyModalOpen]);

  return (
    <div className="min-h-screen bg-[#040711] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      <main className="flex-1">
        {/* Clean Hero Section */}
        <HeroSection onOpenApplyModal={() => setApplyModalOpen(true)} />
      </main>

      {/* Footer */}
      <Footer />

      {/* Application Modal (Only visible when user clicks Apply) */}
      {applyModalOpen && (
        <div
          id="apply-modal-backdrop"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setApplyModalOpen(false);
          }}
        >
          <div className="relative w-full max-w-4xl my-4 sm:my-8 gorilla-glass mirror-water-sheen rounded-3xl p-5 sm:p-10 animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Ambient inner glow */}
            <div className="absolute top-0 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

            {/* Close Button */}
            <button
              id="close-apply-modal-btn"
              onClick={() => setApplyModalOpen(false)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-xl text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors cursor-pointer z-30"
              aria-label="Close application modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Application Header */}
            <div className="text-center mb-8 sm:mb-10 space-y-3 sm:space-y-4 pr-8 pl-8 sm:px-4 relative z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> November 2026 Cohort • Weekend Mentorship with Java
              </div>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                Apply for 1-Month Java Mentorship
              </h2>

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
                onClose={() => setApplyModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Mentor Review Drawer / Modal */}
      <MentorReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
      />
    </div>
  );
}
