"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { StartScreen } from "@/components/space/start-screen"
import { SpaceScene } from "@/components/space/space-scene"
import { HudOverlay } from "@/components/space/hud-overlay"
import { InfoPanel } from "@/components/space/info-panel"
import { SoundProvider, useSounds } from "@/components/space/sound-engine"

function SpacePortfolioInner() {
  const [phase, setPhase] = useState<"start" | "launching" | "space">("start")
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null)
  const [showStart, setShowStart] = useState(true)
  const sounds = useSounds()
  const hasInitSound = useRef(false)

  // Initialize sound on first interaction
  useEffect(() => {
    const initOnInteraction = () => {
      if (!hasInitSound.current) {
        sounds.init()
        hasInitSound.current = true
      }
    }
    window.addEventListener("click", initOnInteraction, { once: true })
    window.addEventListener("keydown", initOnInteraction, { once: true })
    return () => {
      window.removeEventListener("click", initOnInteraction)
      window.removeEventListener("keydown", initOnInteraction)
    }
  }, [sounds])

  const handleLaunch = useCallback(() => {
    setPhase("launching")
    // Wait for start screen to fully fade out before showing space
    setTimeout(() => {
      setPhase("space")
      setShowStart(false)
      sounds.play("warp")
    }, 2600)
  }, [sounds])

  const handleSelectPlanet = useCallback(
    (id: string | null) => {
      if (id && id !== selectedPlanet) {
        sounds.play("planet-select")
      }
      setSelectedPlanet(id)
    },
    [selectedPlanet, sounds]
  )

  // ESC key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedPlanet(null)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <main className="relative w-full h-screen overflow-hidden bg-background">
      {/* 3D Scene - always rendered behind */}
      <SpaceScene
        launched={phase === "space"}
        selectedPlanet={selectedPlanet}
        onSelectPlanet={handleSelectPlanet}
      />

      {/* HUD Overlay */}
      <HudOverlay
        visible={phase === "space"}
        selectedPlanet={selectedPlanet}
        onSelectPlanet={handleSelectPlanet}
      />

      {/* Info Panel for selected planet */}
      {selectedPlanet && phase === "space" && (
        <InfoPanel
          planetId={selectedPlanet}
          onClose={() => setSelectedPlanet(null)}
        />
      )}

      {/* Start Screen - on top, completely removed after transition */}
      {showStart && <StartScreen onLaunch={handleLaunch} />}
    </main>
  )
}

export default function SpacePortfolio() {
  return (
    <SoundProvider>
      <SpacePortfolioInner />
    </SoundProvider>
  )
}
