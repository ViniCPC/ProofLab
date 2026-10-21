import { AudienceSplit } from '@/components/landing/AudienceSplit'
import { Faq } from '@/components/landing/Faq'
import { BentoGrid } from '@/components/landing/BentoGrid'
import { Footer } from '@/components/landing/Footer'
import { Hero } from '@/components/landing/Hero'
import { StepTimeline } from '@/components/landing/StepTimeline'
import { TrustSection } from '@/components/landing/TrustSection'

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      <Hero />
      <StepTimeline />
      <BentoGrid />
      <AudienceSplit />
      <TrustSection />
      <Faq />
      <Footer />
    </div>
  )
}
