"use client"

import { useRef, useMemo, useState } from "react"
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
  gallery?: Array<{ title: string; desc: string; image: string }>
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

export function Planet({ data, isSelected, onSelect, time }: PlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const atmosphereRef = useRef<THREE.Mesh>(null)
  const selectionRingRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const [showSkillPanel, setShowSkillPanel] = useState(false)
  const [hoveredSkillIdx, setHoveredSkillIdx] = useState(-1)

  const angle = time * data.orbitSpeed
  const x = Math.cos(angle) * data.orbitRadius
  const z = Math.sin(angle) * data.orbitRadius
  const tilt = data.tilt ?? 0

  // Moon positions
  const moonData = useMemo(
    () =>
      Array.from({ length: data.moons || 0 }, (_, i) => ({
        distance: data.size * 2 + 0.5 + i * 0.8,
        speed: 0.8 + i * 0.3,
        size: 0.1 + Math.random() * 0.15,
        offset: (i * Math.PI * 2) / (data.moons || 1),
        color: "#aaaacc",
      })),
    [data.moons, data.size]
  )

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005
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
      const breathe = 1 + Math.sin(time * 1.5) * 0.02
      atmosphereRef.current.scale.setScalar(breathe)
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

  // Toggle skill panel on select for skills planet
  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation()
    if (data.isSkillsPlanet) {
      setShowSkillPanel((v) => !v)
    }
    onSelect(data.id)
  }

  return (
    <group ref={groupRef}>
      {/* Orbit ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[data.orbitRadius - 0.05, data.orbitRadius + 0.05, 256]} />
        <meshBasicMaterial
          color={data.color}
          transparent
          opacity={isSelected ? 0.2 : 0.06}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Orbit glow when selected */}
      {isSelected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[data.orbitRadius - 0.2, data.orbitRadius + 0.2, 256]} />
          <meshBasicMaterial
            color={data.color}
            transparent
            opacity={0.05}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Planet body */}
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
          color={data.color}
          emissive={data.emissive}
          emissiveIntensity={hovered || isSelected ? 0.8 : 0.3}
          roughness={0.3}
          metalness={0.2}
        />

        {/* Planet ring (like Saturn) */}
        {data.hasRing && (
          <mesh rotation={[Math.PI / 2.2, 0.1, 0]}>
            <ringGeometry args={[data.size * 1.4, data.size * 2.2, 64]} />
            <meshBasicMaterial
              color={data.ringColor || data.color}
              transparent
              opacity={0.35}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}

        {/* Inner ring for ringed planets */}
        {data.hasRing && (
          <mesh rotation={[Math.PI / 2.2, 0.1, 0]}>
            <ringGeometry args={[data.size * 1.2, data.size * 1.4, 64]} />
            <meshBasicMaterial
              color={data.ringColor || data.color}
              transparent
              opacity={0.15}
              side={THREE.DoubleSide}
            />
          </mesh>
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

      {/* Atmosphere glow */}
      {data.hasAtmosphere && (
        <mesh ref={atmosphereRef}>
          <sphereGeometry args={[data.size * 1.15, 32, 32]} />
          <meshBasicMaterial
            color={data.atmosphereColor || data.color}
            transparent
            opacity={hovered || isSelected ? 0.12 : 0.05}
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
          opacity={hovered || isSelected ? 0.15 : 0.05}
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
          time={time}
        />
      ))}

      {/* Selection ring */}
      {isSelected && (
        <mesh ref={selectionRingRef}>
          <ringGeometry args={[data.size * 1.5, data.size * 1.7, 64]} />
          <meshBasicMaterial
            color={data.color}
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Point light from planet glow */}
      {(hovered || isSelected) && (
        <pointLight
          position={[x, 0, z]}
          color={data.color}
          intensity={isSelected ? 5 : 2}
          distance={data.size * 10}
          decay={2}
        />
      )}

      {/* Holographic skill panels - only for skills planet when selected */}
      {data.isSkillsPlanet && isSelected && showSkillPanel && data.skills && (
        <Html
          position={[x + data.size * 3, 2, z]}
          distanceFactor={15}
        >
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
  time,
}: {
  parentX: number
  parentZ: number
  distance: number
  speed: number
  size: number
  color: string
  offset: number
  time: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (meshRef.current) {
      const a = time * speed + offset
      meshRef.current.position.set(
        parentX + Math.cos(a) * distance,
        Math.sin(a * 0.5) * 0.3,
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
        emissiveIntensity={0.2}
        roughness={0.8}
        metalness={0.1}
      />
    </mesh>
  )
}
