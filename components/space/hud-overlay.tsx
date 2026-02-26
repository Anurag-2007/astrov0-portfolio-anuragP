"use client"

import { useEffect, useState } from "react"
import { PLANETS } from "./planet-data"
import { useSounds } from "./sound-engine"

interface HudOverlayProps {
  visible: boolean
  selectedPlanet: string | null
  onSelectPlanet: (id: string | null) => void
}

export function HudOverlay({ visible, selectedPlanet, onSelectPlanet }: HudOverlayProps) {
  const [showHud, setShowHud] = useState(false)
  const [missionTime, setMissionTime] = useState(0)
  const [velocity, setVelocity] = useState(7.66)
  const [altitude, setAltitude] = useState(400.2)
  const [signalStrength, setSignalStrength] = useState(98.2)
  const sounds = useSounds()

  useEffect(() => {
    if (!visible) return
    setTimeout(() => {
      setShowHud(true)
      sounds.play("deep-space")
    }, 1000)
  }, [visible, sounds])

  useEffect(() => {
    if (!showHud) return
    const interval = setInterval(() => {
      setMissionTime((prev) => prev + 1)
      setVelocity(7.5 + Math.random() * 0.5)
      setAltitude(398 + Math.random() * 5)
      setSignalStrength(95 + Math.random() * 5)
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
        <div className="flex items-center gap-3">
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
          <div className="glass-panel rounded px-3 py-1.5">
            <span className="font-mono text-[10px] text-muted-foreground tracking-wider">
              SIG: {signalStrength.toFixed(1)}dB
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="glass-panel rounded px-3 py-1.5">
            <span className="font-mono text-[10px] text-muted-foreground tracking-wider">
              VEL: {velocity.toFixed(2)} km/s
            </span>
          </div>
          <div className="glass-panel rounded px-3 py-1.5">
            <span className="font-mono text-[10px] text-muted-foreground tracking-wider">
              ALT: {altitude.toFixed(1)} km
            </span>
          </div>
          {/* Sound toggle */}
          <button
            onClick={() => {
              sounds.toggleMute()
              sounds.play("click")
            }}
            className="glass-panel rounded px-3 py-1.5 cursor-pointer hover:border-primary/40 transition-colors"
            aria-label={sounds.isMuted ? "Unmute sounds" : "Mute sounds"}
          >
            <span className="font-mono text-[10px] text-muted-foreground tracking-wider">
              SFX: {sounds.isMuted ? "OFF" : "ON"}
            </span>
          </button>
        </div>
      </div>

      {/* Left nav - planet selector */}
      <nav
        className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 pointer-events-auto"
        aria-label="Planet navigation"
      >
        {PLANETS.map((planet) => (
          <button
            key={planet.id}
            onClick={() => {
              sounds.play("click")
              onSelectPlanet(selectedPlanet === planet.id ? null : planet.id)
            }}
            onMouseEnter={() => sounds.play("hover")}
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
            <span
              className={`font-mono text-[10px] uppercase tracking-widest ${
                selectedPlanet === planet.id ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {planet.name}
            </span>
            {selectedPlanet === planet.id && (
              <span className="w-1 h-1 rounded-full bg-primary animate-pulse ml-auto" />
            )}
          </button>
        ))}
      </nav>

      {/* Right mini-map indicator */}
      <div className="absolute right-6 bottom-16 pointer-events-none">
        <div className="glass-panel rounded-lg p-3 w-24 h-24">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="2" fill="rgba(0,200,220,0.8)" />
            {PLANETS.map((p, i) => {
              const r = (p.orbitRadius / 50) * 45
              return (
                <circle
                  key={p.id}
                  cx={50}
                  cy={50}
                  r={r}
                  fill="none"
                  stroke={selectedPlanet === p.id ? p.color : "rgba(0,200,220,0.1)"}
                  strokeWidth={selectedPlanet === p.id ? 1 : 0.3}
                />
              )
            })}
            {/* Black hole marker */}
            <circle cx="80" cy="25" r="2" fill="rgba(255,68,0,0.5)" />
          </svg>
          <div className="text-center mt-1">
            <span className="font-mono text-[7px] text-muted-foreground/40 uppercase tracking-wider">
              System Map
            </span>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-6 px-6 py-3">
        <span className="font-mono text-[9px] text-muted-foreground/30 tracking-widest uppercase">
          Click + Drag to orbit
        </span>
        <span className="font-mono text-[9px] text-muted-foreground/30">|</span>
        <span className="font-mono text-[9px] text-muted-foreground/30 tracking-widest uppercase">
          Scroll to zoom
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
        <div className="w-8 h-8 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-2 bg-primary/15" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-2 bg-primary/15" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-px bg-primary/15" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-px bg-primary/15" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-primary/20" />
        </div>
      </div>

      {/* Scan line effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <div
          className="absolute left-0 w-full h-px bg-primary/5 animate-scan-line"
          style={{ animationDuration: "8s" }}
        />
      </div>
    </div>
  )
}
