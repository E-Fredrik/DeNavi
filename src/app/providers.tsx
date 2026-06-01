"use client";
import React from "react";
import { LanguageProvider } from "@/components/LanguageProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      {children}
    </LanguageProvider>
  );
}

export default Providers;
