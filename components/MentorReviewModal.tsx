"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ApplicantRecord,
  ApplicantStatus,
} from "@/lib/validations/applicantSchema";
import {
  getStoredApplicants,
  updateApplicantStatus,
  exportApplicantsToCSV,
  resetApplicantsToDefault,
} from "@/lib/applicantStore";
import {
  X,
  Search,
  Download,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  UserCheck,
  CheckCircle2,
  Clock,
  Ban,
  RotateCcw,
  Sparkles,
  Briefcase,
  Layers,
  Target,
  Phone,
} from "lucide-react";

interface MentorReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MentorReviewModal({
  isOpen,
  onClose,
}: MentorReviewModalProps) {
  const [applicants, setApplicants] = useState<ApplicantRecord[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Load applicants from local store & subscribe to updates
  useEffect(() => {
    if (!isOpen) return;

    setApplicants(getStoredApplicants());

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<ApplicantRecord[]>;
      if (customEvent.detail) {
        setApplicants(customEvent.detail);
      } else {
        setApplicants(getStoredApplicants());
      }
    };

    window.addEventListener("applicants_updated", handleUpdate);
    return () => window.removeEventListener("applicants_updated", handleUpdate);
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleStatusChange = (id: string, newStatus: ApplicantStatus) => {
    const updated = updateApplicantStatus(id, newStatus);
    setApplicants(updated);
  };

  const handleResetData = () => {
    if (confirm("Reset applicants to default mock data?")) {
      const reset = resetApplicantsToDefault();
      setApplicants(reset);
    }
  };

  // Filtered applicants
  const filteredApplicants = useMemo(() => {
    return applicants.filter((app) => {
      const matchesStatus =
        filterStatus === "all" || app.status === filterStatus;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        app.fullName.toLowerCase().includes(q) ||
        app.email.toLowerCase().includes(q) ||
        app.currentRole.toLowerCase().includes(q) ||
        app.primaryStack.toLowerCase().includes(q) ||
        app.targetOutcome.toLowerCase().includes(q) ||
        app.whyYou.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [applicants, filterStatus, searchQuery]);

  // Count by status
  const counts = useMemo(() => {
    return {
      all: applicants.length,
      pending: applicants.filter((a) => a.status === "pending").length,
      shortlisted: applicants.filter((a) => a.status === "shortlisted").length,
      selected: applicants.filter((a) => a.status === "selected").length,
      rejected: applicants.filter((a) => a.status === "rejected").length,
    };
  }, [applicants]);

  if (!isOpen) return null;

  return (
    <div
      id="mentor-review-drawer-backdrop"
      className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="mentor-review-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mentor-review-title"
        className="w-full max-w-4xl h-full bg-[#0d0f17] border-l border-zinc-800 shadow-2xl flex flex-col text-gray-100 overflow-hidden"
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-zinc-800/80 bg-[#121522]/90 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-cyan-500/20">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="mentor-review-title"
                  className="text-xl font-bold text-white tracking-tight"
                >
                  Mentor Application Review
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-medium">
                  Kelvin&apos;s Desk
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Review applicant profiles, manage pipeline stages, and export
                cohort data.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="export-csv-btn"
              onClick={() => exportApplicantsToCSV(filteredApplicants)}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 transition-colors shadow-sm cursor-pointer"
              title="Download RFC-compliant CSV of currently filtered applicants"
            >
              <Download className="w-3.5 h-3.5" />
              Export to CSV ({filteredApplicants.length})
            </button>
            <button
              id="close-drawer-btn"
              onClick={onClose}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              aria-label="Close review modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="p-4 border-b border-zinc-800 bg-[#0d0f17] flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Status Tabs */}
          <div
            id="status-filter-tabs"
            className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0"
          >
            {[
              { id: "all", label: "All", count: counts.all },
              {
                id: "pending",
                label: "Pending",
                count: counts.pending,
                color: "text-amber-400",
              },
              {
                id: "shortlisted",
                label: "Shortlisted",
                count: counts.shortlisted,
                color: "text-cyan-400",
              },
              {
                id: "selected",
                label: "Selected",
                count: counts.selected,
                color: "text-emerald-400",
              },
              {
                id: "rejected",
                label: "Rejected",
                count: counts.rejected,
                color: "text-rose-400",
              },
            ].map((tab) => {
              const active = filterStatus === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`filter-tab-${tab.id}`}
                  onClick={() => setFilterStatus(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    active
                      ? "bg-zinc-800 text-white border border-zinc-700 shadow-inner"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
                      active ? "bg-zinc-700 text-white" : "bg-zinc-900 text-zinc-400"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              id="applicant-search-input"
              type="text"
              placeholder="Search by name, role, tech stack..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-900/90 border border-zinc-700/80 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            />
          </div>
        </div>

        {/* Applicants List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {filteredApplicants.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-zinc-800 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-zinc-800/80 flex items-center justify-center text-zinc-400 mb-3">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-zinc-200 font-semibold text-sm">
                No applicants match your current filter
              </p>
              <p className="text-zinc-500 text-xs mt-1 max-w-sm">
                Try clearing the search query or switching to another review
                stage tab.
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-3 text-xs text-indigo-400 hover:underline cursor-pointer"
                >
                  Clear search query
                </button>
              )}
            </div>
          ) : (
            filteredApplicants.map((applicant) => {
              const isExpanded = expandedId === applicant.id;

              const statusBadgeStyles: Record<
                ApplicantStatus,
                { bg: string; text: string; icon: React.ReactNode }
              > = {
                pending: {
                  bg: "bg-amber-500/10 border-amber-500/20 text-amber-300",
                  text: "Pending Review",
                  icon: <Clock className="w-3 h-3 text-amber-400" />,
                },
                shortlisted: {
                  bg: "bg-indigo-500/10 border-indigo-500/20 text-indigo-300",
                  text: "Shortlisted",
                  icon: <Sparkles className="w-3 h-3 text-indigo-400" />,
                },
                selected: {
                  bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-300",
                  text: "Accepted / Selected",
                  icon: <CheckCircle2 className="w-3 h-3 text-emerald-400" />,
                },
                rejected: {
                  bg: "bg-rose-500/10 border-rose-500/20 text-rose-300",
                  text: "Declined",
                  icon: <Ban className="w-3 h-3 text-rose-400" />,
                },
              };

              const badge = statusBadgeStyles[applicant.status] || statusBadgeStyles.pending;

              return (
                <div
                  key={applicant.id}
                  id={`applicant-card-${applicant.id}`}
                  className="rounded-xl border border-zinc-800/90 bg-[#121524]/60 hover:border-zinc-700/80 transition-all p-5 shadow-sm"
                >
                  {/* Summary Bar */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-base font-semibold text-white">
                          {applicant.fullName}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full border font-medium ${badge.bg}`}
                        >
                          {badge.icon}
                          {badge.text}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 mt-1">
                        {applicant.currentRole && (
                          <>
                            <span className="text-zinc-300 font-medium flex items-center gap-1">
                              <Briefcase className="w-3 h-3 text-zinc-500" />
                              {applicant.currentRole}
                            </span>
                            <span>•</span>
                          </>
                        )}
                        {applicant.yearsOfExperience && (
                          <>
                            <span>{applicant.yearsOfExperience} exp</span>
                            <span>•</span>
                          </>
                        )}
                        <a
                          href={`mailto:${applicant.email}`}
                          className="text-zinc-400 hover:text-cyan-400 underline decoration-zinc-600"
                        >
                          {applicant.email}
                        </a>
                        {applicant.phoneNumber && (
                          <>
                            <span>•</span>
                            <a
                              href={`https://wa.me/${applicant.phoneNumber.replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium"
                              title="Message on WhatsApp"
                            >
                              <Phone className="w-3 h-3" />
                              {applicant.phoneNumber}
                            </a>
                          </>
                        )}
                        {applicant.profileUrl && (
                          <>
                            <span>•</span>
                            <a
                              href={applicant.profileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 underline"
                            >
                              Profile <ExternalLink className="w-3 h-3" />
                            </a>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions & Expand */}
                    <div className="flex items-center gap-2 pt-2 md:pt-0 border-t border-zinc-800/60 md:border-t-0">
                      {/* Status switch buttons */}
                      <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                        <button
                          id={`btn-shortlist-${applicant.id}`}
                          onClick={() =>
                            handleStatusChange(applicant.id, "shortlisted")
                          }
                          title="Mark as Shortlisted"
                          className={`px-2 py-1 text-[11px] font-medium rounded transition-colors cursor-pointer ${
                            applicant.status === "shortlisted"
                              ? "bg-cyan-500 text-slate-950 font-bold"
                              : "text-zinc-400 hover:text-white"
                          }`}
                        >
                          Shortlist
                        </button>
                        <button
                          id={`btn-select-${applicant.id}`}
                          onClick={() =>
                            handleStatusChange(applicant.id, "selected")
                          }
                          title="Accept & Select for Cohort"
                          className={`px-2 py-1 text-[11px] font-medium rounded transition-colors cursor-pointer ${
                            applicant.status === "selected"
                              ? "bg-emerald-600 text-white"
                              : "text-zinc-400 hover:text-white"
                          }`}
                        >
                          Select
                        </button>
                        <button
                          id={`btn-reject-${applicant.id}`}
                          onClick={() =>
                            handleStatusChange(applicant.id, "rejected")
                          }
                          title="Decline"
                          className={`px-2 py-1 text-[11px] font-medium rounded transition-colors cursor-pointer ${
                            applicant.status === "rejected"
                              ? "bg-rose-900/60 text-rose-300 border border-rose-700/50"
                              : "text-zinc-400 hover:text-rose-400"
                          }`}
                        >
                          Decline
                        </button>
                        <button
                          id={`btn-pending-${applicant.id}`}
                          onClick={() =>
                            handleStatusChange(applicant.id, "pending")
                          }
                          title="Reset to Pending"
                          className={`p-1 text-[11px] rounded transition-colors cursor-pointer ${
                            applicant.status === "pending"
                              ? "bg-zinc-700 text-white"
                              : "text-zinc-400 hover:text-white"
                          }`}
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        id={`btn-toggle-expand-${applicant.id}`}
                        onClick={() =>
                          setExpandedId(isExpanded ? null : applicant.id)
                        }
                        className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
                        aria-label={isExpanded ? "Collapse details" : "Expand details"}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Highlights Pill Row */}
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                      <Layers className="w-3 h-3 text-cyan-400" />
                      <strong className="text-zinc-400 mr-1">Stack:</strong>
                      {applicant.primaryStack}
                    </span>
                    {applicant.weeklyHours && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        <strong className="text-zinc-400 mr-1">Commitment:</strong>
                        {applicant.weeklyHours}
                      </span>
                    )}
                    <span className="text-[11px] text-zinc-500 ml-auto">
                      Submitted: {new Date(applicant.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Collapsible Deep-Dive Details */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-zinc-800/80 space-y-3 text-xs animate-in fade-in duration-200">
                      <div>
                        <h4 className="font-semibold text-cyan-300 flex items-center gap-1.5 mb-1">
                          <Target className="w-3.5 h-3.5" />
                          30-Day Target Outcome
                        </h4>
                        <p className="text-zinc-200 bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-800/80 leading-relaxed">
                          {applicant.targetOutcome}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-amber-300 flex items-center gap-1.5 mb-1">
                          Biggest Engineering Bottleneck
                        </h4>
                        <p className="text-zinc-200 bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-800/80 leading-relaxed">
                          {applicant.bottleneck}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-emerald-300 flex items-center gap-1.5 mb-1">
                          Why Kelvin? / Fit Pitch
                        </h4>
                        <p className="text-zinc-300 bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-800/80 leading-relaxed whitespace-pre-line">
                          {applicant.whyYou}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-zinc-800 bg-[#121522]/90 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-3">
            <span>
              Total records: <strong className="text-white">{applicants.length}</strong>
            </span>
            <span>•</span>
            <button
              onClick={handleResetData}
              className="text-zinc-400 hover:text-zinc-200 underline cursor-pointer"
            >
              Reset to Sample Data
            </button>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-medium transition-colors cursor-pointer"
          >
            Done Reviewing
          </button>
        </div>
      </div>
    </div>
  );
}
