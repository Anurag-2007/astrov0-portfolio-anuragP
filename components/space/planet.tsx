"use client"

import { useRef, useMemo, useState, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import { Html } from "@react-three/drei"
import * as THREE from "three"

export interface SkillInfo {
  name: string
  years: number
  confidence: number
  production: boolean
}

export interface PlanetData {
  id: string
  name: string
  description: string
  color: string
  emissive: string
  size: number
  orbitRadius: number
  orbitSpeed: number
  hasRing?: boolean
  ringColor?: string
  hasAtmosphere?: boolean
  atmosphereColor?: string
  moons?: number
  tilt?: number
  isGallery?: boolean
  isSkillsPlanet?: boolean
  skills?: SkillInfo[]
  gallery?: Array<{ title: string; desc: string }>
  content: {
    title: string
    items: string[]
  }
}

interface PlanetProps {
  data: PlanetData
  isSelected: boolean
  onSelect: (id: string) => void
  time: number
}

// Create a procedural planet texture
function createPlanetTexture(baseColor: string, seed: number): THREE.CanvasTexture {
  const size = 256
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")!

  // Parse base color
  const tempCanvas = document.createElement("canvas")
  tempCanvas.width = 1
  tempCanvas.height = 1
  const tempCtx = tempCanvas.getContext("2d")!
  tempCtx.fillStyle = baseColor
  tempCtx.fillRect(0, 0, 1, 1)
  const [r, g, b] = tempCtx.getImageData(0, 0, 1, 1).data

  // Fill base
  ctx.fillStyle = baseColor
  ctx.fillRect(0, 0, size, size)

  // Add noise-like surface detail
  const imageData = ctx.getImageData(0, 0, size, size)
  const data = imageData.data

  // Simple pseudo-random based on seed
  let s = seed
  const rand = () => {
    s = (s * 16807 + 0) % 2147483647
    return (s & 0x7fffffff) / 2147483647
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4
      // Create band-like patterns (latitude lines)
      const lat = Math.sin((y / size) * Math.PI * 3 + seed) * 0.15
      // Create longitude variation
      const lon = Math.sin((x / size) * Math.PI * 5 + seed * 2) * 0.08
      // Add fine noise
      const noise = (rand() - 0.5) * 0.12
      // Combine
      const variation = lat + lon + noise

      data[idx] = Math.max(0, Math.min(255, r + r * variation))
      data[idx + 1] = Math.max(0, Math.min(255, g + g * variation))
      data[idx + 2] = Math.max(0, Math.min(255, b + b * variation))
    }
  }

  ctx.putImageData(imageData, 0, 0)

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  return texture
}

// Create a procedural ring texture with gaps
function createRingTexture(baseColor: string): THREE.CanvasTexture {
  const width = 256
  const height = 1
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")!

  const tempCanvas = document.createElement("canvas")
  tempCanvas.width = 1
  tempCanvas.height = 1
  const tempCtx = tempCanvas.getContext("2d")!
  tempCtx.fillStyle = baseColor
  tempCtx.fillRect(0, 0, 1, 1)
  const [r, g, b] = tempCtx.getImageData(0, 0, 1, 1).data

  const imageData = ctx.createImageData(width, height)
  const data = imageData.data

  for (let x = 0; x < width; x++) {
    const t = x / width
    // Create ring gaps with varying opacity
    const ringPattern =
      Math.sin(t * Math.PI * 12) * 0.3 +
      Math.sin(t * Math.PI * 24) * 0.15 +
      Math.sin(t * Math.PI * 48) * 0.08
    const opacity = Math.max(0, 0.4 + ringPattern) * (1 - t * 0.6)

    const idx = x * 4
    data[idx] = Math.min(255, r + 30)
    data[idx + 1] = Math.min(255, g + 20)
    data[idx + 2] = Math.min(255, b + 10)
    data[idx + 3] = Math.round(opacity * 255)
  }

  ctx.putImageData(imageData, 0, 0)

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  return texture
}

