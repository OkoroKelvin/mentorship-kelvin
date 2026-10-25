"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

interface NavbarProps {
  onOpenReviewModal?: () => void;
  onOpenApplyModal?: () => void;
}

export default function Navbar({
  onOpenReviewModal,
  onOpenApplyModal,
}: NavbarProps) {
  const handleApplyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onOpenApplyModal) {
      onOpenApplyModal();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyan-500/15 bg-[#040711]/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-4">
          <a href="#" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-cyan-500/40 ring-2 ring-cyan-500/20 group-hover:border-cyan-400 transition-all">
              <Image
                src="/images/kelvin_mentor.jpg"
                alt="Kelvin Okoro"
                fill
                sizes="40px"
                className="object-cover"
                priority
              />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-1.5 tracking-tight group-hover:text-cyan-300 transition-colors">
                Kelvin Okoro
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold">
                  Mentor
                </span>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
                </span>
                Cohort #4 Applications Open
              </div>
            </div>
          </a>
        </div>

        {/* Primary CTA */}
        <div className="flex items-center gap-3">
          <button
            id="nav-apply-btn"
            onClick={handleApplyClick}
            className="inline-flex items-center px-5 py-2.5 rounded-xl liquid-glass-btn cursor-pointer transform hover:-translate-y-0.5"
          >
            <span className="relative z-10 flex items-center gap-1.5 text-slate-950 font-extrabold text-xs sm:text-sm">
              Apply for Mentorship <ArrowRight className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
