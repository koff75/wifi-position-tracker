import React, { useMemo } from 'react'

export default function Sparkles({ count = 80 }) {
  const points = useMemo(() => {
    const arr = []
    for (let i = 0; i < count; i++) {
      arr.push({
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.random() * 2 + 1,
        delay: Math.random() * 6,
        duration: 4 + Math.random() * 6,
        opacity: 0.4 + Math.random() * 0.6,
      })
    }
    return arr
  }, [count])

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {points.map((p, idx) => (
        <span
          key={idx}
          className="sparkle"
          style={{
            top: `${p.top}%`,
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  )
}


