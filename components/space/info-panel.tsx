"use client"

import { useEffect, useState, useCallback } from "react"
import { PLANETS } from "./planet-data"
import { useSounds } from "./sound-engine"

interface InfoPanelProps {
  planetId: string
  onClose: () => void
}

export function InfoPanel({ planetId, onClose }: InfoPanelProps) {
  const [visible, setVisible] = useState(false)
  const [galleryIndex, setGalleryIndex] = useState(0)
  const planet = PLANETS.find((p) => p.id === planetId)
  const sounds = useSounds()

  useEffect(() => {
    setTimeout(() => setVisible(true), 50)
    sounds.play("scan")
    setGalleryIndex(0)
  }, [sounds, planetId])

  const handleClose = useCallback(() => {
    sounds.play("whoosh")
    setVisible(false)
    setTimeout(onClose, 300)
  }, [sounds, onClose])

  if (!planet) return null

  const isGallery = planet.isGallery && planet.gallery
  const hasLinks = planet.content.items.some((item) => item.startsWith("link:"))

  return (
    <div
      className={`fixed right-2 md:right-6 top-1/2 -translate-y-1/2 z-40 w-[calc(100vw-16px)] max-w-[340px] transition-all duration-500 ${
        visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
      }`}
    >
      <div className="glass-panel-bright rounded-lg overflow-hidden">
        {/* Scan line across panel */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute left-0 w-full h-px bg-primary/10 animate-scan-line" style={{ animationDuration: "3s" }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-3 md:px-4 py-2 md:py-3 border-b border-border/50">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: planet.color }} />
            <span className="font-mono text-[10px] md:text-xs text-primary uppercase tracking-[0.15em] md:tracking-[0.2em] font-semibold">
              {planet.content.title}
            </span>
          </div>
          <button
            onClick={handleClose}
            className="font-mono text-[10px] md:text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer px-1"
            aria-label="Close panel"
          >
            [ESC]
          </button>
        </div>

        {/* Description */}
        <div className="px-3 md:px-4 py-1.5 md:py-2 border-b border-border/30">
          <span className="font-mono text-[9px] md:text-[10px] text-muted-foreground/60 uppercase tracking-widest">
            {planet.description}
          </span>
        </div>

        {/* Planet stats */}
        <div className="px-3 md:px-4 py-1.5 md:py-2 border-b border-border/30 flex items-center gap-3 md:gap-4 flex-wrap">
          <div className="flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-accent" />
            <span className="font-mono text-[8px] md:text-[9px] text-muted-foreground/50">
              {planet.hasAtmosphere ? "ATM: YES" : "ATM: NO"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-primary" />
            <span className="font-mono text-[8px] md:text-[9px] text-muted-foreground/50">
              {"MOONS: "}{planet.moons || 0}
            </span>
          </div>
          {planet.hasRing && (
            <div className="flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-chart-4" />
              <span className="font-mono text-[8px] md:text-[9px] text-muted-foreground/50">RINGS: YES</span>
            </div>
          )}
        </div>

        {/* Photography Gallery Carousel */}
        {isGallery && planet.gallery && (
          <div className="px-3 md:px-4 py-2 md:py-3 border-b border-border/30">
            <div className="glass-panel rounded-lg p-3 md:p-4 relative overflow-hidden">
              {/* Placeholder image area with generated gradient */}
              <div
                className="w-full h-28 md:h-36 rounded-md mb-2 md:mb-3 flex items-center justify-center relative overflow-hidden"
                style={{
                   backgroundImage: `url(${planet.gallery[galleryIndex].image})`,
                   backgroundSize: "cover",
                   backgroundPosition: "center",
                   backgroundRepeat: "no-repeat",
                }}
              >
                <div className="absolute inset-0 holo-shimmer" />
                <div className="text-center relative z-10">
                  <div className="font-mono text-sm md:text-base font-bold text-foreground text-glow">
                    {planet.gallery[galleryIndex].title}
                  </div>
                  <div className="font-mono text-[9px] md:text-[10px] text-muted-foreground/70 mt-1">
                    {planet.gallery[galleryIndex].desc}
                  </div>
                </div>
                {/* Film grain overlay */}
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZmlsdGVyIGlkPSJmIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjgiLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjZikiIG9wYWNpdHk9Ii40Ii8+PC9zdmc+')",
                }} />
              </div>
              {/* Gallery controls */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    sounds.play("click")
                    setGalleryIndex((i) => (i - 1 + planet.gallery!.length) % planet.gallery!.length)
                  }}
                  className="font-mono text-[10px] text-primary hover:text-foreground transition-colors cursor-pointer px-2 py-1 glass-panel rounded"
                  aria-label="Previous photo"
                >
                  {"<< PREV"}
                </button>
                <span className="font-mono text-[9px] text-muted-foreground/50">
                  {galleryIndex + 1} / {planet.gallery.length}
                </span>
                <button
                  onClick={() => {
                    sounds.play("click")
                    setGalleryIndex((i) => (i + 1) % planet.gallery!.length)
                  }}
                  className="font-mono text-[10px] text-primary hover:text-foreground transition-colors cursor-pointer px-2 py-1 glass-panel rounded"
                  aria-label="Next photo"
                >
                  {"NEXT >>"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content items */}
        <div className="px-3 md:px-4 py-2 md:py-3 space-y-1.5 md:space-y-2 max-h-[240px] overflow-y-auto">
          {planet.content.items.map((item, i) => {
            if (item.startsWith("link:")) {
              const parts = item.split(":")
              const label = parts[1]
              const url = parts.slice(2).join(":")
              return (
                <LinkItem key={item} label={label} url={url} index={i} color={planet.color} />
              )
            }
            return <ContentItem key={item} text={item} index={i} color={planet.color} />
          })}
        </div>

        {/* Footer telemetry */}
        <div className="px-3 md:px-4 py-1.5 md:py-2 border-t border-border/30 flex items-center justify-between">
          <span className="font-mono text-[8px] md:text-[9px] text-muted-foreground/40 uppercase tracking-widest">
            {"ORBIT: "}{planet.orbitRadius}{" AU"}
          </span>
          <span className="font-mono text-[8px] md:text-[9px] text-muted-foreground/40 uppercase tracking-widest">
            {"SIZE: "}{planet.size}{" ER"}
          </span>
        </div>

        {/* Glow edge */}
        <div
          className="absolute inset-0 pointer-events-none rounded-lg"
          style={{
            boxShadow: `inset 0 0 30px ${planet.color}08`,
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
      <span className="font-mono text-[11px] md:text-xs text-foreground/80 leading-relaxed">{text}</span>
    </div>
  )
}

function LinkItem({ label, url, index, color }: { label: string; url: string; index: number; color: string }) {
  const [visible, setVisible] = useState(false)
  const sounds = useSounds()

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100 + index * 80)
    return () => clearTimeout(timer)
  }, [index])

  return (
    <div
      className={`flex items-center gap-2 transition-all duration-400 ${
        visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
      }`}
    >
      <span className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: color }} />
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => sounds.play("click")}
        onMouseEnter={() => sounds.play("hover")}
        className="font-mono text-[11px] md:text-xs text-primary hover:text-foreground transition-colors underline underline-offset-2 decoration-primary/30 hover:decoration-primary cursor-pointer"
      >
        {label}
        <span className="text-muted-foreground/40 ml-1 no-underline text-[9px]">{"[EXT]"}</span>
      </a>
    </div>
  )
}
