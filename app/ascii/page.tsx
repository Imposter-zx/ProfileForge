// app/ascii/page.tsx
"use client";

import React from "react";
import { Navbar } from "@/components/navigation/Navbar";
import { AsciiGallery } from "@/components/ascii/AsciiGallery";

export default function AsciiPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#090a0f] text-slate-100">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        <AsciiGallery />
      </main>
    </div>
  );
}
