import { AudienceSplit } from '@/components/landing/AudienceSplit'
import { CtaBanner } from '@/components/landing/CtaBanner'
import { Faq } from '@/components/landing/Faq'
import { FeatureGrid } from '@/components/landing/FeatureGrid'
import { Footer } from '@/components/landing/Footer'
import { Hero } from '@/components/landing/Hero'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { ProblemSolution } from '@/components/landing/ProblemSolution'
import { StatsStrip } from '@/components/landing/StatsStrip'
import { TechStack } from '@/components/landing/TechStack'
import { TrustSection } from '@/components/landing/TrustSection'
import { useFeaturedProject, useLandingStats } from '@/hooks/useLandingStats'

export default function HomePage() {
  const stats = useLandingStats()
  const featured = useFeaturedProject()

  return <div className="relative overflow-hidden"><Hero {...featured} /><StatsStrip stats={stats.stats} loading={stats.loading} /><ProblemSolution /><HowItWorks /><FeatureGrid /><AudienceSplit /><TrustSection /><TechStack /><Faq /><CtaBanner /><Footer /></div>
}
