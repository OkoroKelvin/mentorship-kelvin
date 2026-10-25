"use client";

import React from "react";
import { Check, X, Calendar, Flame, Zap, Trophy } from "lucide-react";

export default function CurriculumComparison() {
  const weeks = [
    {
      week: "Week 01",
      title: "Diagnosis & Architecture Blueprint",
      focus: "Uncovering bottlenecks and locking in your 30-day targets",
      points: [
        "Complete audit of your current codebase, architecture, or promotion gap",
        "Definition of your core 30-day milestone (SaaS launch, Senior promotion packet, or system rewrite)",
        "Establishment of production standards, linting, typing, and architectural boundaries",
      ],
      icon: Zap,
    },
    {
      week: "Week 02",
      title: "Deep Implementation & PR Dissection",
      focus: "Elevating code quality to Staff-level engineering standards",
      points: [
        "Line-by-line review of your real PRs and microservice boundaries",
        "Refactoring tricky concurrency, state management, and async race conditions",
        "Eliminating bad abstractions and unnecessary cognitive complexity",
      ],
      icon: Flame,
    },
    {
      week: "Week 03",
      title: "Scale, Database Tuning & Distributed Systems",
      focus: "Hardening systems for 10x throughput and low latency",
      points: [
        "Database indexing, slow query analysis, and connection pooling audits",
        "Caching strategies (Redis, edge caching, invalidation patterns)",
        "Resilience patterns: circuit breakers, idempotency keys, and graceful retries",
      ],
      icon: Calendar,
    },
    {
      week: "Week 04",
      title: "Promotion Strategy, Polish & Launch",
      focus: "Consolidating wins, showcasing leverage, and setting up future trajectory",
      points: [
        "Final architecture sign-off and production rollout review",
        "Structuring high-impact promotion cases and communicating technical value to leadership",
        "Post-mentorship roadmap: setting your next 6-month growth objectives",
      ],
      icon: Trophy,
    },
  ];

  return (
    <section
      id="curriculum-section"
      className="py-20 md:py-32 relative bg-[#090a0f] border-t border-zinc-800/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
            The 30-Day Sprint Roadmap
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Four Weeks of Relentless Acceleration
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg">
            Every week is calibrated to produce tangible, production-grade output
            and permanent engineering confidence.
          </p>
        </div>

        {/* 4-Week Timeline Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {weeks.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="glass-panel p-6 rounded-2xl border border-zinc-800/90 bg-[#121526]/60 hover:border-indigo-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                      {item.week}
                    </span>
                    <Icon className="w-4 h-4 text-zinc-500" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-zinc-400 font-medium mb-4">
                    {item.focus}
                  </p>
                  <ul className="space-y-2 text-xs text-zinc-300">
                    {item.points.map((pt, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2">
                        <span className="text-indigo-400 font-bold">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Comparison Table */}
        <div className="glass-panel p-8 md:p-12 rounded-3xl border border-zinc-800 bg-[#101221]/90 shadow-2xl">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h3 className="text-2xl font-bold text-white tracking-tight">
              Why Engineers Choose 1:1 Over Generic Courses
            </h3>
            <p className="text-zinc-400 text-sm mt-1">
              The difference between passive consumption and an active senior
              engineering partnership.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  <th className="py-4 px-4">Feature</th>
                  <th className="py-4 px-4 text-zinc-500">Generic Courses & Bootcamps</th>
                  <th className="py-4 px-4 text-indigo-400 font-bold bg-indigo-950/20 rounded-t-xl">
                    1-Month Mentorship with Kelvin
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-xs">
                <tr>
                  <td className="py-4 px-4 font-semibold text-white">
                    Format & Interaction
                  </td>
                  <td className="py-4 px-4 text-zinc-400">
                    Pre-recorded videos, no custom feedback
                  </td>
                  <td className="py-4 px-4 text-emerald-300 font-semibold bg-indigo-950/10">
                    100% live screen-sharing on your actual code
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-semibold text-white">
                    Code & Systems Worked On
                  </td>
                  <td className="py-4 px-4 text-zinc-400">
                    Cookie-cutter todo apps and toy clones
                  </td>
                  <td className="py-4 px-4 text-emerald-300 font-semibold bg-indigo-950/10">
                    Your real company repos, SaaS builds, or architecture
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-semibold text-white">
                    Unblocking When Stuck
                  </td>
                  <td className="py-4 px-4 text-zinc-400">
                    Crickets in inactive Discord channels
                  </td>
                  <td className="py-4 px-4 text-emerald-300 font-semibold bg-indigo-950/10">
                    Direct private Slack hotline with Kelvin
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-semibold text-white">
                    Cohort Size & Attention
                  </td>
                  <td className="py-4 px-4 text-zinc-400">
                    Hundreds of students per batch
                  </td>
                  <td className="py-4 px-4 text-emerald-300 font-semibold bg-indigo-950/10">
                    Strictly limited to 6 engineers per cohort
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-semibold text-white">
                    Career Outcome & Promotion
                  </td>
                  <td className="py-4 px-4 text-zinc-400">
                    Generic completion certificates
                  </td>
                  <td className="py-4 px-4 text-emerald-300 font-semibold bg-indigo-950/10">
                    Promotion packets, senior offer prep & real systems shipped
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