export function Planet({ data, isSelected, onSelect, time }: PlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const atmosphereRef = useRef<THREE.Mesh>(null)
  const atmosphere2Ref = useRef<THREE.Mesh>(null)
  const selectionRingRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const [showSkillPanel, setShowSkillPanel] = useState(false)
  const [hoveredSkillIdx, setHoveredSkillIdx] = useState(-1)

  const angle = time * data.orbitSpeed
  const x = Math.cos(angle) * data.orbitRadius
  const z = Math.sin(angle) * data.orbitRadius
  const tilt = data.tilt ?? 0

  // Procedural texture
  const planetTexture = useMemo(() => {
    return createPlanetTexture(data.color, data.orbitRadius * 1000)
  }, [data.color, data.orbitRadius])

  // Ring texture
  const ringTexture = useMemo(() => {
    if (!data.hasRing) return null
    return createRingTexture(data.ringColor || data.color)
  }, [data.hasRing, data.ringColor, data.color])

  // Moon positions
  const moonData = useMemo(
    () =>
      Array.from({ length: data.moons || 0 }, (_, i) => ({
        distance: data.size * 2.2 + 0.5 + i * 0.8,
        speed: 0.8 + i * 0.3,
        size: 0.08 + Math.random() * 0.12,
        offset: (i * Math.PI * 2) / (data.moons || 1),
        color: "#aaaacc",
        tilt: Math.random() * 0.5,
      })),
    [data.moons, data.size]
  )

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.004
      meshRef.current.position.set(x, 0, z)
    }
    if (glowRef.current) {
      glowRef.current.position.set(x, 0, z)
      const pulse = Math.sin(time * 2) * 0.05
      const scale = hovered || isSelected ? 1.6 + pulse : 1.3 + pulse
      glowRef.current.scale.setScalar(data.size * scale)
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.position.set(x, 0, z)
      const breathe = 1 + Math.sin(time * 1.5) * 0.015
      atmosphereRef.current.scale.setScalar(breathe)
    }
    if (atmosphere2Ref.current) {
      atmosphere2Ref.current.position.set(x, 0, z)
      const breathe = 1 + Math.sin(time * 1.2 + 1) * 0.01
      atmosphere2Ref.current.scale.setScalar(breathe)
    }
    if (selectionRingRef.current) {
      selectionRingRef.current.position.set(x, 0, z)
      selectionRingRef.current.rotation.x = -Math.PI / 2
      selectionRingRef.current.rotation.z = time * 0.5
    }
    if (groupRef.current) {
      groupRef.current.rotation.z = tilt
    }
  })

  const glowColor = useMemo(() => new THREE.Color(data.emissive), [data.emissive])

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation()
    if (data.isSkillsPlanet) {
      setShowSkillPanel((v) => !v)
    }
    onSelect(data.id)
  }

  return (
    <group ref={groupRef}>
      {/* Orbit ring - dashed look */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[data.orbitRadius - 0.04, data.orbitRadius + 0.04, 256]} />
        <meshBasicMaterial
          color={data.color}
          transparent
          opacity={isSelected ? 0.25 : 0.05}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Orbit glow when selected */}
      {isSelected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[data.orbitRadius - 0.15, data.orbitRadius + 0.15, 256]} />
          <meshBasicMaterial
            color={data.color}
            transparent
            opacity={0.06}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Planet body - with procedural texture */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
          document.body.style.cursor = "pointer"
        }}
        onPointerOut={() => {
          setHovered(false)
          document.body.style.cursor = "default"
        }}
      >
        <sphereGeometry args={[data.size, 64, 64]} />
        <meshStandardMaterial
          map={planetTexture}
          emissive={data.emissive}
          emissiveIntensity={hovered || isSelected ? 0.6 : 0.2}
          roughness={0.4}
          metalness={0.15}
          bumpScale={0.02}
        />

        {/* Planet ring system */}
        {data.hasRing && ringTexture && (
          <group rotation={[Math.PI / 2.2, 0.1, 0]}>
            <mesh>
              <ringGeometry args={[data.size * 1.4, data.size * 2.4, 128]} />
              <meshBasicMaterial
                map={ringTexture}
                transparent
                opacity={0.5}
                side={THREE.DoubleSide}
              />
            </mesh>
            {/* Ring shadow / inner detail */}
            <mesh>
              <ringGeometry args={[data.size * 1.15, data.size * 1.4, 64]} />
              <meshBasicMaterial
                color={data.ringColor || data.color}
                transparent
                opacity={0.12}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        )}

        {/* Planet label */}
        {(hovered || isSelected) && (
          <Html center distanceFactor={15} style={{ pointerEvents: "none" }}>
            <div className="glass-panel-bright rounded px-3 py-1.5 whitespace-nowrap">
              <span className="font-mono text-[10px] text-primary uppercase tracking-[0.3em] font-semibold">
                {data.name}
              </span>
              {hovered && !isSelected && (
                <div className="font-mono text-[8px] text-muted-foreground mt-0.5">
                  Click to explore
                </div>
              )}
            </div>
          </Html>
        )}
      </mesh>

      {/* Atmosphere glow - inner */}
      {data.hasAtmosphere && (
        <mesh ref={atmosphereRef}>
          <sphereGeometry args={[data.size * 1.08, 48, 48]} />
          <meshBasicMaterial
            color={data.atmosphereColor || data.color}
            transparent
            opacity={hovered || isSelected ? 0.1 : 0.04}
            side={THREE.BackSide}
          />
        </mesh>
      )}

      {/* Atmosphere glow - outer haze */}
      {data.hasAtmosphere && (
        <mesh ref={atmosphere2Ref}>
          <sphereGeometry args={[data.size * 1.25, 32, 32]} />
          <meshBasicMaterial
            color={data.atmosphereColor || data.color}
            transparent
            opacity={hovered || isSelected ? 0.05 : 0.015}
            side={THREE.BackSide}
          />
        </mesh>
      )}

      {/* Glow effect */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color={glowColor}
          transparent
          opacity={hovered || isSelected ? 0.12 : 0.04}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Moons */}
      {moonData.map((moon, i) => (
        <Moon
          key={`${data.id}-moon-${i}`}
          parentX={x}
          parentZ={z}
          distance={moon.distance}
          speed={moon.speed}
          size={moon.size}
          color={moon.color}
          offset={moon.offset}
          tilt={moon.tilt}
          time={time}
        />
      ))}

      {/* Selection ring */}
      {isSelected && (
        <mesh ref={selectionRingRef}>
          <ringGeometry args={[data.size * 1.5, data.size * 1.65, 64]} />
          <meshBasicMaterial
            color={data.color}
            transparent
            opacity={0.35}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Point light from planet glow */}
      {(hovered || isSelected) && (
        <pointLight
          position={[x, 0, z]}
          color={data.color}
          intensity={isSelected ? 4 : 1.5}
          distance={data.size * 10}
          decay={2}
        />
      )}

      {/* Skill panels */}
      {data.isSkillsPlanet && isSelected && showSkillPanel && data.skills && (
        <Html position={[x + data.size * 3, 2, z]} distanceFactor={15}>
          <div className="pointer-events-auto glass-panel-bright rounded-lg p-3 w-56">
            <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-border/30">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="font-mono text-[9px] text-primary uppercase tracking-[0.2em] font-bold">
                Skill Analysis
              </span>
            </div>
            <div className="space-y-1.5">
              {data.skills.map((skill, i) => (
                <div
                  key={skill.name}
                  className={`p-1.5 rounded transition-all cursor-default ${
                    hoveredSkillIdx === i
                      ? "bg-primary/10 border border-primary/20"
                      : "border border-transparent"
                  }`}
                  onMouseEnter={() => setHoveredSkillIdx(i)}
                  onMouseLeave={() => setHoveredSkillIdx(-1)}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-mono text-[9px] text-foreground/80 font-semibold">{skill.name}</span>
                    <span className="font-mono text-[8px] text-primary">{skill.confidence}%</span>
                  </div>
                  <div className="h-1 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${skill.confidence}%`,
                        background: `linear-gradient(90deg, ${data.color}88, ${data.color})`,
                      }}
                    />
                  </div>
                  {hoveredSkillIdx === i && (
                    <div className="flex items-center gap-3 mt-1 font-mono text-[7px] text-muted-foreground">
                      <span>{skill.years}yr exp</span>
                      <span>{skill.production ? "PROD READY" : "LEARNING"}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Html>
      )}

      {/* Astronaut spaceship landing */}
      {isSelected && (
        <AstronautShip planetX={x} planetZ={z} planetSize={data.size} time={time} />
      )}
    </group>
  )
}

function AstronautShip({ planetX, planetZ, planetSize, time }: {
  planetX: number; planetZ: number; planetSize: number; time: number
}) {
  const groupRef = useRef<THREE.Group>(null)
  const [landProgress, setLandProgress] = useState(0)
  const startTime = useRef(time)

  useEffect(() => {
    startTime.current = time
    setLandProgress(0)
  }, [planetX, planetZ])

  useFrame(() => {
    if (!groupRef.current) return
    const elapsed = time - startTime.current
    const progress = Math.min(1, elapsed * 0.8)
    setLandProgress(progress)

    const ease = 1 - Math.pow(1 - progress, 3)
    const startOff = 8
    const endOff = planetSize + 0.25
    const currentDist = startOff - (startOff - endOff) * ease
    const arcHeight = Math.sin(ease * Math.PI) * 2 * (1 - ease)

    groupRef.current.position.set(
      planetX + currentDist * 0.7,
      arcHeight + endOff * 0.6 * ease,
      planetZ + currentDist * 0.4
    )
    groupRef.current.lookAt(planetX, 0, planetZ)
    groupRef.current.rotation.z = (1 - ease) * 0.3
  })

  return (
    <group ref={groupRef}>
      <mesh>
        <capsuleGeometry args={[0.06, 0.15, 4, 8]} />
        <meshStandardMaterial color="#ccccdd" emissive="#4488aa" emissiveIntensity={0.5} metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.05, 0.06]}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshBasicMaterial color="#00ddff" transparent opacity={0.8} />
      </mesh>
      {landProgress < 0.9 && (
        <mesh position={[0, -0.12, -0.02]}>
          <coneGeometry args={[0.04, 0.15 + (1 - landProgress) * 0.2, 6]} />
          <meshBasicMaterial color="#ff6622" transparent opacity={0.6 * (1 - landProgress)} />
        </mesh>
      )}
      {landProgress < 0.85 && (
        <pointLight position={[0, -0.15, 0]} color="#ff4400" intensity={3 * (1 - landProgress)} distance={2} decay={2} />
      )}
      {landProgress > 0.95 && (
        <mesh position={[0, 0.15, 0]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial color="#00ff88" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  )
}

function Moon({
  parentX,
  parentZ,
  distance,
  speed,
  size,
  color,
  offset,
  tilt,
  time,
}: {
  parentX: number
  parentZ: number
  distance: number
  speed: number
  size: number
  color: string
  offset: number
  tilt: number
  time: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (meshRef.current) {
      const a = time * speed + offset
      meshRef.current.position.set(
        parentX + Math.cos(a) * distance,
        Math.sin(a * 0.5 + tilt) * 0.4,
        parentZ + Math.sin(a) * distance
      )
      meshRef.current.rotation.y += 0.01
    }
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[size, 16, 16]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.15}
        roughness={0.9}
        metalness={0.05}
      />
    </mesh>
  )
}
