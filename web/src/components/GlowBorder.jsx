import React from 'react'

export default function GlowBorder({ className = '', children }) {
  return (
    <div className={`relative ${className}`}>
      <div className="pointer-events-none absolute -inset-[1px] rounded-[24px] bg-gradient-to-r from-fuchsia-500 via-sky-400 to-violet-500 blur-[6px] opacity-60"/>
      <div className="relative rounded-[24px] border border-white/50 bg-white/60 backdrop-blur-xl">
        {children}
      </div>
    </div>
  )
}


