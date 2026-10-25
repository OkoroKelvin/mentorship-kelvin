"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ApplicantRecord } from "@/lib/validations/applicantSchema";
import {
  getStoredApplicants,
  exportApplicantsToCSV,
} from "@/lib/applicantStore";
import {
  Search,
  Download,
  Lock,
  Phone,
  Mail,
  ArrowRight,
  Database,
  ArrowLeft,
  RefreshCw,
  Target,
  AlertCircle,
  MessageSquare,
  Users,
  Calendar,
  X,
  Laptop,
  Code2,
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
  const [searchQuery, setSearchQuery] = useState("");
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

  // Fetch applicants from API
  const refreshApplicants = async () => {
    setIsLoading(true);
    try {
      const secret = tokenParam || validSecret;
      const res = await fetch(`/api/apply?key=${encodeURIComponent(secret)}`, {
        headers: {
          "x-admin-key": secret,
          Authorization: `Bearer ${secret}`,
        },
      });
      const data = await res.json();

      if (res.ok && data.success && Array.isArray(data.applicants)) {
        setDataSource(data.source || "cloudflare-d1");
        setApplicants(data.applicants);
        if (typeof window !== "undefined") {
          localStorage.setItem("kelvin_mentorship_applicants_v3", JSON.stringify(data.applicants));
        }
      } else {
        setApplicants(getStoredApplicants());
        setDataSource("local");
      }
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
        const secret = tokenParam || validSecret;
        const res = await fetch(`/api/apply?key=${encodeURIComponent(secret)}`, {
          headers: {
            "x-admin-key": secret,
            Authorization: `Bearer ${secret}`,
          },
        });
        const data = await res.json();
        if (ignore) return;

        if (res.ok && data.success && Array.isArray(data.applicants)) {
          setDataSource(data.source || "cloudflare-d1");
          setApplicants(data.applicants);
          if (typeof window !== "undefined") {
            localStorage.setItem("kelvin_mentorship_applicants_v3", JSON.stringify(data.applicants));
          }
        } else {
          setApplicants(getStoredApplicants());
          setDataSource("local");
        }
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

  // Search Filter
  const filteredApplicants = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return applicants;

    return applicants.filter((app) => {
      return (
        app.fullName.toLowerCase().includes(q) ||
        app.email.toLowerCase().includes(q) ||
        (app.phoneNumber && app.phoneNumber.toLowerCase().includes(q)) ||
        (app.id && app.id.toLowerCase().includes(q)) ||
        (app.hasLaptop && app.hasLaptop.toLowerCase().includes(q)) ||
        (app.codingLevel && app.codingLevel.toLowerCase().includes(q)) ||
        app.targetOutcome.toLowerCase().includes(q) ||
        app.bottleneck.toLowerCase().includes(q) ||
        app.whyYou.toLowerCase().includes(q)
      );
    });
  }, [applicants, searchQuery]);

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
              Enter the admin secret token to view cohort applications.
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
              View Applications <ArrowRight className="w-4 h-4 text-slate-950" />
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

  // AUTHENTICATED DASHBOARD - LIGHTWEIGHT & CLEAN
  return (
    <div className="min-h-screen bg-[#090a0f] text-gray-100 flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-[#0c0e18]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
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
                  Received Applications
                </h1>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Kelvin Okoro 1-on-1 Mentorship Applications
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
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full space-y-6">
        {/* Simple Metric Bar - ONLY Total Received */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl border border-zinc-800 bg-[#0f111d] flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-cyan-400" /> Total Received
              </div>
              <div className="text-3xl font-extrabold text-white tracking-tight">
                {applicants.length}
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-zinc-500 block">Status: Active</span>
              <span className="text-xs text-emerald-400 font-medium">Ready for review</span>
            </div>
          </div>

          {/* Quick Search Bar */}
          <div className="p-5 rounded-2xl border border-zinc-800 bg-[#0f111d] flex flex-col justify-center">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search by name, email, phone, or answer keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 text-xs bg-zinc-900 border border-zinc-700/80 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {searchQuery && (
              <p className="text-[11px] text-zinc-400 mt-2">
                Showing <strong className="text-cyan-400">{filteredApplicants.length}</strong> of {applicants.length} applicants
              </p>
            )}
          </div>
        </div>

        {/* Applicants List - Clean Data View */}
        <div className="space-y-4">
          {filteredApplicants.length === 0 ? (
            <div className="p-16 text-center border border-dashed border-zinc-800 rounded-2xl space-y-2 bg-[#0c0e18]/40">
              <Search className="w-8 h-8 mx-auto text-zinc-600" />
              <h3 className="text-zinc-300 font-semibold text-sm">
                No applications match your search
              </h3>
              <p className="text-zinc-500 text-xs">
                Clear the search query to see all received applicants.
              </p>
            </div>
          ) : (
            filteredApplicants.map((app, index) => (
              <article
                key={app.id || index}
                id={`admin-card-${app.id}`}
                className="p-6 rounded-2xl border border-zinc-800/80 bg-[#0f111d] hover:border-zinc-700 transition-all space-y-5 shadow-sm"
              >
                {/* Header: Full Name + Contact + Date/ID */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-tight">
                      {app.fullName}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 mt-1">
                      <a
                        href={`mailto:${app.email}`}
                        className="inline-flex items-center gap-1.5 text-zinc-300 hover:text-cyan-400 underline font-medium"
                      >
                        <Mail className="w-3.5 h-3.5 text-cyan-400" />
                        {app.email}
                      </a>
                      {app.phoneNumber && (
                        <>
                          <span>•</span>
                          <a
                            href={`https://wa.me/${app.phoneNumber.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-medium"
                            title="Open chat on WhatsApp"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            {app.phoneNumber}
                          </a>
                        </>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-2.5">
                      {app.codingLevel && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border bg-cyan-500/10 border-cyan-500/30 text-cyan-300">
                          <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Coding Level: {app.codingLevel}/10</span>
                        </span>
                      )}
                      {app.hasLaptop && (
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${
                            app.hasLaptop.startsWith("Yes")
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                              : "bg-amber-500/10 border-amber-500/30 text-amber-300"
                          }`}
                        >
                          <Laptop className="w-3.5 h-3.5" />
                          <span>Laptop: {app.hasLaptop}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-zinc-500 font-mono self-start sm:self-auto">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-zinc-500" />
                      {new Date(app.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span>•</span>
                    <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 text-[11px]">
                      {app.id}
                    </span>
                  </div>
                </div>

                {/* Body: Direct Answers to the 3 Core Questions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Target Outcome */}
                  <div className="space-y-1.5 p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800/70">
                    <div className="font-semibold text-cyan-300 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5" /> 30-Day Target Outcome
                    </div>
                    <p className="text-zinc-200 leading-relaxed">
                      {app.targetOutcome}
                    </p>
                  </div>

                  {/* Bottleneck */}
                  <div className="space-y-1.5 p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800/70">
                    <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" /> Biggest Bottleneck
                    </div>
                    <p className="text-zinc-200 leading-relaxed">
                      {app.bottleneck}
                    </p>
                  </div>

                  {/* Why You / Pitch */}
                  <div className="space-y-1.5 p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800/70">
                    <div className="font-semibold text-emerald-300 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5" /> Pitch / Why Kelvin
                    </div>
                    <p className="text-zinc-200 leading-relaxed whitespace-pre-line">
                      {app.whyYou}
                    </p>
                  </div>
                </div>
              </article>
            ))
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
