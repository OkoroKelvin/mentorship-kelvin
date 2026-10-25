"use client";

import React from "react";
import {
  Video,
  GitPullRequest,
  MessageSquare,
  Compass,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function ProgramPillars() {
  const pillars = [
    {
      id: "pillar-1-1",
      number: "01",
      title: "Weekly 1:1 Live Deep Dives",
      subtitle: "60-minute private screen-sharing sessions with Kelvin",
      description:
        "No generic webinars or crowded Q&As. Every week, we jump on a high-bandwidth 60-minute private call dedicated 100% to your codebase, system designs, and sticky architectural questions. We record every session with searchable timestamps.",
      deliverables: [
        "4 dedicated 60-minute 1:1 technical video calls",
        "Live architecture whiteboarding and system trade-offs",
        "Personalized session recordings & actionable recap notes",
      ],
      icon: Video,
      accentColor: "from-indigo-500 to-blue-500",
      borderGlow: "group-hover:border-indigo-500/50",
      badge: "Highest Impact",
    },
    {
      id: "pillar-code-reviews",
      number: "02",
      title: "Production Architecture & Code Reviews",
      subtitle: "Ruthless line-by-line feedback on your real repositories",
      description:
        "Learn how Staff engineers evaluate code before it hits production. Submit your PRs, database schemas, and microservice designs. Kelvin audits your typing, error boundaries, concurrency patterns, and query performance to elevate your code to top-tier standards.",
      deliverables: [
        "In-depth PR reviews with actionable suggestions",
        "Schema indexing, latency, & distributed systems audits",
        "Refactoring strategies for monolithic or legacy debt",
      ],
      icon: GitPullRequest,
      accentColor: "from-purple-500 to-pink-500",
      borderGlow: "group-hover:border-purple-500/50",
      badge: "Real Code Only",
    },
    {
      id: "pillar-async-hotline",
      number: "03",
      title: "Direct 24/7 Async Hotline",
      subtitle: "Private Slack / Telegram channel directly with Kelvin",
      description:
        "Never stay blocked for days on a cryptic production bug or architecture decision again. Drop your diagrams, logs, and dilemmas directly into your private channel. Receive fast, voice memo or Loom video breakdowns within hours.",
      deliverables: [
        "Direct 1:1 private Slack / Telegram channel access",
        "Rapid voice memo and quick video responses",
        "Continuous unblocking between weekly live calls",
      ],
      icon: MessageSquare,
      accentColor: "from-emerald-500 to-teal-500",
      borderGlow: "group-hover:border-emerald-500/50",
      badge: "Zero Downtime",
    },
    {
      id: "pillar-career-roadmap",
      number: "04",
      title: "Custom 30-Day Engineering Roadmap",
      subtitle: "A laser-focused sprint to your next senior title or SaaS launch",
      description:
        "On Day 1, we conduct a gap analysis of your current technical leverage. We establish a 30-day milestone sprint tailored to your goal: whether that's landing a Senior / Staff promotion, launching a production-ready SaaS, or mastering distributed systems.",
      deliverables: [
        "Personalized 30-Day sprint plan with weekly checkpoints",
        "Senior promotion packet review & leadership positioning",
        "Technical interview & system design prep blueprints",
      ],
      icon: Compass,
      accentColor: "from-amber-500 to-orange-500",
      borderGlow: "group-hover:border-amber-500/50",
      badge: "Measurable ROI",
    },
  ];

  return (
    <section
      id="pillars-section"
      className="py-20 md:py-32 relative bg-[#090a0f] border-t border-zinc-800/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> 4 Program Pillars
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Built Like an Elite Apprenticeship.
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
            Forget passive video lectures and generic tutorials. This is hands-on,
            high-touch coaching engineered around your actual codebase and career
            trajectory.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.id}
                id={pillar.id}
                className={`group relative glass-panel p-8 rounded-3xl border border-zinc-800/80 hover:border-zinc-700 bg-gradient-to-b from-[#111322]/80 to-[#0c0e17]/80 transition-all duration-300 shadow-xl ${pillar.borderGlow}`}
              >
                <div className="flex items-start justify-between mb-6">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${pillar.accentColor} flex items-center justify-center text-white shadow-lg`}
                  >
                    <Icon className="w-7 h-7" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-zinc-600 group-hover:text-zinc-400 transition-colors">
                      {pillar.number}
                    </span>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300">
                      {pillar.badge}
                    </span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white tracking-tight mb-1 group-hover:text-indigo-300 transition-colors">
                  {pillar.title}
                </h3>
                <p className="text-xs font-medium text-indigo-400/90 mb-4">
                  {pillar.subtitle}
                </p>

                <p className="text-zinc-300 text-sm leading-relaxed mb-6">
                  {pillar.description}
                </p>

                <div className="pt-4 border-t border-zinc-800/80 space-y-2.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-2">
                    Included in your sprint:
                  </span>
                  {pillar.deliverables.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 text-xs text-zinc-300"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
