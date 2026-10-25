import React from "react";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";

interface HeroSectionProps {
  onOpenApplyModal: () => void;
}

export default function HeroSection({ onOpenApplyModal }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden pt-8 pb-12 sm:pt-14 sm:pb-18 md:pt-20 md:pb-24">
      {/* Background ambient water caustic spheres */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[650px] h-[350px] sm:h-[650px] bg-cyan-500/12 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none water-caustic-1" />
      <div className="absolute top-1/3 -right-20 w-[250px] sm:w-[450px] h-[250px] sm:h-[450px] bg-blue-600/12 rounded-full blur-[90px] sm:blur-[120px] pointer-events-none water-caustic-2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          {/* Left Column: Headline & Value Prop */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-center lg:text-left">
            {/* Active Cohort Announcement Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-2.5">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-full gorilla-glass text-cyan-300 text-[11px] sm:text-xs font-semibold shadow-inner text-center">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
                </span>
                <span>Grow with Kelvin Okoro. Weekend Mentorship with Java</span>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-full gorilla-glass text-emerald-300 text-[11px] sm:text-xs font-semibold shadow-inner border border-emerald-500/30 text-center">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>A stipend will be given for the month</span>
              </div>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.18] sm:leading-[1.15]">
              Level Up Your{" "}
              <span className="bg-gradient-to-r from-cyan-300 via-sky-300 to-blue-400 bg-clip-text text-transparent">
                Engineering Standards
              </span>
              . 1-on-1 for 30 Days.
            </h1>

            {/* Subheading */}
            <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Online weekend mentorship with{" "}
              <strong className="text-white font-semibold">Kelvin Okoro</strong>.
              Get the best foundations and fundamentals in coding, gain crystal-clear direction, and find the inspiration to keep growing and thriving in tech.
            </p>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                id="hero-apply-cta-btn"
                onClick={onOpenApplyModal}
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-2xl liquid-glass-btn cursor-pointer transform hover:-translate-y-0.5 active:scale-95 shadow-xl shadow-cyan-500/30 transition-all"
              >
                <span className="relative z-10 flex items-center gap-2.5 text-slate-950 font-black text-base tracking-wide">
                  Apply for Mentorship
                  <ArrowRight className="w-5 h-5 text-slate-950 stroke-[2.5]" />
                </span>
              </button>
            </div>
          </div>

          {/* Right Column: Hero Visual with Kelvin Portrait & Interactive Badges */}
          <div className="lg:col-span-5 relative flex justify-center w-full">
            {/* Outer decorative card with responsive sizing */}
            <div className="relative w-full max-w-[290px] xs:max-w-[330px] sm:max-w-sm md:max-w-md">
              {/* Glowing behind portrait */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl blur-lg opacity-35 group-hover:opacity-65 transition duration-1000 group-hover:duration-200 animate-pulse"></div>

              <div className="relative rounded-3xl overflow-hidden gorilla-glass mirror-water-sheen p-2.5 sm:p-3">
                {/* Image Container */}
                <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden bg-slate-950">
                  <Image
                    id="hero-kelvin-portrait"
                    src="/images/kelvin_mentor.jpg"
                    alt="Kelvin - Software Engineer & Mentor"
                    fill
                    sizes="(max-width: 640px) 300px, (max-width: 768px) 380px, 480px"
                    className="object-cover object-top hover:scale-105 transition-transform duration-700"
                    priority
                  />

                  {/* Gradient bottom overlay for contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

                  {/* Image bottom caption badge hugging only the text */}
                  <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-20 text-left">
                    <div className="inline-block px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl gorilla-glass shadow-lg">
                      <div className="text-xs sm:text-sm font-bold text-white leading-tight">
                        Kelvin Okoro
                      </div>
                      <div className="text-[10px] sm:text-xs text-cyan-400 font-medium mt-0.5">
                        Software Engineer
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
