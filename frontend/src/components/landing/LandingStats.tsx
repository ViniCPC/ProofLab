import { landingStats } from '@/data/landingStats'

export function LandingStats() {
  return (
    <div className="grid grid-cols-2 gap-2 border-t border-cyan-200/10 p-3 sm:grid-cols-4">
      {landingStats.map((stat) => (
        <div key={stat.id} className="px-2 py-2">
          <p className="font-mono text-lg font-semibold text-slate-50">
            {stat.value}
          </p>
          <p className="mt-1 text-[11px] leading-4 text-slate-400">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  )
}
