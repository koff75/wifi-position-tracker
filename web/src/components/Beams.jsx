import React from 'react'

export default function BackgroundBeams() {
  return (
    <svg className="pointer-events-none absolute inset-0 -z-10 opacity-40" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 800 600">
      <defs>
        <linearGradient id="beamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.4"/>
          <stop offset="50%" stopColor="#a78bfa" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="#fb7185" stopOpacity="0.4"/>
        </linearGradient>
      </defs>
      {Array.from({ length: 12 }).map((_, i) => (
        <path key={i} d={`M ${-200 + i * 80} -50 L ${200 + i * 80} 650`} stroke="url(#beamGrad)" strokeWidth="1.2" fill="none"/>
      ))}
    </svg>
  )
}


