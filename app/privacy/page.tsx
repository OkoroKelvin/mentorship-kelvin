import PrivacyBackButton from "@/components/PrivacyBackButton";
import { Shield, Lock, Trash2, Database, Mail, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Data Privacy Policy | Grow with Kelvin Okoro",
  description: "How Kelvin Okoro collects, protects, and handles applicant data for the Weekend Java Mentorship cohort.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#040711] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      {/* Background ambient water glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Header Bar */}
      <header className="sticky top-0 z-40 border-b border-cyan-500/15 bg-[#040711]/85 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300 tracking-wide">
            Grow with Kelvin Okoro
          </span>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[11px] font-semibold">
            <Shield className="w-3.5 h-3.5" />
            <span>Privacy & Data Protection</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12 w-full space-y-10 relative z-10">
        {/* Title Section */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Data Privacy & Protection Policy
          </h1>
          <p className="text-slate-400 text-sm">
            Effective Date: October 2026 • Governs the <strong>Grow with Kelvin Okoro. Weekend Mentorship with Java</strong> application funnel.
          </p>
        </div>

        {/* Quick Highlights Card */}
        <div className="gorilla-glass mirror-water-sheen rounded-3xl p-6 sm:p-8 border border-cyan-500/25 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-cyan-400" />
            Our Privacy Commitment in Plain English
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="space-y-1.5 p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h3 className="font-semibold text-white text-xs">Zero 3rd-Party Sharing</h3>
              <p className="text-[12px] text-slate-400 leading-relaxed">
                Your contact details and technical answers are never sold, rented, or distributed to recruiters, marketers, or advertisers.
              </p>
            </div>

            <div className="space-y-1.5 p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
              <Database className="w-5 h-5 text-cyan-400" />
              <h3 className="font-semibold text-white text-xs">Encrypted & Secure</h3>
              <p className="text-[12px] text-slate-400 leading-relaxed">
                Stored in encrypted Cloudflare D1 distributed infrastructure with restricted administrative access credentials.
              </p>
            </div>

            <div className="space-y-1.5 p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
              <Trash2 className="w-5 h-5 text-sky-400" />
              <h3 className="font-semibold text-white text-xs">Right to Deletion</h3>
              <p className="text-[12px] text-slate-400 leading-relaxed">
                You can request the complete deletion of your submission from our database at any time by sending a quick email.
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-8 text-sm text-slate-300 leading-relaxed">
          {/* 1. Who We Are */}
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-cyan-400">1.</span> Data Controller & Program Operator
            </h2>
            <p>
              The data controller responsible for the collection and processing of your personal data is <strong>Kelvin Okoro</strong> (Software Engineer & Mentor). This portal is operated independently to facilitate private, small-group weekend Java engineering mentorship.
            </p>
          </section>

          {/* 2. What We Collect */}
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-cyan-400">2.</span> Information We Collect
            </h2>
            <p>When you submit an application through our 3-step funnel, we collect only the information necessary to evaluate your fit for the cohort:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-400">
              <li><strong className="text-slate-200">Contact Identifiers:</strong> Full Name, Email Address, and WhatsApp Phone Number.</li>
              <li><strong className="text-slate-200">Hardware Readiness:</strong> Confirmation of PC or Mac specifications (e.g., Intel Core i5 / Apple Silicon M1+ with 8GB+ RAM) to ensure technical capability for local Java / Docker / microservice environments.</li>
              <li><strong className="text-slate-200">Technical Baseline:</strong> Self-rated Coding Experience Level (1 to 10 scale).</li>
              <li><strong className="text-slate-200">Candidacy Statements:</strong> Your 30-day target engineering outcome, biggest current technical bottleneck, and your personal pitch.</li>
            </ul>
          </section>

          {/* 3. Why We Collect It (Purpose & Lawful Basis) */}
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-cyan-400">3.</span> Purpose of Data Processing
            </h2>
            <p>Your data is processed strictly based on your consent and legitimate interests for:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-400">
              <li>Evaluating and selecting candidates for the limited cohort seats.</li>
              <li>Direct 1-on-1 communication via WhatsApp or Email regarding cohort selection, scheduling, and curriculum details.</li>
              <li>Tailoring technical sessions to address your specific bottlenecks and targets.</li>
            </ul>
          </section>

          {/* 4. Data Storage & Security */}
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-cyan-400">4.</span> Security & Storage
            </h2>
            <p>
              We implement industry-standard technical measures to protect your submissions:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-400">
              <li>All web traffic is transmitted via TLS 1.3 HTTPS encryption.</li>
              <li>Application records are stored within Cloudflare D1 serverless SQL databases with enterprise-grade data isolation.</li>
              <li>Access to the administrative portal is strictly protected by administrative credentials and is never exposed to public endpoints.</li>
            </ul>
          </section>

          {/* 5. Your Rights */}
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-cyan-400">5.</span> Your Rights (NDPR & GDPR Compliance)
            </h2>
            <p>Under applicable data privacy regulations (including the Nigeria Data Protection Act and GDPR standards), you possess the right to:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-400">
              <li><strong className="text-slate-200">Access:</strong> Request confirmation of whether your application data is stored.</li>
              <li><strong className="text-slate-200">Rectification:</strong> Request correction of any inaccurate contact details.</li>
              <li><strong className="text-slate-200">Erasure (&ldquo;Right to be Forgotten&rdquo;):</strong> Request the permanent deletion of your submission from our database at any time.</li>
              <li><strong className="text-slate-200">Withdraw Consent:</strong> Opt out of future communications with zero penalty.</li>
            </ul>
          </section>

          {/* 6. Contact */}
          <section className="space-y-3 pt-4 border-t border-slate-800">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Mail className="w-5 h-5 text-cyan-400" />
              Contact & Privacy Inquiries
            </h2>
            <p>
              If you have any questions regarding this policy or wish to exercise your right to view or delete your submitted information, please reach out directly:
            </p>
            <div className="p-4 rounded-2xl gorilla-glass border border-cyan-500/20 inline-block">
              <p className="text-xs text-slate-400">
                Email Kelvin Okoro:{" "}
                <a
                  href="mailto:okorokelvinemoakpooke@gmail.com"
                  className="text-cyan-400 hover:text-cyan-300 font-semibold underline ml-1"
                >
                  okorokelvinemoakpooke@gmail.com
                </a>
              </p>
            </div>
          </section>
        </div>

        {/* Back Button */}
        <div className="pt-6 border-t border-slate-800 flex justify-center">
          <PrivacyBackButton
            label="Back to Mentorship"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 border border-cyan-500/20 hover:border-cyan-400 text-cyan-300 text-xs font-bold transition-all shadow-sm cursor-pointer"
          />
        </div>
      </main>
    </div>
  );
}
