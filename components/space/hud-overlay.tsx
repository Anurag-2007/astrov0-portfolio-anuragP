"use client"

import { useEffect, useState } from "react"
import { PLANETS } from "./planet-data"

interface HudOverlayProps {
  visible: boolean
  selectedPlanet: string | null
  onSelectPlanet: (id: string | null) => void
}

export function HudOverlay({ visible, selectedPlanet, onSelectPlanet }: HudOverlayProps) {
  const [showHud, setShowHud] = useState(false)
  const [missionTime, setMissionTime] = useState(0)
  const [velocity, setVelocity] = useState(7.66)

  useEffect(() => {
    if (!visible) return
    setTimeout(() => setShowHud(true), 1000)
  }, [visible])

  useEffect(() => {
    if (!showHud) return
    const interval = setInterval(() => {
      setMissionTime(prev => prev + 1)
      setVelocity(7.5 + Math.random() * 0.5)
    }, 1000)
    return () => clearInterval(interval)
  }, [showHud])

  if (!visible) return null

  const formatTime = (seconds: number) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, "0")
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0")
    const s = String(seconds % 60).padStart(2, "0")
    return `${h}:${m}:${s}`
  }

  return (
    <div
      className={`fixed inset-0 z-30 pointer-events-none transition-opacity duration-1000 ${
        showHud ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Top HUD bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-3 pointer-events-auto">
        <div className="flex items-center gap-4">
          <div className="glass-panel rounded px-3 py-1.5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="font-mono text-[10px] text-foreground uppercase tracking-widest">
              MISSION ACTIVE
            </span>
          </div>
          <div className="glass-panel rounded px-3 py-1.5">
            <span className="font-mono text-[10px] text-muted-foreground tracking-wider">
              MET: {formatTime(missionTime)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="glass-panel rounded px-3 py-1.5">
            <span className="font-mono text-[10px] text-muted-foreground tracking-wider">
              VEL: {velocity.toFixed(2)} km/s
            </span>
          </div>
          <div className="glass-panel rounded px-3 py-1.5">
            <span className="font-mono text-[10px] text-muted-foreground tracking-wider">
              ALT: 400.2 km
            </span>
          </div>
        </div>
      </div>

      {/* Left nav - planet selector */}
      <nav className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 pointer-events-auto" aria-label="Planet navigation">
        {PLANETS.map(planet => (
          <button
            key={planet.id}
            onClick={() => onSelectPlanet(selectedPlanet === planet.id ? null : planet.id)}
            className={`
              glass-panel rounded px-3 py-2 flex items-center gap-2 transition-all duration-300 cursor-pointer
              hover:border-primary/40
              ${selectedPlanet === planet.id ? "box-glow border-primary/50" : ""}
            `}
            aria-label={`Navigate to ${planet.name}`}
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: planet.color }}
            />
            <span className={`font-mono text-[10px] uppercase tracking-widest ${
              selectedPlanet === planet.id ? "text-primary" : "text-muted-foreground"
            }`}>
              {planet.name}
            </span>
          </button>
        ))}
      </nav>

      {/* Bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-6 px-6 py-3">
        <span className="font-mono text-[9px] text-muted-foreground/30 tracking-widest uppercase">
          Scroll to orbit
        </span>
        <span className="font-mono text-[9px] text-muted-foreground/30">|</span>
        <span className="font-mono text-[9px] text-muted-foreground/30 tracking-widest uppercase">
          Click planet to inspect
        </span>
        <span className="font-mono text-[9px] text-muted-foreground/30">|</span>
        <span className="font-mono text-[9px] text-muted-foreground/30 tracking-widest uppercase">
          ESC to deselect
        </span>
      </div>

      {/* Corner brackets */}
      <div className="absolute top-4 left-4 w-6 h-6 border-l border-t border-primary/20" />
      <div className="absolute top-4 right-4 w-6 h-6 border-r border-t border-primary/20" />
      <div className="absolute bottom-4 left-4 w-6 h-6 border-l border-b border-primary/20" />
      <div className="absolute bottom-4 right-4 w-6 h-6 border-r border-b border-primary/20" />

      {/* Crosshair center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="w-6 h-6 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-1.5 bg-primary/20" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-1.5 bg-primary/20" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-px bg-primary/20" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-px bg-primary/20" />
        </div>
      </div>
    </div>
  )
}
