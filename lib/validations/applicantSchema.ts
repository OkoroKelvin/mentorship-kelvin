import { z } from "zod";

export const step1Schema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(80, "Full name is too long"),
  email: z
    .string()
    .email("Please provide a valid email address")
    .max(254, "Email address is too long (max 254 characters)"),
  phoneNumber: z
    .string()
    .min(5, "Please enter your WhatsApp-enabled phone number")
    .max(25, "Phone number is too long")
    .regex(/^[\d+]+$/, "Phone number must contain only numbers"),
});

export const step2Schema = z.object({
  targetOutcome: z
    .string()
    .min(10, "Please describe your target outcome in at least 10 characters")
    .max(500, "Target outcome cannot exceed 500 characters"),
  bottleneck: z
    .string()
    .min(10, "Please describe your current bottleneck in at least 10 characters")
    .max(500, "Bottleneck cannot exceed 500 characters"),
});

export const step3Schema = z.object({
  hasLaptop: z
    .string()
    .min(1, "Please confirm if you have a laptop meeting the minimum technical requirements"),
  codingLevel: z
    .string()
    .min(1, "Please select your coding experience level (1-10)"),
  whyYou: z
    .string()
    .min(20, "Please tell us why you are a great fit for this cohort (minimum 20 characters)")
    .max(1500, "Maximum 1500 characters"),
});

export const applicantSchema = step1Schema.merge(step2Schema).merge(step3Schema);

export type ApplicantFormData = z.infer<typeof applicantSchema>;
export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;

export type ApplicantStatus = "pending" | "shortlisted" | "selected" | "rejected";

export interface ApplicantRecord extends ApplicantFormData {
  id: string;
  createdAt: string;
  status: ApplicantStatus;
  notes?: string;
}

