import { AudienceSplit } from '@/components/landing/AudienceSplit'
import { CtaBanner } from '@/components/landing/CtaBanner'
import { Faq } from '@/components/landing/Faq'
import { BentoGrid } from '@/components/landing/BentoGrid'
import { Footer } from '@/components/landing/Footer'
import { Hero } from '@/components/landing/Hero'
import { ProblemSolution } from '@/components/landing/ProblemSolution'
import { ProductShowcase } from '@/components/landing/ProductShowcase'
import { StepTimeline } from '@/components/landing/StepTimeline'
import { TrustSection } from '@/components/landing/TrustSection'

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      <Hero />
      <ProblemSolution />
      <StepTimeline />
      <ProductShowcase />
      <BentoGrid />
      <AudienceSplit />
      <TrustSection />
      <Faq />
      <CtaBanner />
      <Footer />
    </div>
  )
}
