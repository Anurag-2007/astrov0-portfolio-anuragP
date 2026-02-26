"use client"

import { useEffect, useState } from "react"
import { PLANETS } from "./planet-data"

interface InfoPanelProps {
  planetId: string
  onClose: () => void
}

export function InfoPanel({ planetId, onClose }: InfoPanelProps) {
  const [visible, setVisible] = useState(false)
  const planet = PLANETS.find(p => p.id === planetId)

  useEffect(() => {
    setTimeout(() => setVisible(true), 50)
  }, [])

  if (!planet) return null

  const handleClose = () => {
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
      <span
        className="w-1 h-1 rounded-full mt-1.5 shrink-0"
        style={{ backgroundColor: color }}
      />
      <span className="font-mono text-xs text-foreground/80 leading-relaxed">
        {text}
      </span>
    </div>
  )
}
