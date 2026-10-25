"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface PrivacyBackButtonProps {
  label?: string;
  className?: string;
}

export default function PrivacyBackButton({
  label = "Back to Mentorship",
  className = "inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer",
}: PrivacyBackButtonProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window === "undefined") return;

    try {
      const params = new URLSearchParams(window.location.search);
      const stepParam = params.get("step");
      const savedStep = sessionStorage.getItem("mentorship_return_step");
      const returnStep = stepParam || savedStep || "3";

      const isFromApply =
        params.get("from") === "apply" ||
        sessionStorage.getItem("mentorship_modal_active") === "true" ||
        !!sessionStorage.getItem("kelvin_mentorship_draft");

      const targetUrl = isFromApply ? `/?apply=true&step=${returnStep}` : "/";
      router.push(targetUrl);
    } catch {
      router.push("/?apply=true");
    }
  };

  return (
    <button type="button" onClick={handleClick} className={className}>
      <ArrowLeft className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}
