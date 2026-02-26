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
  const [blinkOn, setBlinkOn] = useState(true)
  const sounds = useSounds()

  // Blinking red effect before ready
  useEffect(() => {
    if (ready) return
    const interval = setInterval(() => setBlinkOn((b) => !b), 600)
    return () => clearInterval(interval)
  }, [ready])

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
    <div className="flex flex-col items-center gap-3 md:gap-4">
      {countdown !== null && countdown > 0 && (
        <div className="font-mono text-4xl md:text-6xl font-bold text-primary text-glow-strong animate-countdown-pulse">
          {countdown}
        </div>
      )}

      {countdown === 0 && (
        <div className="font-mono text-3xl md:text-4xl font-bold text-destructive animate-shake text-glow-strong">
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
            px-6 py-3 md:px-12 md:py-4 font-mono text-xs md:text-sm font-bold uppercase tracking-[0.2em] md:tracking-[0.3em]
            transition-all duration-500
            border-2 rounded-sm
            ${
              ready
                ? `text-primary border-primary/50 hover:border-primary hover:text-primary ${hovered ? "box-glow-strong" : "box-glow"}`
                : "cursor-not-allowed"
            }
          `}
          style={
            !ready
              ? {
                  color: blinkOn ? "#ff3333" : "#661111",
                  borderColor: blinkOn ? "rgba(255,51,51,0.6)" : "rgba(255,51,51,0.15)",
                  boxShadow: blinkOn
                    ? "0 0 20px rgba(255,51,51,0.4), 0 0 40px rgba(255,51,51,0.2), inset 0 0 15px rgba(255,51,51,0.1)"
                    : "0 0 5px rgba(255,51,51,0.1)",
                  transition: "all 0.3s ease",
                }
              : undefined
          }
          aria-label="Launch Mission"
        >
          <span className="relative z-10">
            {ready ? "LAUNCH MISSION" : "SYSTEMS CHECK..."}
          </span>

          {/* Animated border effects */}
          {ready && (
            <>
              <span
                className="absolute inset-0 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(0, 200, 220, 0.1), transparent)",
                }}
              />
              <span className="absolute -top-px left-0 h-px w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <span className="absolute -bottom-px left-0 h-px w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            </>
          )}

          {/* Pulsing corners */}
          {ready && (
            <>
              <span className="absolute top-0 left-0 w-2 h-2 border-l border-t border-primary/60 animate-pulse" />
              <span className="absolute top-0 right-0 w-2 h-2 border-r border-t border-primary/60 animate-pulse" />
              <span className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-primary/60 animate-pulse" />
              <span className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-primary/60 animate-pulse" />
            </>
          )}

          {/* Red blinking corner dots when not ready */}
          {!ready && (
            <>
              <span
                className="absolute top-0 left-0 w-1.5 h-1.5 rounded-full transition-opacity duration-300"
                style={{ backgroundColor: blinkOn ? "#ff3333" : "transparent", boxShadow: blinkOn ? "0 0 6px #ff3333" : "none" }}
              />
              <span
                className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full transition-opacity duration-300"
                style={{ backgroundColor: blinkOn ? "#ff3333" : "transparent", boxShadow: blinkOn ? "0 0 6px #ff3333" : "none" }}
              />
              <span
                className="absolute bottom-0 left-0 w-1.5 h-1.5 rounded-full transition-opacity duration-300"
                style={{ backgroundColor: blinkOn ? "#ff3333" : "transparent", boxShadow: blinkOn ? "0 0 6px #ff3333" : "none" }}
              />
              <span
                className="absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full transition-opacity duration-300"
                style={{ backgroundColor: blinkOn ? "#ff3333" : "transparent", boxShadow: blinkOn ? "0 0 6px #ff3333" : "none" }}
              />
            </>
          )}
        </button>
      )}

      {countdown === null && (
        <span className="font-mono text-[9px] md:text-[10px] text-muted-foreground/60 uppercase tracking-widest">
          {ready ? "All systems nominal" : "Running diagnostics..."}
        </span>
      )}
    </div>
  )
}
