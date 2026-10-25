import { ApplicantRecord, ApplicantStatus } from "./validations/applicantSchema";

export const INITIAL_APPLICANTS: ApplicantRecord[] = [];

const STORAGE_KEY = "kelvin_mentorship_applicants_v3";

export function getStoredApplicants(): ApplicantRecord[] {
  if (typeof window === "undefined") {
    return INITIAL_APPLICANTS;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_APPLICANTS));
      return INITIAL_APPLICANTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_APPLICANTS;
  } catch {
    return INITIAL_APPLICANTS;
  }
}

export function isEmailRegistered(email: string): boolean {
  if (typeof window === "undefined" || !email) return false;
  try {
    const current = getStoredApplicants();
    const clean = email.toLowerCase().trim();
    return current.some((a) => a.email.toLowerCase().trim() === clean);
  } catch {
    return false;
  }
}

export function normalizePhone(phone: string): string {
  if (!phone) return "";
  const trimmed = phone.trim();
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  return hasPlus ? `+${digits}` : digits;
}

export function phonesMatch(phoneA: string, phoneB: string): boolean {
  if (!phoneA || !phoneB) return false;
  const normA = normalizePhone(phoneA);
  const normB = normalizePhone(phoneB);
  if (normA && normB && normA === normB) return true;

  const digitsA = phoneA.replace(/\D/g, "");
  const digitsB = phoneB.replace(/\D/g, "");
  if (!digitsA || !digitsB || digitsA.length < 7 || digitsB.length < 7) return false;
  if (digitsA === digitsB) return true;

  if (digitsA.length >= 8 && digitsB.length >= 8) {
    const strippedA = digitsA.replace(/^0+/, "");
    const strippedB = digitsB.replace(/^0+/, "");
    if (strippedA === strippedB) return true;
    if (strippedA.endsWith(strippedB) || strippedB.endsWith(strippedA)) return true;
  }
  return false;
}

export function isPhoneRegistered(phone: string): boolean {
  if (typeof window === "undefined" || !phone) return false;
  try {
    const current = getStoredApplicants();
    const digits = phone.replace(/\D/g, "");
    if (!digits || digits.length < 5) return false;
    return current.some((a) => a.phoneNumber && phonesMatch(a.phoneNumber, phone));
  } catch {
    return false;
  }
}

export function generateReferenceId(): string {
  const digits = Math.floor(10000 + Math.random() * 90000);
  return `KO-JAVA-${digits}`;
}

export function formatDisplayRefId(id: string): string {
  if (!id) return `KO-JAVA-${Math.floor(10000 + Math.random() * 90000)}`;
  if (id.startsWith("KO-JAVA-") || id.startsWith("KO-")) return id;

  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) & 0xffffff;
  }
  const cleanNum = Math.abs(hash % 90000) + 10000;
  return `KO-JAVA-${cleanNum}`;
}

export function saveApplicant(applicant: ApplicantRecord): void {
  if (typeof window === "undefined") return;
  try {
    const current = getStoredApplicants();
    // Prepend new applicant
    const updated = [applicant, ...current.filter((a) => a.id !== applicant.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("applicants_updated", { detail: updated }));
  } catch (e) {
    console.error("Failed to save applicant locally:", e);
  }
}

export function updateApplicantStatus(id: string, status: ApplicantStatus): ApplicantRecord[] {
  if (typeof window === "undefined") return INITIAL_APPLICANTS;
  try {
    const current = getStoredApplicants();
    const updated = current.map((a) => (a.id === id ? { ...a, status } : a));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("applicants_updated", { detail: updated }));
    return updated;
  } catch {
    return INITIAL_APPLICANTS;
  }
}

export function resetApplicantsToDefault(): ApplicantRecord[] {
  if (typeof window === "undefined") return INITIAL_APPLICANTS;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_APPLICANTS));
  window.dispatchEvent(new CustomEvent("applicants_updated", { detail: INITIAL_APPLICANTS }));
  return INITIAL_APPLICANTS;
}

export function exportApplicantsToCSV(applicants: ApplicantRecord[]): void {
  if (typeof window === "undefined" || applicants.length === 0) return;

  const headers = [
    "Applicant ID",
    "Submission Date",
    "Full Name",
    "Email",
    "Phone (WhatsApp)",
    "Has Qualifying Laptop",
    "Coding Level (1-10)",
    "First Target Outcome",
    "Biggest Bottleneck",
    "Why You Pitch",
  ];

  const escapeCSV = (str: string | undefined) => {
    if (!str) return '""';
    const clean = str.replace(/"/g, '""').replace(/(\r\n|\n|\r)/gm, " ");
    return `"${clean}"`;
  };

  const rows = applicants.map((app) => [
    escapeCSV(app.id),
    escapeCSV(new Date(app.createdAt).toLocaleString()),
    escapeCSV(app.fullName),
    escapeCSV(app.email),
    escapeCSV(app.phoneNumber),
    escapeCSV(app.hasLaptop),
    escapeCSV(app.codingLevel ? `${app.codingLevel}/10` : ""),
    escapeCSV(app.targetOutcome),
    escapeCSV(app.bottleneck),
    escapeCSV(app.whyYou),
  ]);

  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `kelvin-mentorship-applicants-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
