"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import {
  ApplicantFormData,
  step1Schema,
  step2Schema,
  step3Schema,
} from "@/lib/validations/applicantSchema";
import {
  saveApplicant,
  isEmailRegistered,
  isPhoneRegistered,
  generateReferenceId,
  formatDisplayRefId,
} from "@/lib/applicantStore";
import {
  User,
  Mail,
  Phone,
  Clock,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Send,
  Loader2,
  Laptop,
} from "lucide-react";

interface ApplicationFunnelProps {
  onClose?: () => void;
}

const defaultFormData: ApplicantFormData = {
  fullName: "",
  email: "",
  phoneNumber: "",
  targetOutcome: "",
  bottleneck: "",
  hasLaptop: "",
  codingLevel: "",
  whyYou: "",
};

export default function ApplicationFunnel({
  onClose,
}: ApplicationFunnelProps) {
  // Synchronously initialize active step from URL params or saved session step
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(() => {
    if (typeof window !== "undefined") {
      try {
        const params = new URLSearchParams(window.location.search);
        const stepParam = params.get("step");
        const savedStep = sessionStorage.getItem("mentorship_return_step");
        const targetStep = stepParam || savedStep;
        if (targetStep === "1" || targetStep === "2" || targetStep === "3") {
          return Number(targetStep) as 1 | 2 | 3;
        }

        const savedDraft = sessionStorage.getItem("kelvin_mentorship_draft");
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft);
          if (parsed.currentStep) return parsed.currentStep;
        }
      } catch {}
    }
    return 1;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState("");
  const [apiError, setApiError] = useState<string | null>(null);

  // Synchronously initialize form data from draft in sessionStorage
  const [formData, setFormData] = useState<ApplicantFormData>(() => {
    if (typeof window !== "undefined") {
      try {
        const savedDraft = sessionStorage.getItem("kelvin_mentorship_draft");
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft);
          if (parsed.formData) {
            return { ...defaultFormData, ...parsed.formData };
          }
        }
      } catch {}
    }
    return defaultFormData;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Persist draft and return step to sessionStorage on changes
  useEffect(() => {
    if (isSubmitted || typeof window === "undefined") return;
    try {
      sessionStorage.setItem("mentorship_modal_active", "true");
      sessionStorage.setItem("mentorship_return_step", String(currentStep));
      sessionStorage.setItem(
        "kelvin_mentorship_draft",
        JSON.stringify({ formData, currentStep })
      );

      // Keep browser address bar in sync: /?apply=true&step=X
      const url = new URL(window.location.href);
      if (url.searchParams.get("apply") === "true") {
        url.searchParams.set("step", String(currentStep));
        window.history.replaceState(null, "", url.toString());
      }
    } catch {}
  }, [formData, currentStep, isSubmitted]);

  // Confetti burst
  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#06b6d4", "#38bdf8", "#3b82f6", "#2dd4bf", "#ffffff"],
      });

      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 250);
    } catch (e) {
      console.warn("Confetti effect failed gracefully:", e);
    }
  };

  const updateField = (field: keyof ApplicantFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Step 1 Validation
  const validateStep1 = () => {
    const res = step1Schema.safeParse({
      fullName: formData.fullName,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
    });

    if (!res.success) {
      const fieldErrors: Record<string, string> = {};
      res.error.issues.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0].toString()] = err.message;
      });
      setErrors(fieldErrors);
      return false;
    }

    if (isEmailRegistered(formData.email)) {
      setErrors({
        email: "An application with this email has already been submitted.",
      });
      return false;
    }

    if (isPhoneRegistered(formData.phoneNumber)) {
      setErrors({
        phoneNumber: "An application with this phone number has already been submitted.",
      });
      return false;
    }

    setErrors({});
    return true;
  };

  // Step 2 Validation
  const validateStep2 = () => {
    const res = step2Schema.safeParse({
      targetOutcome: formData.targetOutcome,
      bottleneck: formData.bottleneck,
    });

    if (!res.success) {
      const fieldErrors: Record<string, string> = {};
      res.error.issues.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0].toString()] = err.message;
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  // Step 3 Validation
  const validateStep3 = () => {
    const res = step3Schema.safeParse({
      hasLaptop: formData.hasLaptop,
      codingLevel: formData.codingLevel,
      whyYou: formData.whyYou,
    });

    if (!res.success) {
      const fieldErrors: Record<string, string> = {};
      res.error.issues.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0].toString()] = err.message;
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleNext = () => {
    setApiError(null);
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    setApiError(null);
    if (currentStep === 2) setCurrentStep(1);
    if (currentStep === 3) setCurrentStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep3()) return;

    if (isEmailRegistered(formData.email)) {
      setErrors({
        email: "An application with this email has already been submitted.",
      });
      setCurrentStep(1);
      setApiError("An application with this email address has already been submitted.");
      return;
    }

    if (isPhoneRegistered(formData.phoneNumber)) {
      setErrors({
        phoneNumber: "An application with this phone number has already been submitted.",
      });
      setCurrentStep(1);
      setApiError("An application with this phone number has already been submitted.");
      return;
    }

    setIsSubmitting(true);
    setApiError(null);

    try {
      const response = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setApiError(
          data.error || "Failed to submit application. Please review your fields."
        );
        if (data.fieldErrors) {
          setErrors(data.fieldErrors);
          if (data.fieldErrors.email || data.fieldErrors.fullName || data.fieldErrors.phoneNumber) {
            setCurrentStep(1);
          } else if (data.fieldErrors.targetOutcome || data.fieldErrors.bottleneck) {
            setCurrentStep(2);
          } else if (data.fieldErrors.hasLaptop || data.fieldErrors.codingLevel || data.fieldErrors.whyYou) {
            setCurrentStep(3);
          }
        }
        setIsSubmitting(false);
        return;
      }

      if (data.applicant) {
        saveApplicant(data.applicant);
        setSubmissionId(data.applicant.id);
      } else {
        const fallbackId = generateReferenceId();
        saveApplicant({
          id: fallbackId,
          createdAt: new Date().toISOString(),
          status: "pending",
          ...formData,
        });
        setSubmissionId(fallbackId);
      }

      setIsSubmitted(true);
      setIsSubmitting(false);
      try {
        sessionStorage.removeItem("kelvin_mentorship_draft");
        sessionStorage.removeItem("mentorship_modal_active");
        sessionStorage.removeItem("mentorship_return_step");
        if (typeof window !== "undefined") {
          window.history.replaceState(null, "", "/");
        }
      } catch {}
      triggerCelebration();
    } catch (err) {
      console.error("Submission error:", err);
      setApiError("Unable to submit application right now. Please check your connection and try again.");
      setIsSubmitting(false);
    }
  };

  // SUCCESS SCREEN
  if (isSubmitted) {
    return (
      <div
        id="application-success-card"
        className="gorilla-glass mirror-water-sheen p-8 md:p-12 rounded-3xl text-center relative overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300"
      >
        <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center text-slate-950 shadow-xl shadow-cyan-500/25 mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5" /> Application Received
        </div>

        <h3 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight mb-3">
          You&apos;re in the Queue, {formData.fullName.split(" ")[0]}!
        </h3>
        <p className="text-slate-300 text-sm md:text-base max-w-lg mx-auto mb-6 leading-relaxed">
          Your application for the upcoming 1-Month Mentorship cohort has been
          logged. Ref ID:{" "}
          <span className="font-mono text-cyan-300 font-semibold px-2.5 py-1 rounded-md bg-cyan-500/15 border border-cyan-500/30 tracking-wider">
            {formatDisplayRefId(submissionId)}
          </span>
        </p>

        {/* Next Steps Notice */}
        <div className="gorilla-glass rounded-2xl p-5 max-w-lg mx-auto mb-8 text-center">
          <p className="text-sm sm:text-base text-slate-200 font-medium">
            We will get back to you shortly if you are selected.
          </p>
        </div>

        {onClose && (
          <div className="flex items-center justify-center pt-2">
            <button
              id="close-success-btn"
              onClick={onClose}
              className="inline-flex items-center justify-center px-8 py-3 rounded-xl liquid-glass-btn text-slate-950 font-bold text-sm transition-all shadow-lg shadow-cyan-500/25 cursor-pointer"
            >
              Done
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      id="application-funnel-card"
      className="gorilla-glass mirror-water-sheen p-6 sm:p-8 md:p-10 rounded-3xl relative overflow-hidden"
    >
      {/* Funnel Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3 text-xs font-semibold tracking-wide uppercase text-slate-400">
          <span
            className={currentStep >= 1 ? "text-cyan-400 font-semibold" : "text-slate-600"}
          >
            1. Background
          </span>
          <span
            className={currentStep >= 2 ? "text-cyan-400 font-semibold" : "text-slate-600"}
          >
            2. Goals & Bottlenecks
          </span>
          <span
            className={currentStep >= 3 ? "text-cyan-400 font-semibold" : "text-slate-600"}
          >
            3. Commitment & Pitch
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-800/80 rounded-full overflow-hidden p-0.5">
          <div
            id="funnel-progress-bar"
            className="h-full bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 rounded-full transition-all duration-300"
            style={{
              width:
                currentStep === 1
                  ? "33.33%"
                  : currentStep === 2
                  ? "66.66%"
                  : "100%",
            }}
          />
        </div>
      </div>

      {apiError && (
        <div
          id="api-error-banner"
          className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3 animate-in fade-in"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{apiError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* STEP 1: Background */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-in fade-in duration-200">

            {/* Full Name */}
            <div>
              <label
                htmlFor="input-fullName"
                className="block text-xs font-semibold text-slate-300 mb-1.5"
              >
                Full Name <span className="text-cyan-400">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="input-fullName"
                  type="text"
                  autoComplete="name"
                  value={formData.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none transition-all ${
                    errors.fullName
                      ? "border border-rose-500 bg-slate-900/90 focus:ring-1 focus:ring-rose-500"
                      : "gorilla-glass-input"
                  }`}
                />
              </div>
              {errors.fullName && (
                <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.fullName}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="input-email"
                className="block text-xs font-semibold text-slate-300 mb-1.5"
              >
                Email Address <span className="text-cyan-400">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="input-email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none transition-all ${
                    errors.email
                      ? "border border-rose-500 bg-slate-900/90 focus:ring-1 focus:ring-rose-500"
                      : "gorilla-glass-input"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.email}
                </p>
              )}
            </div>

            {/* Phone Number (WhatsApp enabled) */}
            <div>
              <label
                htmlFor="input-phoneNumber"
                className="block text-xs font-semibold text-slate-300 mb-1.5"
              >
                Phone Number (WhatsApp enabled){" "}
                <span className="text-cyan-400">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="input-phoneNumber"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => {
                    const onlyNums = e.target.value.replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "");
                    updateField("phoneNumber", onlyNums);
                  }}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none transition-all ${
                    errors.phoneNumber
                      ? "border border-rose-500 bg-slate-900/90 focus:ring-1 focus:ring-rose-500"
                      : "gorilla-glass-input"
                  }`}
                />
              </div>
              {errors.phoneNumber && (
                <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.phoneNumber}
                </p>
              )}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                id="btn-step1-next"
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl liquid-glass-btn text-slate-950 font-bold text-sm transition-all shadow-lg shadow-cyan-500/25 cursor-pointer"
              >
                Continue to Goals <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Technical Focus & Goals */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-in fade-in duration-200">

            {/* 30-Day Target Outcome */}
            <div>
              <label
                htmlFor="input-targetOutcome"
                className="block text-xs font-semibold text-slate-300 mb-1.5"
              >
                What is your first Target Outcome for the 30 Days?{" "}
                <span className="text-cyan-400">*</span>
              </label>
              <textarea
                id="input-targetOutcome"
                rows={3}
                maxLength={500}
                value={formData.targetOutcome}
                onChange={(e) => updateField("targetOutcome", e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none transition-all resize-none ${
                  errors.targetOutcome
                    ? "border border-rose-500 bg-slate-900/90 focus:ring-1 focus:ring-rose-500"
                    : "gorilla-glass-input"
                }`}
              />
              <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                <span>Minimum 10 characters</span>
                <span className={formData.targetOutcome.length >= 480 ? "text-cyan-300 font-medium" : ""}>
                  {formData.targetOutcome.length} / 500 chars
                </span>
              </div>
              {errors.targetOutcome && (
                <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.targetOutcome}
                </p>
              )}
            </div>

            {/* Biggest Bottleneck */}
            <div>
              <label
                htmlFor="input-bottleneck"
                className="block text-xs font-semibold text-slate-300 mb-1.5"
              >
                What is your biggest current engineering or career bottleneck?{" "}
                <span className="text-cyan-400">*</span>
              </label>
              <textarea
                id="input-bottleneck"
                rows={3}
                maxLength={500}
                value={formData.bottleneck}
                onChange={(e) => updateField("bottleneck", e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none transition-all resize-none ${
                  errors.bottleneck
                    ? "border border-rose-500 bg-slate-900/90 focus:ring-1 focus:ring-rose-500"
                    : "gorilla-glass-input"
                }`}
              />
              <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                <span>Minimum 10 characters</span>
                <span className={formData.bottleneck.length >= 480 ? "text-cyan-300 font-medium" : ""}>
                  {formData.bottleneck.length} / 500 chars
                </span>
              </div>
              {errors.bottleneck && (
                <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.bottleneck}
                </p>
              )}
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                id="btn-step2-back"
                onClick={handleBack}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              <button
                type="button"
                id="btn-step2-next"
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl liquid-glass-btn text-slate-950 font-bold text-sm transition-all shadow-lg shadow-cyan-500/25 cursor-pointer"
              >
                Continue to Commitment <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Commitment & Pitch */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-in fade-in duration-200">

            {/* Weekend Schedule Notice */}
            <div className="p-3.5 rounded-xl gorilla-glass text-cyan-200 text-xs flex items-center gap-2.5">
              <Clock className="w-4 h-4 shrink-0 text-cyan-400" />
              <span>
                All live calls with Kelvin Okoro are held exclusively on <strong>weekends (Saturdays & Sundays)</strong>
              </span>
            </div>

            {/* Laptop / Hardware Requirement */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                Laptop Specification Requirement <span className="text-cyan-400">*</span>
              </label>

              {/* Requirement specification card */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 font-semibold">
                  <Laptop className="w-4 h-4" />
                  <span>Minimum Development Laptop Specification:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                    <strong className="text-white block mb-0.5">💻 PC (Windows / Linux)</strong>
                    <span className="text-slate-400">Intel Core i5 (or AMD Ryzen 5) • 8GB+ RAM</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                    <strong className="text-white block mb-0.5">🍎 Mac (Apple)</strong>
                    <span className="text-slate-400">Apple Silicon M1 (or newer) / Intel Core i5 • 8GB+ Unified RAM</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  A capable machine is required to run IntelliJ IDEA, Docker containers, and live JVM debugging tools smoothly.
                </p>
              </div>

              {/* Radio selection */}
              <div className="space-y-2 pt-1">
                {[
                  {
                    value: "Yes (Meets or exceeds Core i5 / Apple M1 with 8GB+ RAM)",
                    title: "Yes, I have a laptop meeting this specification",
                    subtitle: "Intel Core i5 / Apple Silicon M1 (or higher) with 8GB+ RAM",
                  },
                  {
                    value: "No (Below Core i5 / 8GB RAM)",
                    title: "No, my laptop is below this specification",
                    subtitle: "Lower processor or less than 8GB RAM",
                  },
                  {
                    value: "No (I do not currently have a personal laptop)",
                    title: "No, I do not have a laptop currently",
                    subtitle: "Need to acquire one before cohort starts",
                  },
                ].map((option) => (
                  <label
                    key={option.value}
                    onClick={() => updateField("hasLaptop", option.value)}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      formData.hasLaptop === option.value
                        ? "border-cyan-400 bg-cyan-950/30 text-white shadow-sm"
                        : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="hasLaptop"
                      value={option.value}
                      checked={formData.hasLaptop === option.value}
                      onChange={() => updateField("hasLaptop", option.value)}
                      className="mt-0.5 text-cyan-400 focus:ring-cyan-400 focus:ring-offset-slate-900"
                    />
                    <div>
                      <div className="font-semibold text-white">{option.title}</div>
                      <div className="text-[11px] text-slate-400">{option.subtitle}</div>
                    </div>
                  </label>
                ))}
              </div>

              {errors.hasLaptop && (
                <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.hasLaptop}
                </p>
              )}
            </div>

            {/* Level of Experience in Coding (1 to 10) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-300">
                  Level of Experience in Coding (1 to 10) <span className="text-cyan-400">*</span>
                </label>
                <span className="text-[11px] text-slate-400 font-medium">
                  {formData.codingLevel ? `Selected: Level ${formData.codingLevel}/10` : "Select 1 to 10"}
                </span>
              </div>

              {/* 1 to 10 Selectable Buttons */}
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {Array.from({ length: 10 }, (_, i) => String(i + 1)).map((level) => {
                  const isSelected = formData.codingLevel === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      id={`btn-coding-level-${level}`}
                      aria-pressed={isSelected}
                      aria-label={`Coding experience level ${level} out of 10`}
                      onClick={() => updateField("codingLevel", level)}
                      className={`h-11 rounded-xl text-sm font-bold flex flex-col items-center justify-center transition-all cursor-pointer ${
                        isSelected
                          ? "bg-gradient-to-b from-cyan-400 to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/30 scale-105 border border-cyan-200"
                          : "bg-slate-900/80 border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white hover:bg-slate-800/60"
                      }`}
                    >
                      {level}
                    </button>
                  );
                })}
              </div>

              {/* Helper scale descriptors */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-0.5">
                <span>1 = Absolute Beginner</span>
                <span>5 = Intermediate</span>
                <span>10 = Advanced</span>
              </div>

              {formData.codingLevel && (
                <div className="p-2.5 rounded-lg bg-cyan-950/20 border border-cyan-500/20 text-xs text-cyan-300 flex items-center gap-2 animate-in fade-in duration-150">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                  <span>
                    {Number(formData.codingLevel) <= 2 && "Beginner: Just starting out with programming basics & syntax."}
                    {Number(formData.codingLevel) >= 3 && Number(formData.codingLevel) <= 4 && "Elementary: Understand basic programming constructs, logic, and small scripts."}
                    {Number(formData.codingLevel) >= 5 && Number(formData.codingLevel) <= 6 && "Intermediate: Comfortable building full applications, APIs & database models."}
                    {Number(formData.codingLevel) >= 7 && Number(formData.codingLevel) <= 8 && "Upper Intermediate: Building production services, concurrency & architectural patterns."}
                    {Number(formData.codingLevel) >= 9 && "Advanced: Senior engineering level, distributed systems & high-scale optimizations."}
                  </span>
                </div>
              )}

              {errors.codingLevel && (
                <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.codingLevel}
                </p>
              )}
            </div>

            {/* Why You? Pitch */}
            <div>
              <label
                htmlFor="input-whyYou"
                className="block text-xs font-semibold text-slate-300 mb-1.5"
              >
                Why You? (Pitch your determination & fit for this cohort){" "}
                <span className="text-cyan-400">*</span>
              </label>
              <textarea
                id="input-whyYou"
                rows={4}
                maxLength={1500}
                value={formData.whyYou}
                onChange={(e) => updateField("whyYou", e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none transition-all resize-none ${
                  errors.whyYou
                    ? "border border-rose-500 bg-slate-900/90 focus:ring-1 focus:ring-rose-500"
                    : "gorilla-glass-input"
                }`}
              />
              <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                <span>Minimum 20 characters</span>
                <span className={formData.whyYou.length >= 1450 ? "text-cyan-300 font-medium" : ""}>
                  {formData.whyYou.length} / 1500 chars
                </span>
              </div>
              {errors.whyYou && (
                <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.whyYou}
                </p>
              )}
            </div>

            {/* Cohort Guarantee & Trust Note */}
            <div className="p-3.5 rounded-xl gorilla-glass text-cyan-200 text-xs flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 shrink-0 text-cyan-400" />
              <span>
                <strong>Zero spam guarantee:</strong> Your application is
                strictly confidential and reviewed solely by Kelvin. No automated
                rejection bots.
              </span>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                id="btn-step3-back"
                onClick={handleBack}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-all cursor-pointer disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              <button
                type="submit"
                id="btn-submit-application"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-xl liquid-glass-btn text-slate-950 font-extrabold text-sm transition-all shadow-xl shadow-cyan-500/30 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> Submitting
                    Application...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-slate-950" /> Submit Application to Kelvin
                  </>
                )}
              </button>
            </div>

            {/* Privacy & Data Policy Notice at point of submitting */}
            <p className="text-[11px] text-slate-400 text-center pt-2">
              🔒 By submitting, you agree to our{" "}
              <Link
                href={`/privacy?from=apply&step=${currentStep}`}
                onClick={() => {
                  try {
                    sessionStorage.setItem("mentorship_modal_active", "true");
                    sessionStorage.setItem("mentorship_return_step", String(currentStep));
                    sessionStorage.setItem(
                      "kelvin_mentorship_draft",
                      JSON.stringify({ formData, currentStep })
                    );
                  } catch {}
                }}
                className="text-cyan-400 hover:text-cyan-300 underline font-medium cursor-pointer"
              >
                Data Privacy Policy
              </Link>
              . Your contact information and application answers are used solely for mentorship evaluation. Never sold or shared.
            </p>
          </div>
        )}
      </form>
    </div>
  );
}
