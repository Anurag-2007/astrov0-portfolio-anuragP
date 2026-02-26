"use client"

import { useEffect, useState } from "react"
import { SystemStatus } from "./system-status"
import { GaugeArc } from "./gauge-arc"
import { DataStream } from "./data-stream"
import { LaunchButton } from "./launch-button"

interface StartScreenProps {
  onLaunch: () => void
}

export function StartScreen({ onLaunch }: StartScreenProps) {
  const [ready, setReady] = useState(false)
  const [headerVisible, setHeaderVisible] = useState(false)
  const [launched, setLaunched] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    setTimeout(() => setHeaderVisible(true), 300)
    setTimeout(() => setReady(true), 4000)
  }, [])

  const handleLaunch = () => {
    setLaunched(true)
    setFadeOut(true)
    setTimeout(() => onLaunch(), 2500)
  }

  return (
    <div
      className={`fixed inset-0 z-50 bg-background flex flex-col items-center justify-center transition-all duration-[2000ms] ${
        fadeOut ? "opacity-0 scale-110" : "opacity-100 scale-100"
      } ${launched ? "animate-shake" : ""}`}
      style={{ animationDuration: launched ? "0.15s" : undefined }}
    >
      {/* Scan line effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute left-0 w-full h-px bg-primary/10 animate-scan-line"
          style={{ animationDuration: "6s" }}
        />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,200,220,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,220,1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Corner brackets */}
      <div className="absolute top-6 left-6 w-8 h-8 border-l-2 border-t-2 border-primary/30" />
      <div className="absolute top-6 right-6 w-8 h-8 border-r-2 border-t-2 border-primary/30" />
      <div className="absolute bottom-6 left-6 w-8 h-8 border-l-2 border-b-2 border-primary/30" />
      <div className="absolute bottom-6 right-6 w-8 h-8 border-r-2 border-b-2 border-primary/30" />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
            SYS.ONLINE
          </span>
        </div>
        <div className="font-mono text-[10px] text-muted-foreground/50 tracking-wider">
          <ClockDisplay />
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
            SEC.LVL: ALPHA
          </span>
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-5xl px-6">
        {/* Header */}
        <div
          className={`flex flex-col items-center gap-2 transition-all duration-1000 ${
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary/50" />
            <span className="font-mono text-[10px] text-primary/60 uppercase tracking-[0.5em]">
              Portfolio Division
            </span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary/50" />
          </div>
          <h1 className="font-mono text-4xl md:text-5xl font-bold text-foreground text-glow tracking-[0.2em] text-balance text-center">
            MISSION CONTROL
          </h1>
          <p className="font-mono text-xs text-muted-foreground tracking-[0.3em] uppercase">
            Deep Space Portfolio Navigation System v2.4.1
          </p>
        </div>

        {/* Systems Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          {/* Left: System Status */}
          <div className="glass-panel rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/50">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="font-mono text-[10px] text-primary uppercase tracking-widest font-semibold">
                System Configuration
              </span>
            </div>
            <SystemStatus label="Navigation" status="ONLINE" delay={800} color="green" />
            <SystemStatus label="Life Support" status="NOMINAL" delay={1200} color="green" />
            <SystemStatus label="Comm Array" status="LINK ESTABLISHED" delay={1600} color="cyan" />
            <SystemStatus label="Propulsion" status="READY" delay={2000} color="green" />
            <SystemStatus label="Mission Type" status="PORTFOLIO EXPLORATION" delay={2400} color="amber" />
            <SystemStatus label="Shield Gen" status="ACTIVE" delay={2800} color="green" />
          </div>

          {/* Center: Gauges & Launch */}
          <div className="flex flex-col items-center gap-4">
            <div className="glass-panel rounded-lg p-4 w-full">
              <div className="flex items-center justify-center gap-2 mb-3 pb-2 border-b border-border/50">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="font-mono text-[10px] text-primary uppercase tracking-widest font-semibold">
                  System Diagnostics
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <GaugeArc label="Power" value={98} max={100} delay={1000} />
                <GaugeArc label="Fuel" value={87} max={100} delay={1400} />
                <GaugeArc label="O2" value={100} max={100} delay={1800} />
              </div>
            </div>

            {/* Launch Button */}
            <div className="py-4">
              <LaunchButton onLaunch={handleLaunch} ready={ready} />
            </div>
          </div>

          {/* Right: Data Stream */}
          <div className="flex flex-col gap-4">
            <DataStream />
            <div className="glass-panel rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/50">
                <span className="w-1.5 h-1.5 rounded-full bg-chart-4" />
                <span className="font-mono text-[10px] text-chart-4 uppercase tracking-widest font-semibold">
                  Mission Brief
                </span>
              </div>
              <div className="space-y-1 font-mono text-[10px] text-muted-foreground/70">
                <p>OBJECTIVE: Navigate the stellar portfolio</p>
                <p>SECTORS: Skills / Projects / Experience</p>
                <p>THREAT LEVEL: Minimal</p>
                <p>EST. DURATION: 5-10 min</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom telemetry bar */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-8 px-8 py-4">
        <TelemetryItem label="LAT" value="28.5729" unit="N" />
        <TelemetryItem label="LON" value="-80.6490" unit="W" />
        <TelemetryItem label="ALT" value="142.3" unit="km" />
        <TelemetryItem label="VEL" value="7.66" unit="km/s" />
        <TelemetryItem label="ORBIT" value="LEO" unit="" />
      </div>
    </div>
  )
}

function ClockDisplay() {
  const [time, setTime] = useState("")

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setTime(
        now.toISOString().replace("T", " ").slice(0, 19) + " UTC"
      )
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  return <span>{time}</span>
}

function TelemetryItem({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="font-mono text-[9px] text-muted-foreground/40 uppercase tracking-widest">
        {label}
      </span>
      <span className="font-mono text-xs text-muted-foreground tracking-wider">
        {value}
      </span>
      {unit && (
        <span className="font-mono text-[9px] text-muted-foreground/40">{unit}</span>
      )}
    </div>
  )
}
