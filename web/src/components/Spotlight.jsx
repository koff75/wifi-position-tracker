import React from 'react'

export default function Spotlight({ className = '', children }) {
  return (
    <div className={`relative ${className}`}>
      <div className="pointer-events-none absolute -inset-10 -z-10 opacity-70">
        <div className="absolute inset-0 rounded-[32px]" style={{
          background: 'radial-gradient(40% 60% at 30% 30%, rgba(250,250,255,.6), rgba(255,255,255,0) 60%)'
        }} />
      </div>
      {children}
    </div>
  )
}


