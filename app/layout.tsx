import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  themeColor: "#040711",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://kelvinokoro.com"),
  title: "Grow with Kelvin Okoro | Weekend Mentorship with Java",
  description:
    "Online weekend mentorship with Kelvin Okoro. Get the best foundations and fundamentals in coding, gain crystal-clear direction, and find the inspiration to keep growing in tech.",
  keywords: [
    "Kelvin Okoro",
    "Java Mentorship",
    "Weekend Coding Mentorship",
    "Software Engineering Mentorship",
    "Spring Boot Mentorship",
    "Backend Engineering Coach",
  ],
  authors: [{ name: "Kelvin Okoro" }],
  openGraph: {
    title: "Grow with Kelvin Okoro | Weekend Mentorship with Java",
    description:
      "Online weekend mentorship with Kelvin Okoro. Get the best foundations and fundamentals in coding, gain crystal-clear direction, and find the inspiration to keep growing in tech.",
    type: "website",
    images: [
      {
        url: "/images/kelvin.jpg",
        width: 1200,
        height: 1200,
        alt: "Kelvin Okoro - Software Engineer & Mentor",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Grow with Kelvin Okoro | Weekend Mentorship with Java",
    description:
      "Online weekend mentorship with Kelvin Okoro. Get the best foundations and fundamentals in coding, gain crystal-clear direction, and find the inspiration to keep growing in tech.",
    images: ["/images/kelvin.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOccupationalProgram",
  name: "Grow with Kelvin Okoro. Weekend Mentorship with Java",
  description:
    "Online weekend mentorship with Kelvin Okoro. Get the best foundations and fundamentals in coding, gain crystal-clear direction, and find the inspiration to keep growing in tech.",
  provider: {
    "@type": "Person",
    name: "Kelvin Okoro",
    jobTitle: "Software Engineer & Mentor",
  },
  educationalCredentialAwarded: "Certificate of Completion & Technical Portfolio",
  timeToComplete: "P1M",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-[#040711] text-slate-100 selection:bg-cyan-500 selection:text-slate-950"
      >
        {children}
      </body>
    </html>
  );
}
