import React from 'react'

export default function Navbar() {
  return (
    <div className="fixed top-2 md:top-4 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-sm md:max-w-none md:w-auto">
      <div className="bg-gradient-to-r from-white/90 to-white/95 backdrop-blur-sm border border-purple-200/60 shadow-lg shadow-purple-500/10 rounded-full px-3 md:px-4 py-2 flex items-center gap-2 md:gap-4">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/>
        <span className="text-xs md:text-sm font-medium tracking-wide text-gray-800 truncate">WiFi Position Tracker</span>
        <span className="hidden md:inline text-xs text-purple-600">Live</span>
      </div>
    </div>
  )
}


