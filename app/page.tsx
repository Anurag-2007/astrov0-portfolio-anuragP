"use client"

import { useState, useCallback, useEffect } from "react"
import { StartScreen } from "@/components/space/start-screen"
import { SpaceScene } from "@/components/space/space-scene"
import { HudOverlay } from "@/components/space/hud-overlay"
import { InfoPanel } from "@/components/space/info-panel"

export default function SpacePortfolio() {
  const [phase, setPhase] = useState<"start" | "launching" | "space">("start")
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null)

  const handleLaunch = useCallback(() => {
    setPhase("launching")
    setTimeout(() => setPhase("space"), 500)
  }, [])

  const handleSelectPlanet = useCallback((id: string | null) => {
    setSelectedPlanet(id)
  }, [])

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
        launched={phase === "space" || phase === "launching"}
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

      {/* Start Screen - on top */}
      {(phase === "start" || phase === "launching") && (
        <StartScreen onLaunch={handleLaunch} />
      )}
    </main>
  )
}
