import { useEffect } from "react";
import { Header } from "./components/Header";
import { HeroSection } from "./components/HeroSection";
import { HowItWorks } from "./components/HowItWorks";
import { Pricing } from "./components/Pricing";
import { TrustSafety } from "./components/TrustSafety";
import { FAQ } from "./components/FAQ";
import { Footer } from "./components/Footer";
import { RouterProvider } from "react-router";
import { Toaster } from "sonner";
import { router } from "./routes";
import { AuthProvider } from "./context/AuthContext";
import { SupabaseConfigBanner } from "./components/SupabaseConfigBanner";

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
  useEffect(() => {
    const scrollToPricing = () => {
      if (window.location.hash !== "#precos") return;
      document.getElementById("precos")?.scrollIntoView({ behavior: "smooth" });
    };
    scrollToPricing();
    window.setTimeout(scrollToPricing, 150);
  }, []);

  return (
    <div className="min-h-[100dvh] bg-white text-gray-900 antialiased overflow-x-hidden max-w-[100vw]">
      <Header />
      <main>
        <HeroSection />
        <HowItWorks />
        <Pricing />
        <TrustSafety />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
