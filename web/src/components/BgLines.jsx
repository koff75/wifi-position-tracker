import React, { useEffect, useRef } from 'react'

export default function BackgroundLines() {
  const ref = useRef(null)
  useEffect(() => {
    let frame
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    function resize() {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    const lines = Array.from({ length: 30 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      len: 120 + Math.random() * 200,
      hue: 180 + Math.random() * 120,
    }))
    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.globalCompositeOperation = 'lighter'
      lines.forEach(l => {
        l.x += l.vx; l.y += l.vy
        if (l.x < -l.len) l.x = canvas.width
        if (l.y < -l.len) l.y = canvas.height
        if (l.x > canvas.width + l.len) l.x = 0
        if (l.y > canvas.height + l.len) l.y = 0
        const grad = ctx.createLinearGradient(l.x, l.y, l.x + l.len, l.y + l.len)
        grad.addColorStop(0, `hsla(${l.hue}, 100%, 60%, .25)`)
        grad.addColorStop(1, `hsla(${(l.hue+80)%360}, 100%, 60%, .2)`)
        ctx.strokeStyle = grad
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(l.x, l.y)
        ctx.lineTo(l.x + l.len, l.y + l.len)
        ctx.stroke()
      })
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    window.addEventListener('resize', resize)
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={ref} className="pointer-events-none absolute inset-0 -z-10 opacity-40" />
}


