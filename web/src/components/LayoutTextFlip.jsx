import React, { useState, useEffect } from 'react'

function LayoutTextFlip({ text, words, duration = 3000, className = "" }) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [isFlipping, setIsFlipping] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFlipping(true)
      setTimeout(() => {
        setCurrentWordIndex((prev) => (prev + 1) % words.length)
        setIsFlipping(false)
      }, 300) // Animation duration
    }, duration)

    return () => clearInterval(interval)
  }, [words.length, duration])

  return (
    <h1 className={`${className} flex items-center gap-2`}>
      <span>{text}</span>
      <span className="relative inline-block min-w-0 overflow-hidden">
        <span
          className={`inline-block transition-all duration-300 ease-in-out ${
            isFlipping 
              ? 'translate-y-[-100%] opacity-0 transform scale-95' 
              : 'translate-y-0 opacity-100 transform scale-100'
          }`}
          style={{
            background: 'linear-gradient(45deg, #3b82f6, #8b5cf6, #ef4444, #10b981)',
            backgroundSize: '300% 300%',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            animation: 'gradient-shift 4s ease infinite'
          }}
        >
          {words[currentWordIndex]}
        </span>
      </span>
      
      <style jsx>{`
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </h1>
  )
}

export default LayoutTextFlip
