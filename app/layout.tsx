import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kelvinmentorship.com"),
  title: "1-Month Mentorship with Kelvin | Accelerate Your Engineering Career",
  description:
    "Accelerate 2+ years of software engineering growth in 30 days. Direct 1:1 live sessions, deep architecture & code reviews, async hotline, and tailored career roadmap.",
  keywords: [
    "Software Engineering Mentorship",
    "Senior Engineer Coaching",
    "System Design Mentorship",
    "Architecture Reviews",
    "Code Reviews",
    "Kelvin Okoro",
  ],
  authors: [{ name: "Kelvin Okoro" }],
  openGraph: {
    title: "1-Month Mentorship with Kelvin",
    description:
      "Direct 1:1 mentorship for ambitious software engineers looking to level up their architecture, speed, and career growth.",
    type: "website",
    images: [
      {
        url: "/images/kelvin.jpg",
        width: 1200,
        height: 1200,
        alt: "Kelvin Okoro - Senior Software Engineering Mentor",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "1-Month Mentorship with Kelvin",
    description:
      "Direct 1:1 mentorship for ambitious engineers. 30 days of high-impact coaching and architecture reviews.",
    images: ["/images/kelvin.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-[#040711] text-slate-100 selection:bg-cyan-500 selection:text-slate-950"
      >
        {children}
      </body>
    </html>
  );
}
