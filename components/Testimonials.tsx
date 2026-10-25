"use client";

import React from "react";
import { Star, Quote, ArrowUpRight, CheckCircle2 } from "lucide-react";

export default function Testimonials() {
  const testimonials = [
    {
      name: "Sarah Jenkins",
      role: "Staff Software Engineer",
      company: "Fintech Scaleup (formerly Senior Eng)",
      outcome: "Promoted to Staff & +$42k base salary",
      text: "Before working with Kelvin, I was stuck doing heavy IC work without knowing how to show Staff-level leverage. In 30 days, Kelvin helped me redesign our real-time reconciliation engine and coached me through our architecture review board. My promotion was confirmed 6 weeks later.",
      rating: 5,
      avatarInitials: "SJ",
      accent: "from-indigo-500 to-purple-500",
    },
    {
      name: "Tunde Adeleke",
      role: "CTO & Co-Founder",
      company: "CloudQueue.io (YC W25)",
      outcome: "Shipped distributed message broker to 40k users",
      text: "Kelvin's audits of our PostgreSQL connection pool and Redis consumer groups literally prevented a catastrophic outage right before our Product Hunt launch. Having his async hotline in my pocket gave me the confidence of having a Principal Architect on our team.",
      rating: 5,
      avatarInitials: "TA",
      accent: "from-emerald-500 to-teal-500",
    },
    {
      name: "Liam Vance",
      role: "Senior Fullstack Engineer",
      company: "Global E-Commerce Platform",
      outcome: "Mastered System Design & Aced Senior Tech Screen",
      text: "The line-by-line code and PR reviews were masterclasses. Kelvin doesn't just tell you what to fix; he explains the architectural trade-offs, cache invalidation nuances, and how to write code that junior engineers can easily maintain.",
      rating: 5,
      avatarInitials: "LV",
      accent: "from-amber-500 to-orange-500",
    },
  ];

  return (
    <section
      id="testimonials-section"
      className="py-20 md:py-32 relative bg-[#090a0f] border-t border-zinc-800/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Real Mentee Outcomes
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Engineers Who Unlocked Their Next Level
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg">
            Read how past engineers transformed their architecture standards,
            accelerated promotions, and shipped production systems.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item, idx) => (
            <div
              key={idx}
              className="glass-panel p-8 rounded-3xl border border-zinc-800 bg-[#121524]/70 hover:border-zinc-700 transition-all flex flex-col justify-between shadow-xl"
            >
              <div>
                {/* Rating & Quote Icon */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-zinc-700" />
                </div>

                {/* Outcome badge */}
                <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{item.outcome}</span>
                </div>

                <p className="text-zinc-300 text-sm leading-relaxed mb-6 italic">
                  &ldquo;{item.text}&rdquo;
                </p>
              </div>

              {/* Author footer */}
              <div className="pt-4 border-t border-zinc-800/80 flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-tr ${item.accent} flex items-center justify-center text-white font-bold text-xs shadow-md`}
                >
                  {item.avatarInitials}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white tracking-tight">
                    {item.name}
                  </h4>
                  <p className="text-xs text-zinc-400">{item.role}</p>
                  <p className="text-[11px] text-zinc-500">{item.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
