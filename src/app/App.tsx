import { useEffect, useRef, useState } from "react";
import { Header } from "./components/Header";
import { HeroSection } from "./components/HeroSection";
import { HowItWorks } from "./components/HowItWorks";
import { InvestmentSection } from "./components/InvestmentSection";
import { Pricing } from "./components/Pricing";
import { TrustSafety } from "./components/TrustSafety";
import { FAQ } from "./components/FAQ";
import { Footer } from "./components/Footer";
import { LazyMount } from "./components/LazyMount";
import { SeoHead } from "./components/SeoHead";
import { RouterProvider } from "react-router";
import { Toaster } from "sonner";
import { router } from "./routes";
import { AuthProvider } from "./context/AuthContext";
import { SupabaseConfigBanner } from "./components/SupabaseConfigBanner";
import { useLandingSectionTransitions } from "./hooks/useLandingSectionTransitions";
import { HOME_SEO } from "./lib/seoPages";

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster richColors position="top-center" />
      <SupabaseConfigBanner />
    </AuthProvider>
  );
}

export function HomePage() {
  const landingRef = useRef<HTMLDivElement>(null);
  const [lazyRevision, setLazyRevision] = useState(0);
  useLandingSectionTransitions(landingRef, true, lazyRevision);

  useEffect(() => {
    const scrollToPricing = () => {
      if (window.location.hash !== "#precos") return;
      document.getElementById("precos")?.scrollIntoView({ behavior: "smooth" });
    };
    scrollToPricing();
    window.setTimeout(scrollToPricing, 150);
  }, []);

  const bumpLazy = () => setLazyRevision((n) => n + 1);

  return (
    <div
      ref={landingRef}
      className="min-h-[100dvh] bg-[var(--wagoo-paper)] text-[var(--wagoo-ink)] antialiased overflow-x-hidden max-w-[100vw]"
    >
      <SeoHead
        meta={HOME_SEO}
        jsonLd={{
          "@type": "SoftwareApplication",
          name: "Wagoo",
          description: HOME_SEO.description,
          url: "https://wagobot.com/",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          offers: {
            "@type": "AggregateOffer",
            priceCurrency: "BRL",
            lowPrice: "59",
            highPrice: "259",
            offerCount: "3",
          },
        }}
      />
      <Header />
      <main>
        <HeroSection />
        <HowItWorks />
        <InvestmentSection />
        <LazyMount minHeight={1100} onVisible={bumpLazy}>
          <Pricing />
          <TrustSafety />
          <FAQ />
        </LazyMount>
      </main>
      <Footer />
    </div>
  );
}
