import React from 'react'

export default function GlowingEffect({ className = '', children }) {
  return (
    <div className={`relative ${className}`}>
      <div className="pointer-events-none absolute -inset-[2px] rounded-[22px] glow-animated" />
      <div className="relative rounded-[20px] overflow-hidden border border-white/40 bg-white/60 backdrop-blur-xl">
        {children}
      </div>
    </div>
  )
}


