import { ArrowRight, ShieldCheck } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { LinkButton } from '@/components/ui/LinkButton'
import { landingContent } from '@/content/landing'
import { ProductShot } from './ProductShot'

export function Hero() {
  const copy = landingContent.hero
  return (
    <section className="relative overflow-hidden pb-16 pt-20 sm:pb-24 sm:pt-28">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[620px] w-[900px] -translate-x-1/2 rounded-full bg-cyan-300/[0.08] blur-3xl" />
      <Container className="relative grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/[0.07] px-3 py-1.5 font-mono text-xs uppercase tracking-[0.16em] text-cyan-200">
            <ShieldCheck aria-hidden className="size-3.5" />
            {copy.eyebrow}
          </div>
          <h1 className="mt-7 max-w-2xl font-display text-5xl font-semibold leading-[0.98] tracking-[-0.04em] text-white sm:text-6xl">
            {copy.title}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-400">
            {copy.description}
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <LinkButton to="/explore" size="lg">
              {copy.primaryCta}
              <ArrowRight aria-hidden className="size-4" />
            </LinkButton>
            <LinkButton to="/create" variant="secondary" size="lg">
              {copy.secondaryCta}
            </LinkButton>
          </div>
        </div>
        <ProductShot className="-rotate-1 transition-transform duration-700 hover:rotate-0 lg:translate-x-4" />
      </Container>
    </section>
  )
}
