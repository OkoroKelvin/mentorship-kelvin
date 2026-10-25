"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ApplicantRecord,
  ApplicantStatus,
} from "@/lib/validations/applicantSchema";
import {
  getStoredApplicants,
  updateApplicantStatus,
  exportApplicantsToCSV,
} from "@/lib/applicantStore";
import {
  Search,
  Download,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Clock,
  Sparkles,
  CheckCircle2,
  Ban,
  RotateCcw,
  Layers,
  Target,
  Lock,
  Phone,
  ArrowRight,
  Database,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";

// Admin secret token fallback
const DEFAULT_ADMIN_SECRET = "kelvin_mentor_secret_2026";

function AdminPortalContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tokenParam = searchParams.get("token");

  const [inputToken, setInputToken] = useState("");
  const validSecret =
    process.env.NEXT_PUBLIC_ADMIN_SECRET || DEFAULT_ADMIN_SECRET;

  const isAuthenticated = tokenParam === validSecret;
  const [manualAuthError, setManualAuthError] = useState(false);
  const authError = manualAuthError || Boolean(tokenParam && tokenParam !== validSecret);

  const [applicants, setApplicants] = useState<ApplicantRecord[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dataSource, setDataSource] = useState<
    "cloudflare-d1" | "supabase" | "local" | "in-memory"
  >("local");

  const handleManualAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputToken.trim() === validSecret) {
      setManualAuthError(false);
      router.push(`/admin?token=${encodeURIComponent(inputToken.trim())}`);
    } else {
      setManualAuthError(true);
    }
  };

  // Fetch applicants from API & localStorage
  const refreshApplicants = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/apply");
      const data = await res.json();

      let serverApplicants: ApplicantRecord[] = [];
      if (res.ok && data.success && Array.isArray(data.applicants)) {
        serverApplicants = data.applicants;
        setDataSource(data.source || "in-memory");
      }

      const local = getStoredApplicants();
      const map = new Map<string, ApplicantRecord>();
      serverApplicants.forEach((a) => map.set(a.id, a));
      local.forEach((a) => {
        if (!map.has(a.id)) map.set(a.id, a);
      });

      const merged = Array.from(map.values()).sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setApplicants(merged);
    } catch (e) {
      console.warn("Failed to fetch from API, falling back to local store:", e);
      setApplicants(getStoredApplicants());
      setDataSource("local");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    let ignore = false;

    async function fetchData() {
      try {
        const res = await fetch("/api/apply");
        const data = await res.json();
        if (ignore) return;

        let serverApplicants: ApplicantRecord[] = [];
        if (res.ok && data.success && Array.isArray(data.applicants)) {
          serverApplicants = data.applicants;
          setDataSource(data.source || "in-memory");
        }

        const local = getStoredApplicants();
        const map = new Map<string, ApplicantRecord>();
        serverApplicants.forEach((a) => map.set(a.id, a));
        local.forEach((a) => {
          if (!map.has(a.id)) map.set(a.id, a);
        });

        const merged = Array.from(map.values()).sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setApplicants(merged);
      } catch (e) {
        if (!ignore) {
          console.warn("Failed to fetch from API, falling back to local store:", e);
          setApplicants(getStoredApplicants());
          setDataSource("local");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    void fetchData();

    return () => {
      ignore = true;
    };
  }, [isAuthenticated]);

  const handleStatusChange = async (id: string, newStatus: ApplicantStatus) => {
    // 1. Optimistic local update
    const updated = applicants.map((a) =>
      a.id === id ? { ...a, status: newStatus } : a
    );
    setApplicants(updated);
    updateApplicantStatus(id, newStatus);

    // 2. Send PATCH to API (Supabase)
    try {
      await fetch("/api/apply", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
    } catch (err) {
      console.warn("Failed to update status on server:", err);
    }
  };

  // Filter & Search
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

  const counts = useMemo(() => {
    return {
      all: applicants.length,
      pending: applicants.filter((a) => a.status === "pending").length,
      shortlisted: applicants.filter((a) => a.status === "shortlisted").length,
      selected: applicants.filter((a) => a.status === "selected").length,
      rejected: applicants.filter((a) => a.status === "rejected").length,
    };
  }, [applicants]);

  // LOGIN SCREEN IF NOT AUTHENTICATED
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#090a0f] flex items-center justify-center p-4">
        <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-zinc-800 bg-[#0f111d] shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-slate-950 font-bold shadow-xl shadow-cyan-500/20">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Mentor Portal Access
            </h1>
            <p className="text-zinc-400 text-xs mt-1">
              Enter the admin secret token to inspect and manage cohort
              applications.
            </p>
          </div>

          <form onSubmit={handleManualAuth} className="space-y-4">
            <div>
              <input
                id="admin-token-input"
                type="password"
                placeholder="Enter ADMIN_SECRET..."
                value={inputToken}
                onChange={(e) => setInputToken(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-center tracking-widest"
              />
            </div>

            {authError && (
              <p className="text-xs text-rose-400">
                Invalid secret token. (Hint: Use{" "}
                <code className="text-cyan-300">
                  {DEFAULT_ADMIN_SECRET}
                </code>{" "}
                for dev testing)
              </p>
            )}

            <button
              id="admin-auth-submit-btn"
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-cyan-500/30 cursor-pointer flex items-center justify-center gap-2"
            >
              Unlock Review Desk <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
          </form>

          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Landing Page
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // AUTHENTICATED DASHBOARD
  return (
    <div className="min-h-screen bg-[#090a0f] text-gray-100 flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-[#0c0e18]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
              title="Return to Public Landing Page"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-tight">
                  Centralized Mentor Review Portal
                </h1>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Kelvin Okoro Cohort Application Ingestion Desk
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Source indicator */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span>Source:</span>
              <strong className="text-zinc-200 capitalize">{dataSource}</strong>
            </div>

            <button
              onClick={refreshApplicants}
              disabled={isLoading}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Refresh applicants list"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
            </button>

            <button
              id="admin-export-csv-btn"
              onClick={() => exportApplicantsToCSV(filteredApplicants)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-950" />
              Export to CSV ({filteredApplicants.length})
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        {/* Metric Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { id: "all", label: "Total Received", count: counts.all, color: "text-white" },
            { id: "pending", label: "Pending", count: counts.pending, color: "text-amber-400" },
            { id: "shortlisted", label: "Shortlisted", count: counts.shortlisted, color: "text-cyan-400" },
            { id: "selected", label: "Selected (Cohort)", count: counts.selected, color: "text-emerald-400" },
            { id: "rejected", label: "Declined", count: counts.rejected, color: "text-rose-400" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilterStatus(item.id)}
              className={`p-4 rounded-2xl border transition-all text-left cursor-pointer ${
                filterStatus === item.id
                  ? "bg-zinc-800/90 border-cyan-500/50 shadow-md"
                  : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"
              }`}
            >
              <div className="text-xs text-zinc-400 font-medium">{item.label}</div>
              <div className={`text-2xl font-bold tracking-tight mt-1 ${item.color}`}>
                {item.count}
              </div>
            </button>
          ))}
        </div>

        {/* Filter and Search Controls */}
        <div className="glass-panel p-4 rounded-2xl border border-zinc-800 bg-[#0f111d] flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {["all", "pending", "shortlisted", "selected", "rejected"].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                  filterStatus === st
                    ? "bg-zinc-700 text-white shadow-inner"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[280px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by name, role, tech stack, or outcome..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-zinc-900/90 border border-zinc-700/80 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        {/* Applicants List */}
        <div className="space-y-4">
          {filteredApplicants.length === 0 ? (
            <div className="p-16 text-center border border-dashed border-zinc-800 rounded-2xl space-y-2">
              <Search className="w-8 h-8 mx-auto text-zinc-600" />
              <h3 className="text-zinc-300 font-semibold text-sm">
                No applicants match the current criteria
              </h3>
              <p className="text-zinc-500 text-xs">
                Try switching filter status or clearing the search bar.
              </p>
            </div>
          ) : (
            filteredApplicants.map((app) => {
              const isExpanded = expandedId === app.id;

              const statusBadgeStyles: Record<
                ApplicantStatus,
                { bg: string; text: string; icon: React.ReactNode }
              > = {
                pending: {
                  bg: "bg-amber-500/10 border-amber-500/20 text-amber-300",
                  text: "Pending",
                  icon: <Clock className="w-3 h-3 text-amber-400" />,
                },
                shortlisted: {
                  bg: "bg-indigo-500/10 border-indigo-500/20 text-indigo-300",
                  text: "Shortlisted",
                  icon: <Sparkles className="w-3 h-3 text-indigo-400" />,
                },
                selected: {
                  bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-300",
                  text: "Selected",
                  icon: <CheckCircle2 className="w-3 h-3 text-emerald-400" />,
                },
                rejected: {
                  bg: "bg-rose-500/10 border-rose-500/20 text-rose-300",
                  text: "Declined",
                  icon: <Ban className="w-3 h-3 text-rose-400" />,
                },
              };

              const badge =
                statusBadgeStyles[app.status] || statusBadgeStyles.pending;

              return (
                <div
                  key={app.id}
                  id={`admin-card-${app.id}`}
                  className="glass-panel p-6 rounded-2xl border border-zinc-800 bg-[#111322]/80 hover:border-zinc-700 transition-all space-y-4 shadow-sm"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-base font-bold text-white tracking-tight">
                          {app.fullName}
                        </h2>
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full border font-medium ${badge.bg}`}
                        >
                          {badge.icon}
                          {badge.text}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 mt-1">
                        {app.currentRole && (
                          <>
                            <span className="text-zinc-200 font-medium">
                              {app.currentRole}
                            </span>
                            <span>•</span>
                          </>
                        )}
                        {app.yearsOfExperience && (
                          <>
                            <span>{app.yearsOfExperience}</span>
                            <span>•</span>
                          </>
                        )}
                        <a
                          href={`mailto:${app.email}`}
                          className="text-zinc-400 hover:text-cyan-400 underline"
                        >
                          {app.email}
                        </a>
                        {app.phoneNumber && (
                          <>
                            <span>•</span>
                            <a
                              href={`https://wa.me/${app.phoneNumber.replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium"
                              title="Message on WhatsApp"
                            >
                              <Phone className="w-3 h-3" />
                              {app.phoneNumber}
                            </a>
                          </>
                        )}
                        {app.profileUrl && (
                          <>
                            <span>•</span>
                            <a
                              href={app.profileUrl}
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

                    {/* Pipeline Action Buttons */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                        <button
                          onClick={() => handleStatusChange(app.id, "shortlisted")}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                            app.status === "shortlisted"
                              ? "bg-cyan-500 text-slate-950 font-bold"
                              : "text-zinc-400 hover:text-white"
                          }`}
                        >
                          Shortlist
                        </button>
                        <button
                          onClick={() => handleStatusChange(app.id, "selected")}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                            app.status === "selected"
                              ? "bg-emerald-600 text-white"
                              : "text-zinc-400 hover:text-white"
                          }`}
                        >
                          Select
                        </button>
                        <button
                          onClick={() => handleStatusChange(app.id, "rejected")}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                            app.status === "rejected"
                              ? "bg-rose-900/60 text-rose-300"
                              : "text-zinc-400 hover:text-rose-400"
                          }`}
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleStatusChange(app.id, "pending")}
                          title="Reset to Pending"
                          className="p-1 rounded-lg text-zinc-400 hover:text-white cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() =>
                          setExpandedId(isExpanded ? null : app.id)
                        }
                        className="p-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors cursor-pointer"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Summary badges */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300">
                      <Layers className="w-3 h-3 text-cyan-400" />
                      <strong>Stack:</strong> {app.primaryStack}
                    </span>
                    {app.weeklyHours && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        <strong>Commitment:</strong> {app.weeklyHours}
                      </span>
                    )}
                    <span className="text-[11px] text-zinc-500 ml-auto">
                      Submitted: {new Date(app.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Collapsible Details */}
                  {isExpanded && (
                    <div className="pt-4 border-t border-zinc-800/80 space-y-3 text-xs animate-in fade-in duration-200">
                      <div>
                        <h3 className="font-semibold text-cyan-300 flex items-center gap-1 mb-1">
                          <Target className="w-3.5 h-3.5" /> 30-Day Target Outcome
                        </h3>
                        <p className="text-zinc-200 bg-zinc-900/90 p-3 rounded-xl border border-zinc-800">
                          {app.targetOutcome}
                        </p>
                      </div>

                      <div>
                        <h3 className="font-semibold text-amber-300 mb-1">
                          Biggest Engineering Bottleneck
                        </h3>
                        <p className="text-zinc-200 bg-zinc-900/90 p-3 rounded-xl border border-zinc-800">
                          {app.bottleneck}
                        </p>
                      </div>

                      <div>
                        <h3 className="font-semibold text-emerald-300 mb-1">
                          Why Kelvin? / Pitch
                        </h3>
                        <p className="text-zinc-300 bg-zinc-900/90 p-3 rounded-xl border border-zinc-800 whitespace-pre-line leading-relaxed">
                          {app.whyYou}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#090a0f] flex items-center justify-center text-zinc-400 text-sm">
          Loading Mentor Portal...
        </div>
      }
    >
      <AdminPortalContent />
    </Suspense>
  );
}
