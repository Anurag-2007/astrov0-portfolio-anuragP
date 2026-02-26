"use client"

import { useEffect, useState } from "react"

export function DataStream() {
  const [lines, setLines] = useState<string[]>([])

  useEffect(() => {
    const telemetryData = [
      "SYS.CORE > Initializing quantum nav matrix...",
      "NAV.GPS > Calculating orbital trajectory...",
      "COM.LINK > Establishing deep-space relay...",
      "PWR.MAIN > Fusion reactor output: 98.7%",
      "LIFE.SUP > Atmospheric pressure: nominal",
      "PROP.ION > Ion drive calibration complete",
      "NAV.STAR > Star chart database loaded",
      "SYS.DIAG > Running pre-flight diagnostics...",
      "COM.SAT > Satellite uplink confirmed",
      "THERM.SH > Heat shield integrity: 100%",
      "SYS.CORE > Memory allocation: 2.4TB/4TB",
      "NAV.GPS > Delta-v budget: 12.4 km/s",
      "PWR.AUX > Backup power systems: READY",
      "COM.LINK > Encryption protocol: AES-512",
      "PROP.RCS > Reaction control: calibrated",
      "SYS.TIME > Mission clock synchronized",
    ]

    let index = 0
    const interval = setInterval(() => {
      const timestamp = new Date().toISOString().split("T")[1].slice(0, 12)
      const newLine = `[${timestamp}] ${telemetryData[index % telemetryData.length]}`
      setLines(prev => [...prev.slice(-12), newLine])
      index++
    }, 800)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="glass-panel rounded-lg p-3 h-48 overflow-hidden">
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/50">
        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
        <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
          Telemetry Feed
        </span>
      </div>
      <div className="space-y-0.5 font-mono text-[10px] leading-relaxed">
        {lines.map((line, i) => (
          <div
            key={`${line}-${i}`}
            className={`transition-opacity duration-300 ${
              i === lines.length - 1 ? "text-primary" : "text-muted-foreground/60"
            }`}
          >
            {line}
          </div>
        ))}
      </div>
    </div>
  )
}
