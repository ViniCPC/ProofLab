export function BlockchainGlowBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[#070b13]" />
      <div className="absolute -left-1/4 -top-1/4 h-[70vh] w-[70vw] rounded-full bg-cyan-300/[0.09] blur-[120px]" />
      <div className="absolute -right-1/4 top-[10%] h-[60vh] w-[60vw] rounded-full bg-purple-400/[0.08] blur-[140px]" />
      <div className="absolute bottom-[-20%] left-[25%] h-[55vh] w-[55vw] rounded-full bg-green-300/[0.045] blur-[150px]" />
      <div
        className="absolute inset-x-0 top-0 h-[58rem] opacity-40"
        style={{
          backgroundImage:
            'linear-gradient(rgba(34,211,238,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.035) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'linear-gradient(to bottom, black 0%, black 35%, transparent 92%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, black 0%, black 35%, transparent 92%)',
        }}
      />
    </div>
  )
}
