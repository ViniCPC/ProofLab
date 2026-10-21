import { FlaskConical } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Container } from '@/components/ui/Container'
import { ExternalLink } from '@/components/ui/ExternalLink'
import { landingContent } from '@/content/landing'

export function Footer() {
  const copy = landingContent.footer
  const cta = landingContent.cta
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/50 py-12">
      <Container>
        <div className="mb-12 flex flex-col gap-7 rounded-3xl border border-cyan-300/20 bg-gradient-to-br from-cyan-300/[0.12] via-slate-950/80 to-purple-300/[0.1] p-8 sm:p-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-300">
              {cta.eyebrow}
            </p>
            <h2 className="mt-4 max-w-xl text-3xl font-semibold text-white sm:text-4xl">
              {cta.title}
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-400">
              {cta.description}
            </p>
          </div>
          <ExternalLink
            href={cta.videoUrl}
            className="w-fit rounded-lg border border-cyan-300/30 bg-cyan-300 px-5 py-3 font-medium text-slate-950 hover:bg-cyan-200"
          >
            {cta.button}
          </ExternalLink>
        </div>
        <div className="grid gap-10 md:grid-cols-[1.2fr_2fr]">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
            >
              <FlaskConical aria-hidden className="size-5 text-cyan-300" />
              <span className="font-semibold">ProofLab</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-slate-500">
              {copy.description}
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {copy.columns.map((column) => (
              <div key={column.title}>
                <h3 className="text-sm font-semibold text-white">{column.title}</h3>
                <ul className="mt-4 space-y-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      {link.href.startsWith('/') || link.href.startsWith('#') ? (
                        <a
                          href={link.href}
                          className="text-sm text-slate-500 hover:text-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-slate-500 hover:text-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
                        >
                          {link.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-slate-800 pt-5 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <span>{copy.copyright}</span>
          <span>{copy.network}</span>
        </div>
      </Container>
    </footer>
  )
}
