import { ApplicantRecord, ApplicantStatus } from "./validations/applicantSchema";

export const INITIAL_APPLICANTS: ApplicantRecord[] = [
  {
    id: "app_demo_1",
    fullName: "Alex Rivera",
    email: "alex.rivera@example.com",
    phoneNumber: "+1 415 555 0192",
    profileUrl: "https://github.com/arivera-dev",
    yearsOfExperience: "3-5 years",
    currentRole: "Mid-level Fullstack Engineer",
    primaryStack: "TypeScript, React, Node.js, PostgreSQL",
    targetOutcome: "Level up to Senior Engineer and master distributed system architectures",
    bottleneck: "Lacking confidence in high-scale system design and large codebase refactoring",
    weeklyHours: "10-15 hrs/week",
    whyYou: "I have shipped multiple MVPs but hit a plateau at my current company. I want Kelvin's direct eyes on my PRs and system designs to break into a Tier-1 tech company.",
    status: "shortlisted",
    createdAt: "2026-10-23T10:00:00.000Z",
  },
  {
    id: "app_demo_2",
    fullName: "Chioma Nwosu",
    email: "chioma.n@example.com",
    phoneNumber: "+44 7700 900123",
    profileUrl: "https://linkedin.com/in/chioma-nwosu",
    yearsOfExperience: "5+ years",
    currentRole: "Backend Engineer",
    primaryStack: "Go, Kubernetes, Kafka, gRPC, AWS",
    targetOutcome: "Launch a production high-throughput microservices SaaS within 30 days",
    bottleneck: "Analysis paralysis on infrastructure patterns and developer velocity",
    weeklyHours: "15+ hrs/week",
    whyYou: "I am ready to commit 20+ hours a week. I need someone who has operated at high scale to audit my architecture before we launch to 50k beta users.",
    status: "pending",
    createdAt: "2026-10-24T12:00:00.000Z",
  },
  {
    id: "app_demo_3",
    fullName: "Marcus Chen",
    email: "m.chen@example.org",
    phoneNumber: "+1 212 555 0148",
    profileUrl: "https://github.com/marcuschen-oss",
    yearsOfExperience: "1-3 years",
    currentRole: "Frontend Developer",
    primaryStack: "Next.js, Tailwind CSS, TypeScript, GraphQL",
    targetOutcome: "Transition to Fullstack Engineering and ace Technical Lead screens",
    bottleneck: "Backend database indexing, query optimization, and architectural trade-offs",
    weeklyHours: "10-15 hrs/week",
    whyYou: "I have been following Kelvin's engineering breakdowns. His pragmatic, no-BS approach to shipping software matches exactly the mentor guidance I need.",
    status: "selected",
    createdAt: "2026-10-23T08:00:00.000Z",
  },
  {
    id: "app_demo_4",
    fullName: "Devon Bailey",
    email: "devon.b@example.net",
    phoneNumber: "+234 803 555 0177",
    profileUrl: "https://github.com/dbailey-codes",
    yearsOfExperience: "<1 year",
    currentRole: "Junior Developer",
    primaryStack: "Python, Django, PostgreSQL",
    targetOutcome: "Learn production git workflows and CI/CD pipelines",
    bottleneck: "Troubleshooting complex staging environments and containerization",
    weeklyHours: "5-10 hrs/week",
    whyYou: "I'm looking for guidance on how senior engineers think through code reviews and system reliability.",
    status: "rejected",
    createdAt: "2026-10-22T16:00:00.000Z",
  },
];

const STORAGE_KEY = "kelvin_mentorship_applicants_v2";

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
    "Profile URL",
    "Years of Experience",
    "Current Role",
    "Primary Stack",
    "30-Day Target Outcome",
    "Biggest Bottleneck",
    "Weekly Hours Commitment",
    "Why You Pitch",
    "Review Status",
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
    escapeCSV(app.profileUrl),
    escapeCSV(app.yearsOfExperience),
    escapeCSV(app.currentRole),
    escapeCSV(app.primaryStack),
    escapeCSV(app.targetOutcome),
    escapeCSV(app.bottleneck),
    escapeCSV(app.weeklyHours),
    escapeCSV(app.whyYou),
    escapeCSV(app.status.toUpperCase()),
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
