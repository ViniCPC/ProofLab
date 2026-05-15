import type { LucideIcon } from 'lucide-react'
import { AnimatedStepFlow } from './AnimatedStepFlow'

interface FlowStep {
  icon: LucideIcon
  title: string
  description: string
}

interface HowItWorksSectionProps {
  steps: FlowStep[]
}

export function HowItWorksSection({ steps }: HowItWorksSectionProps) {
  return <AnimatedStepFlow steps={steps} />
}
