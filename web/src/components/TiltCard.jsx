import React, { useRef } from 'react'

export default function TiltCard({ className = '', children }) {
  const ref = useRef(null)

  function onMouseMove(e) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const midX = rect.width / 2
    const midY = rect.height / 2
    const rotateX = ((y - midY) / midY) * -8
    const rotateY = ((x - midX) / midX) * 8
    el.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`
  }
  function onMouseLeave() {
    const el = ref.current
    if (el) {
      el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0)'
    }
  }

  return (
    <div className={`transition-transform duration-150 will-change-transform ${className}`} ref={ref} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}>
      {children}
    </div>
  )
}


