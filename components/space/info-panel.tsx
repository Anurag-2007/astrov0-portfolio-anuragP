"use client"

import { useEffect, useState } from "react"
import { PLANETS } from "./planet-data"
import { useSounds } from "./sound-engine"

interface InfoPanelProps {
  planetId: string
  onClose: () => void
}

export function InfoPanel({ planetId, onClose }: InfoPanelProps) {
  const [visible, setVisible] = useState(false)
  const planet = PLANETS.find((p) => p.id === planetId)
  const sounds = useSounds()

  useEffect(() => {
    setTimeout(() => setVisible(true), 50)
    sounds.play("scan")
  }, [sounds])

  if (!planet) return null

  const handleClose = () => {
    sounds.play("whoosh")
    setVisible(false)
    setTimeout(onClose, 300)
  }

  return (
    <div
      className={`fixed right-6 top-1/2 -translate-y-1/2 z-40 w-80 transition-all duration-500 ${
        visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
      }`}
    >
      <div className="glass-panel-bright rounded-lg overflow-hidden">
        {/* Scan line across panel */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute left-0 w-full h-px bg-primary/10 animate-scan-line"
            style={{ animationDuration: "3s" }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: planet.color }}
            />
            <span className="font-mono text-xs text-primary uppercase tracking-[0.2em] font-semibold">
              {planet.content.title}
            </span>
          </div>
          <button
            onClick={handleClose}
            className="font-mono text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            aria-label="Close panel"
          >
            [ESC]
          </button>
        </div>

        {/* Description */}
        <div className="px-4 py-2 border-b border-border/30">
          <span className="font-mono text-[10px] text-muted-foreground/60 uppercase tracking-widest">
            {planet.description}
          </span>
        </div>

        {/* Planet stats bar */}
        <div className="px-4 py-2 border-b border-border/30 flex items-center gap-4">
          <div className="flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-accent" />
            <span className="font-mono text-[9px] text-muted-foreground/50">
              {planet.hasAtmosphere ? "ATM: YES" : "ATM: NO"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-primary" />
            <span className="font-mono text-[9px] text-muted-foreground/50">
              MOONS: {planet.moons || 0}
            </span>
          </div>
          {planet.hasRing && (
            <div className="flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-chart-4" />
              <span className="font-mono text-[9px] text-muted-foreground/50">RINGS: YES</span>
            </div>
          )}
        </div>

        {/* Content items */}
        <div className="px-4 py-3 space-y-2">
          {planet.content.items.map((item, i) => (
            <ContentItem key={item} text={item} index={i} color={planet.color} />
          ))}
        </div>

        {/* Footer telemetry */}
        <div className="px-4 py-2 border-t border-border/30 flex items-center justify-between">
          <span className="font-mono text-[9px] text-muted-foreground/40 uppercase tracking-widest">
            ORBIT: {planet.orbitRadius} AU
          </span>
          <span className="font-mono text-[9px] text-muted-foreground/40 uppercase tracking-widest">
            SIZE: {planet.size} ER
          </span>
        </div>

        {/* Glow edge effect */}
        <div
          className="absolute inset-0 pointer-events-none rounded-lg"
          style={{
            boxShadow: `inset 0 0 30px rgba(${planet.color === "#00c8dc" ? "0,200,220" : planet.color === "#ff6600" ? "255,102,0" : "142,202,230"}, 0.05)`,
          }}
        />
      </div>
    </div>
  )
}

function ContentItem({ text, index, color }: { text: string; index: number; color: string }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100 + index * 80)
    return () => clearTimeout(timer)
  }, [index])

  return (
    <div
      className={`flex items-start gap-2 transition-all duration-400 ${
        visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
      }`}
    >
      <span className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: color }} />
      <span className="font-mono text-xs text-foreground/80 leading-relaxed">{text}</span>
    </div>
  )
}
