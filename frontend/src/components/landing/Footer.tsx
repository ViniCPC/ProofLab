import { FlaskConical } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Container } from '@/components/ui/Container'
import { landingContent } from '@/content/landing'

export function Footer() {
  const copy = landingContent.footer
  return <footer className="border-t border-slate-800/80 bg-slate-950/50 py-12"><Container><div className="grid gap-10 md:grid-cols-[1.2fr_2fr]"><div><Link to="/" className="inline-flex items-center gap-2 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"><FlaskConical aria-hidden className="size-5 text-cyan-300" /><span className="font-semibold">ProofLab</span></Link><p className="mt-4 max-w-xs text-sm leading-6 text-slate-500">{copy.description}</p><p className="mt-5 text-xs text-orange-200">{copy.disclaimer}</p></div><div className="grid gap-8 sm:grid-cols-3">{copy.columns.map((column) => <div key={column.title}><h3 className="text-sm font-semibold text-white">{column.title}</h3><ul className="mt-4 space-y-3">{column.links.map((link) => <li key={link.label}>{link.href.startsWith('/') || link.href.startsWith('#') ? <a href={link.href} className="text-sm text-slate-500 hover:text-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60">{link.label}</a> : <a href={link.href} target="_blank" rel="noreferrer" className="text-sm text-slate-500 hover:text-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60">{link.label}</a>}</li>)}</ul></div>)}</div></div><div className="mt-10 flex flex-col gap-2 border-t border-slate-800 pt-5 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between"><span>{copy.copyright}</span><span>Solana Devnet</span></div></Container></footer>
}
