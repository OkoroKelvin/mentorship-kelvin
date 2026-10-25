"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "Who is this mentorship specifically designed for?",
      a: "This program is designed for ambitious software engineers (Mid-level, Senior, or early-stage technical founders) who want to break through engineering plateaus. Whether your goal is securing a promotion to Senior/Staff, mastering scalable system architecture, or shipping a production SaaS product with enterprise-level code quality, this sprint provides direct guidance.",
    },
    {
      q: "Can I participate while working a full-time engineering job?",
      a: "Yes, 85% of past cohort members work full-time jobs. The 1:1 live sessions are scheduled flexibly across weekday evenings and weekends. The async hotline allows you to ask questions and get PR audits whenever you are building during the week. A dedication of 8–12 hours per week is sufficient to achieve substantial transformation.",
    },
    {
      q: "Which tech stacks and programming languages do you mentor?",
      a: "Kelvin's core specialties include TypeScript/JavaScript (Next.js, React, Node.js), Go (microservices, distributed systems), Python (backend and AI workflows), PostgreSQL, Redis, Docker, and Cloud infrastructure (AWS, GCP). More importantly, the architectural principles taught—system boundaries, latency optimization, data modeling, and clean code—are universal across all modern stacks.",
    },
    {
      q: "Why is each cohort strictly capped at 6 engineers?",
      a: "Kelvin is personally in the trenches with you: reading your actual code, providing detailed PR feedback, and hopping on live calls. Unlike courses that accept 500 students and assign teaching assistants, this is an authentic 1-on-1 apprenticeship. Capping at 6 guarantees Kelvin's undivided attention.",
    },
    {
      q: "What is the review and onboarding timeline after I submit my application?",
      a: "Applications are reviewed manually by Kelvin within 24 hours of submission. If your profile and 30-day goals align with the cohort curriculum, you will receive an invitation for a 15-minute alignment call to finalize your roadmap before kickoff.",
    },
  ];

  return (
    <section
      id="faq-section"
      className="py-20 md:py-32 relative bg-[#090a0f] border-t border-zinc-800/80"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 space-y-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
            Got Questions?
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base">
            Everything you need to know about the 1-month intensive sprint.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="glass-panel rounded-2xl border border-zinc-800 bg-[#121524]/60 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-zinc-800/30 transition-colors"
                >
                  <span className="text-sm sm:text-base font-semibold text-white">
                    {faq.q}
                  </span>
                  <div className="p-1 rounded-lg bg-zinc-800/80 text-zinc-400 shrink-0">
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-zinc-300 leading-relaxed border-t border-zinc-800/60 animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
