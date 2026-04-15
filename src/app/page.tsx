import Image from "next/image";
import { Navbar } from "./components/Navbar";
import { HeroSection } from "./components/HeroSection";
import { TrustBanner } from "./components/TrustBanner";
import { DualModeSection } from "./components/DualModeSection";
import { PricingSection } from "./components/PricingSection";
import { Footer } from "./components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen w-full" style={{ background: "#f8edd6", fontFamily: "var(--font-body)" }}>
      <HeroSection />
      <TrustBanner />
      <DualModeSection />
      <PricingSection />
    </div>
  );
}
