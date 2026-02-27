"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { SystemStatus } from "./system-status"
import { GaugeArc } from "./gauge-arc"
import { DataStream } from "./data-stream"
import { LaunchButton } from "./launch-button"
import { useSounds } from "./sound-engine"

interface StartScreenProps {
  onLaunch: () => void
}

export function StartScreen({ onLaunch }: StartScreenProps) {
  const [ready, setReady] = useState(false)
  const [headerVisible, setHeaderVisible] = useState(false)
  const [launched, setLaunched] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)
  const [radarAngle, setRadarAngle] = useState(0)
  const [waveform, setWaveform] = useState<number[]>(Array(32).fill(0))
  const sounds = useSounds()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    setTimeout(() => setHeaderVisible(true), 300)
    setTimeout(() => {
      setReady(true)
      sounds.play("scan")
    }, 4000)
  }, [sounds])

  // Radar sweep
  useEffect(() => {
    const interval = setInterval(() => {
      setRadarAngle((a) => (a + 2) % 360)
    }, 30)
    return () => clearInterval(interval)
  }, [])

  // Waveform animation
  useEffect(() => {
    const interval = setInterval(() => {
      setWaveform(Array(32).fill(0).map(() => Math.random()))
    }, 100)
    return () => clearInterval(interval)
  }, [])

  // Particle canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animId: number
    const dpr = window.devicePixelRatio || 1
    const resize = () => {
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener("resize", resize)

    const particleList = Array.from({ length: 80 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -0.2 - Math.random() * 0.3,
      size: 0.5 + Math.random() * 1.5,
      opacity: 0.1 + Math.random() * 0.3,
    }))

    const animate = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      particleList.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        if (p.y < -10) {
          p.y = window.innerHeight + 10
          p.x = Math.random() * window.innerWidth
        }
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0, 200, 220, ${p.opacity})`
        ctx.fill()
      })
      animId = requestAnimationFrame(animate)
    }
    animate()
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("resize", resize)
    }
  }, [])

  const handleLaunch = useCallback(() => {
    setLaunched(true)
    setFadeOut(true)
    sounds.play("ignition")
    setTimeout(() => {
      sounds.play("launch")
    }, 500)
    setTimeout(() => onLaunch(), 2500)
  }, [onLaunch, sounds])

  return (
    <div
      className={`fixed inset-0 z-50 bg-background flex flex-col items-center justify-center transition-all duration-[2000ms] ${
        fadeOut ? "opacity-0 scale-110" : "opacity-100 scale-100"
      } ${launched ? "animate-shake" : ""}`}
      style={{ animationDuration: launched ? "0.15s" : undefined }}
    >
      {/* Particle canvas background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ width: "100%", height: "100%" }}
      />

      {/* Scan line effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute left-0 w-full h-px bg-primary/10 animate-scan-line" style={{ animationDuration: "6s" }} />
        <div className="absolute left-0 w-full h-px bg-primary/5 animate-scan-line" style={{ animationDuration: "4s", animationDelay: "2s" }} />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(rgba(0,200,220,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,220,1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Corner brackets */}
      <div className="absolute top-4 left-4 md:top-6 md:left-6 w-6 h-6 md:w-8 md:h-8 border-l-2 border-t-2 border-primary/30" />
      <div className="absolute top-4 right-4 md:top-6 md:right-6 w-6 h-6 md:w-8 md:h-8 border-r-2 border-t-2 border-primary/30" />
      <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 w-6 h-6 md:w-8 md:h-8 border-l-2 border-b-2 border-primary/30" />
      <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 w-6 h-6 md:w-8 md:h-8 border-r-2 border-b-2 border-primary/30" />

      {/* Animated corner lines */}
      <div className="hidden md:block absolute top-6 left-6 w-16 h-px bg-gradient-to-r from-primary/40 to-transparent animate-pulse-glow" />
      <div className="hidden md:block absolute top-6 left-6 w-px h-16 bg-gradient-to-b from-primary/40 to-transparent animate-pulse-glow" />

      {/* Top bar - responsive */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 md:px-8 py-3">
        <div className="flex items-center gap-2 md:gap-3">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="font-mono text-[8px] md:text-[10px] text-muted-foreground uppercase tracking-widest">
            SYS.ONLINE
          </span>
          <div className="hidden md:block h-3 w-px bg-border/50 mx-1" />
          <span className="hidden md:block font-mono text-[10px] text-accent/60 uppercase tracking-widest">
            CORE TEMP: 36.4C
          </span>
        </div>
        <div className="hidden sm:block font-mono text-[10px] text-muted-foreground/50 tracking-wider">
          <ClockDisplay />
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <span className="hidden md:block font-mono text-[10px] text-muted-foreground/60 uppercase tracking-widest">
            MEM: 2.4TB/4TB
          </span>
          <span className="font-mono text-[8px] md:text-[10px] text-muted-foreground uppercase tracking-widest">
            SEC.LVL: ALPHA
          </span>
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
        </div>
      </div>

      {/* Main content - responsive */}
      <div className="relative z-10 flex flex-col items-center gap-4 md:gap-6 w-full max-w-6xl px-3 md:px-6 overflow-y-auto max-h-[calc(100vh-100px)]">
        {/* Header */}
        <div
          className={`flex flex-col items-center gap-1 md:gap-2 transition-all duration-1000 ${
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8"
          }`}
        >
          <div className="flex items-center gap-2 md:gap-4">
            <div className="h-px w-8 md:w-16 bg-gradient-to-r from-transparent to-primary/50" />
            <span className="font-mono text-[8px] md:text-[10px] text-primary/60 uppercase tracking-[0.3em] md:tracking-[0.5em]">
              Portfolio Division
            </span>
            <div className="h-px w-8 md:w-16 bg-gradient-to-l from-transparent to-primary/50" />
          </div>
          <h1 className="font-mono text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground text-glow-strong tracking-[0.15em] md:tracking-[0.2em] text-balance text-center">
            ANURAG's SPACEPORT
          </h1>
          <p className="font-mono text-[9px] md:text-xs text-muted-foreground tracking-[0.2em] md:tracking-[0.3em] uppercase">
            Deep Space Portfolio Navigation System v2.4.1
          </p>
          {/* Subtitle waveform */}
          <div className="flex items-end gap-px h-3 md:h-4 mt-1">
            {waveform.slice(0, 24).map((v, i) => (
              <div
                key={i}
                className="w-[2px] bg-primary/40 rounded-full transition-all duration-100"
                style={{ height: `${4 + v * 12}px` }}
              />
            ))}
          </div>
        </div>

        {/* Systems Panel - responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 w-full">
          {/* Left: System Status */}
          <div className="glass-panel rounded-lg p-3 md:p-4">
            <div className="flex items-center gap-2 mb-2 md:mb-3 pb-2 border-b border-border/50">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="font-mono text-[9px] md:text-[10px] text-primary uppercase tracking-widest font-semibold">
                System Config
              </span>
            </div>
            <SystemStatus label="Navigation" status="ONLINE" delay={800} color="green" />
            <SystemStatus label="Life Support" status="NOMINAL" delay={1200} color="green" />
            <SystemStatus label="Comm Array" status="LINK EST." delay={1600} color="cyan" />
            <SystemStatus label="Propulsion" status="READY" delay={2000} color="green" />
            <SystemStatus label="Mission" status="PORTFOLIO" delay={2400} color="amber" />
            <div className="hidden md:block">
              <SystemStatus label="Shield Gen" status="ACTIVE" delay={2800} color="green" />
              <SystemStatus label="Weapons" status="STANDBY" delay={3200} color="amber" />
            </div>
          </div>

          {/* Radar + orbit - stacked on mobile */}
          <div className="flex flex-col gap-2 md:gap-3">
            <div className="glass-panel rounded-lg p-3 md:p-4">
              <div className="flex items-center gap-2 mb-2 md:mb-3 pb-2 border-b border-border/50">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                <span className="font-mono text-[9px] md:text-[10px] text-accent uppercase tracking-widest font-semibold">
                  Proximity Radar
                </span>
              </div>
              <div className="relative w-full aspect-square max-w-[120px] md:max-w-[160px] mx-auto">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(0,200,220,0.1)" strokeWidth="0.5" />
                  <circle cx="100" cy="100" r="60" fill="none" stroke="rgba(0,200,220,0.1)" strokeWidth="0.5" />
                  <circle cx="100" cy="100" r="30" fill="none" stroke="rgba(0,200,220,0.1)" strokeWidth="0.5" />
                  <line x1="100" y1="10" x2="100" y2="190" stroke="rgba(0,200,220,0.05)" strokeWidth="0.5" />
                  <line x1="10" y1="100" x2="190" y2="100" stroke="rgba(0,200,220,0.05)" strokeWidth="0.5" />
                  <line
                    x1="100" y1="100"
                    x2={100 + Math.cos((radarAngle * Math.PI) / 180) * 90}
                    y2={100 + Math.sin((radarAngle * Math.PI) / 180) * 90}
                    stroke="rgba(0,200,220,0.6)" strokeWidth="1"
                  />
                  <path
                    d={`M100,100 L${100 + Math.cos(((radarAngle - 30) * Math.PI) / 180) * 90},${100 + Math.sin(((radarAngle - 30) * Math.PI) / 180) * 90} A90,90 0 0,1 ${100 + Math.cos((radarAngle * Math.PI) / 180) * 90},${100 + Math.sin((radarAngle * Math.PI) / 180) * 90} Z`}
                    fill="rgba(0,200,220,0.08)"
                  />
                  <circle cx="130" cy="70" r="2" fill="rgba(0,255,136,0.8)" className="animate-pulse" />
                  <circle cx="65" cy="120" r="2" fill="rgba(0,255,136,0.8)" className="animate-pulse" />
                  <circle cx="145" cy="130" r="1.5" fill="rgba(255,102,0,0.8)" className="animate-pulse" />
                  <circle cx="80" cy="55" r="1.5" fill="rgba(0,200,220,0.8)" className="animate-pulse" />
                </svg>
              </div>
            </div>
            {/* Orbit status */}
            <div className="glass-panel rounded-lg p-2 md:p-3">
              <div className="flex items-center gap-2 mb-1 md:mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-chart-4 animate-pulse" />
                <span className="font-mono text-[9px] md:text-[10px] text-chart-4 uppercase tracking-widest font-semibold">
                  Orbit Status
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 font-mono text-[9px] md:text-[10px] text-muted-foreground/70">
                <div className="flex items-center justify-between"><span>Apoapsis</span><span className="text-foreground/70">420.3 km</span></div>
                <div className="flex items-center justify-between"><span>Periapsis</span><span className="text-foreground/70">380.1 km</span></div>
                <div className="flex items-center justify-between"><span>Incline</span><span className="text-foreground/70">51.6 deg</span></div>
                <div className="flex items-center justify-between"><span>Period</span><span className="text-foreground/70">92.4 min</span></div>
              </div>
            </div>
          </div>

          {/* Center: Gauges + Launch */}
          <div className="flex flex-col items-center gap-2 md:gap-3 sm:col-span-2 lg:col-span-1">
            <div className="glass-panel rounded-lg p-3 md:p-4 w-full">
              <div className="flex items-center justify-center gap-2 mb-2 md:mb-3 pb-2 border-b border-border/50">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="font-mono text-[9px] md:text-[10px] text-primary uppercase tracking-widest font-semibold">
                  System Diagnostics
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1 md:gap-2">
                <GaugeArc label="Power" value={98} max={100} delay={1000} />
                <GaugeArc label="Fuel" value={87} max={100} delay={1400} />
                <GaugeArc label="O2" value={100} max={100} delay={1800} />
              </div>
              <div className="grid grid-cols-3 gap-1 md:gap-2 mt-1 md:mt-2">
                <GaugeArc label="CPU" value={42} max={100} delay={2200} />
                <GaugeArc label="Hull" value={100} max={100} delay={2600} />
                <GaugeArc label="Temp" value={36} max={100} delay={3000} unit="C" />
              </div>
            </div>
            <div className="py-1 md:py-2">
              <LaunchButton onLaunch={handleLaunch} ready={ready} />
            </div>
          </div>

          {/* Right: Data Stream + Mission Brief - hidden on small mobile, shown sm+ */}
          <div className="hidden sm:flex flex-col gap-2 md:gap-3 lg:col-span-1 sm:col-span-2 lg:col-span-1">
            <DataStream />
            <div className="glass-panel rounded-lg p-2 md:p-3">
              <div className="flex items-center gap-2 mb-1 md:mb-2 pb-2 border-b border-border/50">
                <span className="w-1.5 h-1.5 rounded-full bg-chart-4" />
                <span className="font-mono text-[9px] md:text-[10px] text-chart-4 uppercase tracking-widest font-semibold">
                  Mission Brief
                </span>
              </div>
              <div className="grid grid-cols-1 gap-0.5 font-mono text-[9px] md:text-[10px] text-muted-foreground/70">
                <p>{"OBJECTIVE: Navigate the stellar portfolio"}</p>
                <p>{"SECTORS: Skills / Projects / Experience"}</p>
                <p>{"THREAT LEVEL: Minimal"}</p>
                <p>{"EST. DURATION: 5-10 min"}</p>
                <p>{"BLACK HOLE: Approach with caution"}</p>
              </div>
            </div>
            {/* Signal analyzer */}
            <div className="glass-panel rounded-lg p-2 md:p-3">
              <div className="flex items-center gap-2 mb-1 md:mb-2 pb-2 border-b border-border/50">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="font-mono text-[9px] md:text-[10px] text-primary uppercase tracking-widest font-semibold">
                  Signal Analyzer
                </span>
              </div>
              <div className="flex items-end gap-px h-6 md:h-8">
                {waveform.map((v, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-sm transition-all duration-75"
                    style={{
                      height: `${10 + v * 90}%`,
                      background: `rgba(0, 200, 220, ${0.3 + v * 0.5})`,
                    }}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="font-mono text-[7px] md:text-[8px] text-muted-foreground/40">20Hz</span>
                <span className="font-mono text-[7px] md:text-[8px] text-muted-foreground/40">20kHz</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom telemetry bar - responsive */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-3 md:gap-8 px-4 md:px-8 py-3 flex-wrap">
        <TelemetryItem label="LAT" value="28.5729" unit="N" />
        <TelemetryItem label="LON" value="-80.6490" unit="W" />
        <TelemetryItem label="ALT" value="142.3" unit="km" />
        <span className="hidden md:inline-flex"><TelemetryItem label="VEL" value="7.66" unit="km/s" /></span>
        <span className="hidden lg:inline-flex"><TelemetryItem label="ORBIT" value="LEO" unit="" /></span>
        <span className="hidden lg:inline-flex"><TelemetryItem label="SIGNAL" value="98.2" unit="dB" /></span>
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
        now.toLocaleString("en-IN", {
          hour12: false,
        })
      )
    }

    update()
    const interval = setInterval(update, 1000)

    return () => clearInterval(interval)
  }, [])

  return <span>{time}</span>
}

export default ClockDisplay

function TelemetryItem({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="flex items-baseline gap-1">
      <span className="font-mono text-[8px] md:text-[9px] text-muted-foreground/40 uppercase tracking-widest">{label}</span>
      <span className="font-mono text-[10px] md:text-xs text-muted-foreground tracking-wider">{value}</span>
      {unit && <span className="font-mono text-[8px] md:text-[9px] text-muted-foreground/40">{unit}</span>}
    </div>
  )
}
