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
  title: "Profile Forge — Next-Gen GitHub Profile README Studio & ASCII Engine",
  description:
    "Analyze your real GitHub profile, design with 217+ animated ASCII art pieces, customize Shields.io badges and dynamic widgets, and export GitHub-safe READMEs in seconds.",
  keywords: [
    "GitHub README",
    "ASCII Art",
    "Profile Generator",
    "Developer Portfolio",
    "ascii.rest",
    "Shields.io",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#090a0f] text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
        {children}
      </body>
    </html>
  );
}
