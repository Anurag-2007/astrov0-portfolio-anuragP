"use client"

import { useRef, useState, useMemo, useCallback } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Starfield } from "./starfield"
import { Sun } from "./sun"
import { Planet } from "./planet"
import { BlackHole } from "./black-hole"
import { Nebula } from "./nebula"
import { AsteroidBelt } from "./asteroid-belt"
import { ShootingStars } from "./shooting-stars"
import { SpaceDust } from "./space-dust"
import { CameraController } from "./camera-controller"
import { PLANETS } from "./planet-data"

interface SpaceSceneProps {
  launched: boolean
  selectedPlanet: string | null
  onSelectPlanet: (id: string | null) => void
}

function SceneContent({ launched, selectedPlanet, onSelectPlanet }: SpaceSceneProps) {
  const timeRef = useRef(0)
  const [time, setTime] = useState(0)

  useFrame((_, delta) => {
    timeRef.current += delta
    setTime(timeRef.current)
  })

  const selectedPlanetPosition = useMemo(() => {
    if (!selectedPlanet) return null
    const planet = PLANETS.find((p) => p.id === selectedPlanet)
    if (!planet) return null
    const angle = time * planet.orbitSpeed
    return {
      x: Math.cos(angle) * planet.orbitRadius,
      z: Math.sin(angle) * planet.orbitRadius,
    }
  }, [selectedPlanet, time])

  const handleSelectPlanet = useCallback(
    (id: string) => {
      onSelectPlanet(selectedPlanet === id ? null : id)
    },
    [selectedPlanet, onSelectPlanet]
  )

  return (
    <>
      <CameraController selectedPlanet={selectedPlanetPosition} launched={launched} />

      {/* Ambient lighting */}
      <ambientLight intensity={0.12} color="#4a6a8a" />

      {/* Enhanced starfield */}
      <Starfield count={7000} />

      {/* Space dust particles */}
      <SpaceDust count={800} />

      {/* Nebula clouds */}
      <Nebula />

      {/* Sun */}
      <Sun />

      {/* All planets */}
      {PLANETS.map((planet) => (
        <Planet
          key={planet.id}
          data={planet}
          isSelected={selectedPlanet === planet.id}
          onSelect={handleSelectPlanet}
          time={time}
        />
      ))}

      {/* Asteroid belt */}
      <AsteroidBelt innerRadius={56} outerRadius={62} count={300} />

      {/* Second distant asteroid belt */}
      <AsteroidBelt innerRadius={80} outerRadius={90} count={200} />

      {/* Shooting stars */}
      <ShootingStars />

      {/* Interactive black hole */}
      <BlackHole />
    </>
  )
}

export function SpaceScene({ launched, selectedPlanet, onSelectPlanet }: SpaceSceneProps) {
  return (
    <div className="fixed inset-0 w-full h-screen">
      <Canvas
        camera={{ position: [0, 40, 60], fov: 60, near: 0.1, far: 3000 }}
        gl={{
          antialias: true,
          toneMapping: 3,
          toneMappingExposure: 1.4,
        }}
        onPointerMissed={() => onSelectPlanet(null)}
      >
        <color attach="background" args={["#020610"]} />
        <fog attach="fog" args={["#020610", 200, 1200]} />
        <SceneContent
          launched={launched}
          selectedPlanet={selectedPlanet}
          onSelectPlanet={onSelectPlanet}
        />
      </Canvas>
    </div>
  )
}
