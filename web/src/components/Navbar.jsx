import React from 'react'

export default function Navbar() {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
      <div className="backdrop-blur-xl bg-white/50 dark:bg-black/40 border border-white/60 dark:border-white/10 shadow-lg shadow-black/10 rounded-full px-4 py-2 flex items-center gap-4">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/>
        <span className="text-sm font-medium tracking-wide">WiFi Position Tracker</span>
        <span className="text-xs text-neutral-600">Futuristic UI</span>
      </div>
    </div>
  )
}


