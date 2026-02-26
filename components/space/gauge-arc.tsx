"use client"

import { useEffect, useState, useRef } from "react"

interface GaugeArcProps {
  label: string
  value: number
  max: number
  unit?: string
  delay?: number
}

export function GaugeArc({ label, value, max, unit = "%", delay = 0 }: GaugeArcProps) {
  const [currentValue, setCurrentValue] = useState(0)
  const [visible, setVisible] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true)
      const duration = 1500
      const startTime = Date.now()
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setCurrentValue(Math.round(value * eased))
        if (progress < 1) requestAnimationFrame(animate)
      }
      animate()
    }, delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = 100 * dpr
    canvas.height = 60 * dpr
    ctx.scale(dpr, dpr)

    const centerX = 50
    const centerY = 52
    const radius = 38

    ctx.clearRect(0, 0, 100, 60)

    // Background arc
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, Math.PI, 0)
    ctx.strokeStyle = "rgba(0, 200, 220, 0.1)"
    ctx.lineWidth = 4
    ctx.lineCap = "round"
    ctx.stroke()

    // Value arc
    const progress = currentValue / max
    const endAngle = Math.PI + progress * Math.PI
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, Math.PI, endAngle)
    const gradient = ctx.createLinearGradient(12, 52, 88, 52)
    gradient.addColorStop(0, "rgba(0, 200, 220, 0.6)")
    gradient.addColorStop(1, "rgba(0, 200, 220, 1)")
    ctx.strokeStyle = gradient
    ctx.lineWidth = 4
    ctx.lineCap = "round"
    ctx.stroke()

    // Glow
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, Math.PI, endAngle)
    ctx.strokeStyle = "rgba(0, 200, 220, 0.2)"
    ctx.lineWidth = 8
    ctx.stroke()

    // Tick marks
    for (let i = 0; i <= 10; i++) {
      const angle = Math.PI + (i / 10) * Math.PI
      const innerR = radius - 8
      const outerR = radius - 5
      ctx.beginPath()
      ctx.moveTo(centerX + Math.cos(angle) * innerR, centerY + Math.sin(angle) * innerR)
      ctx.lineTo(centerX + Math.cos(angle) * outerR, centerY + Math.sin(angle) * outerR)
      ctx.strokeStyle = "rgba(0, 200, 220, 0.3)"
      ctx.lineWidth = 1
      ctx.stroke()
    }
  }, [currentValue, max])

  return (
    <div
      className={`flex flex-col items-center gap-1 transition-all duration-700 ${
        visible ? "opacity-100 scale-100" : "opacity-0 scale-90"
      }`}
    >
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-[100px] h-[60px]"
          style={{ imageRendering: "auto" }}
        />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
          <span className="font-mono text-sm font-bold text-primary text-glow">
            {currentValue}
            <span className="text-xs text-muted-foreground">{unit}</span>
          </span>
        </div>
      </div>
      <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
        {label}
      </span>
    </div>
  )
}
