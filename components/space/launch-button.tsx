"use client"

import { useEffect, useState, useCallback } from "react"
import { useSounds } from "./sound-engine"

interface LaunchButtonProps {
  onLaunch: () => void
  ready: boolean
}

export function LaunchButton({ onLaunch, ready }: LaunchButtonProps) {
  const [hovered, setHovered] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [launched, setLaunched] = useState(false)
  const sounds = useSounds()

  const handleClick = useCallback(() => {
    if (!ready || countdown !== null || launched) return
    sounds.play("click")
    setCountdown(3)
  }, [ready, countdown, launched, sounds])

  useEffect(() => {
    if (countdown === null) return
    if (countdown === 0) {
      setLaunched(true)
      setTimeout(() => onLaunch(), 200)
      return
    }
    sounds.play("countdown")
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown, onLaunch, sounds])

  return (
    <div className="flex flex-col items-center gap-4">
      {countdown !== null && countdown > 0 && (
        <div className="font-mono text-6xl font-bold text-primary text-glow-strong animate-countdown-pulse">
          {countdown}
        </div>
      )}

      {countdown === 0 && (
        <div className="font-mono text-4xl font-bold text-destructive animate-shake text-glow-strong">
          IGNITION
        </div>
      )}

      {countdown === null && (
        <button
          onClick={handleClick}
          onMouseEnter={() => {
            setHovered(true)
            if (ready) sounds.play("hover")
          }}
          onMouseLeave={() => setHovered(false)}
          disabled={!ready}
          className={`
            relative group cursor-pointer
            px-12 py-4 font-mono text-sm font-bold uppercase tracking-[0.3em]
            transition-all duration-500
            ${
              ready
                ? "text-primary border-primary/50 hover:border-primary hover:text-primary"
                : "text-muted-foreground border-muted-foreground/30 cursor-not-allowed"
            }
            border-2 rounded-sm
            ${hovered && ready ? "box-glow-strong" : "box-glow"}
          `}
          aria-label="Launch Mission"
        >
          <span className="relative z-10">
            {ready ? "LAUNCH MISSION" : "SYSTEMS CHECK..."}
          </span>

          {/* Animated border */}
          {ready && (
            <>
              <span
                className="absolute inset-0 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(0, 200, 220, 0.1), transparent)",
                }}
              />
              <span className="absolute -top-px left-0 h-px w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <span className="absolute -bottom-px left-0 h-px w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            </>
          )}

          {/* Pulsing corners for ready state */}
          {ready && (
            <>
              <span className="absolute top-0 left-0 w-2 h-2 border-l border-t border-primary/60 animate-pulse" />
              <span className="absolute top-0 right-0 w-2 h-2 border-r border-t border-primary/60 animate-pulse" />
              <span className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-primary/60 animate-pulse" />
              <span className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-primary/60 animate-pulse" />
            </>
          )}
        </button>
      )}

      {countdown === null && (
        <span className="font-mono text-[10px] text-muted-foreground/60 uppercase tracking-widest">
          {ready ? "All systems nominal" : "Running diagnostics..."}
        </span>
      )}
    </div>
  )
}
