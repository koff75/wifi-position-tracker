import React, { useMemo } from 'react'

export default function Meteors({ count = 12 }) {
  const items = useMemo(() => {
    return Array.from({ length: count }).map(() => ({
      top: Math.random() * 100,
      left: Math.random() * 100,
      delay: Math.random() * 6,
      duration: 2 + Math.random() * 3,
    }))
  }, [count])

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {items.map((m, i) => (
        <div key={i} className="meteor" style={{ top: `${m.top}%`, left: `${m.left}%`, animationDelay: `${m.delay}s`, animationDuration: `${m.duration}s` }} />
      ))}
    </div>
  )
}


