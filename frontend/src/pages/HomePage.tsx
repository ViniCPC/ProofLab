import { AnimatedStepFlow } from '@/components/layout/AnimatedStepFlow'
import { FeatureGrid } from '@/components/layout/FeatureGrid'
import { HeroSection } from '@/components/layout/HeroSection'
import { ScienceGlobe } from '@/components/landing/ScienceGlobe'
import { homePageContent } from '@/constants/home'

export default function HomePage() {
  const { hero, flow, features } = homePageContent

  return (
    <div className="animate-[fade-in_0.4s_ease-out] space-y-10">
      <HeroSection {...hero} visual={<ScienceGlobe />} />
      <AnimatedStepFlow steps={flow} />
      <FeatureGrid features={features} />
    </div>
  )
}
