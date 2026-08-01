import React from "react";
import Navbar from "@/components/Navbar";
import PromoBanner from "@/components/PromoBanner";
import Hero from "@/components/Hero";
import ToyGallery from "@/components/ToyGallery";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-cloud">
      <Navbar />
      <main>
        <PromoBanner />
        <Hero />
        <ToyGallery />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
}