import React from 'react'

export default function CometCard({ className = '', children }) {
  return (
    <div className={`relative overflow-hidden rounded-[24px] ${className}`}>
      <div className="pointer-events-none absolute -inset-[1px] rounded-[24px] bg-[radial-gradient(120px_80px_at_10%_10%,rgba(168,85,247,.35),transparent),radial-gradient(120px_80px_at_90%_20%,rgba(56,189,248,.25),transparent),radial-gradient(120px_80px_at_40%_90%,rgba(244,63,94,.25),transparent)]" />
      <div className="relative border border-white/50 bg-white/60 backdrop-blur-xl">
        {children}
      </div>
    </div>
  )
}


