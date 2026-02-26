"use client"

import { useEffect, useState } from "react"

interface SystemStatusProps {
  label: string
  status: string
  delay?: number
  color?: "cyan" | "green" | "amber"
}

export function SystemStatus({ label, status, delay = 0, color = "cyan" }: SystemStatusProps) {
  const [visible, setVisible] = useState(false)
  const [statusText, setStatusText] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true)
      let i = 0
      const interval = setInterval(() => {
        setStatusText(status.slice(0, i + 1))
        i++
        if (i >= status.length) clearInterval(interval)
      }, 30)
      return () => clearInterval(interval)
    }, delay)
    return () => clearTimeout(timer)
  }, [status, delay])

  const colorMap = {
    cyan: "text-primary",
    green: "text-accent",
    amber: "text-chart-4",
  }

  const dotColorMap = {
    cyan: "bg-primary",
    green: "bg-accent",
    amber: "bg-chart-4",
  }

  return (
    <div
      className={`flex items-center justify-between py-2 px-3 border-b border-border/50 transition-all duration-500 ${
        visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className={`w-1.5 h-1.5 rounded-full ${dotColorMap[color]} animate-pulse-glow`} />
        <span className="text-muted-foreground font-mono text-xs uppercase tracking-widest">
          {label}
        </span>
      </div>
      <span className={`font-mono text-xs font-semibold tracking-wider ${colorMap[color]}`}>
        {statusText}
        <span className="animate-pulse-glow">_</span>
      </span>
    </div>
  )
}
