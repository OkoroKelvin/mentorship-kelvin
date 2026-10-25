import React from "react";
import { ArrowUp } from "lucide-react";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t border-cyan-500/10 bg-[#040711] text-slate-400 text-xs py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-slate-500 text-center sm:text-left">
            &copy; 2026 Kelvin Okoro. All rights reserved.
          </p>

          <button
            onClick={scrollToTop}
            className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-cyan-500/10 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer border border-cyan-500/15"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
