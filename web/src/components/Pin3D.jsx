import React from 'react'

export default function Pin3D() {
  return (
    <div className="absolute -top-10 right-6 select-none" aria-hidden>
      <div className="relative">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-fuchsia-500 to-sky-400 shadow-lg shadow-fuchsia-500/30" />
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2 h-6 bg-gradient-to-b from-fuchsia-500 to-sky-400 rounded-b-full" />
      </div>
    </div>
  )
}


