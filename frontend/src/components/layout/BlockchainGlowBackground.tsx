export function BlockchainGlowBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <div className="absolute inset-0 bg-[#070b13]" />
      <div
        className="absolute inset-0 opacity-80"
        style={{
          background:
            'linear-gradient(135deg, rgba(34,211,238,0.12), transparent 34%), linear-gradient(225deg, rgba(74,222,128,0.08), transparent 36%), linear-gradient(315deg, rgba(168,85,247,0.1), transparent 42%)',
        }}
      />
      <div
        className="absolute inset-0 opacity-70"
        style={{
          background:
            'linear-gradient(rgba(34,211,238,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.055) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'linear-gradient(to bottom, black 0%, transparent 78%)',
        }}
      />
      <div
        className="absolute inset-0 opacity-35"
        style={{
          background:
            'linear-gradient(115deg, transparent 0 45%, rgba(34,211,238,0.12) 45.15%, transparent 45.4% 100%), linear-gradient(65deg, transparent 0 58%, rgba(74,222,128,0.08) 58.15%, transparent 58.45% 100%)',
          backgroundSize: '460px 460px, 520px 520px',
        }}
      />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/55 to-transparent" />
      <div className="prooflab-scanline absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-cyan-300/10 via-transparent to-transparent" />
    </div>
  )
}
