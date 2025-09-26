import React from 'react'

export default function AuroraBackground({ children }) {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-black">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -inset-40 opacity-60 blur-3xl" style={{
          background: 'radial-gradient(60% 60% at 50% 50%, rgba(56,189,248,.35) 0%, rgba(147,51,234,.25) 35%, rgba(244,63,94,.25) 70%, transparent 100%)'
        }} />
        <div className="absolute -inset-20 opacity-40 blur-2xl" style={{
          background: 'conic-gradient(from 180deg at 50% 50%, rgba(99,102,241,.3), rgba(16,185,129,.25), rgba(236,72,153,.25), rgba(99,102,241,.3))'
        }} />
      </div>
      {children}
    </div>
  )
}


