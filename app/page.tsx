import { Header } from "@/components/landing/header"
import { HeroSection } from "@/components/landing/hero-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { HowItWorksSection } from "@/components/landing/how-it-works-section"
import { CTASection } from "@/components/landing/cta-section"
import { Footer } from "@/components/landing/footer"

export default function LandingPage() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Content */}
      <div className="relative z-10">
        <Header />
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <CTASection />
        <Footer />
      </div>
    </main>
  )
}
