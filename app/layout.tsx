import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

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

const THEME_INIT_SCRIPT = `
(function() {
  try {
    var raw = localStorage.getItem('profile-forge-storage');
    if (raw) {
      var parsed = JSON.parse(raw);
      var theme = parsed && parsed.state && parsed.state.theme;
      if (theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        return;
      }
    }
  } catch (e) {}
  document.documentElement.setAttribute('data-theme', 'dark');
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--bg-base)] text-[var(--text-primary)] selection:bg-indigo-500/30 selection:text-indigo-200">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
