"use client"

import { useRef, useMemo, useState } from "react"
import { useFrame } from "@react-three/fiber"
import { Html } from "@react-three/drei"
import * as THREE from "three"

export interface PlanetData {
  id: string
  name: string
  description: string
  color: string
  emissive: string
  size: number
  orbitRadius: number
  orbitSpeed: number
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
  const [hovered, setHovered] = useState(false)
  const ringRef = useRef<THREE.Mesh>(null)

  const angle = time * data.orbitSpeed
  const x = Math.cos(angle) * data.orbitRadius
  const z = Math.sin(angle) * data.orbitRadius

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005
      meshRef.current.position.set(x, 0, z)
    }
    if (glowRef.current) {
      glowRef.current.position.set(x, 0, z)
      const scale = hovered || isSelected ? 1.6 : 1.3
      glowRef.current.scale.setScalar(data.size * scale)
    }
    if (ringRef.current) {
      ringRef.current.position.set(x, 0, z)
      ringRef.current.rotation.x = -Math.PI / 2
      ringRef.current.rotation.z = time * 0.5
    }
  })

  const glowColor = useMemo(() => new THREE.Color(data.emissive), [data.emissive])

  return (
    <group>
      {/* Orbit ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[data.orbitRadius - 0.05, data.orbitRadius + 0.05, 128]} />
        <meshBasicMaterial color={data.color} transparent opacity={0.08} side={THREE.DoubleSide} />
      </mesh>

      {/* Planet body */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation()
          onSelect(data.id)
        }}
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
          emissiveIntensity={hovered || isSelected ? 0.6 : 0.2}
          roughness={0.4}
          metalness={0.3}
        />

        {/* Planet label */}
        {(hovered || isSelected) && (
          <Html center distanceFactor={15} style={{ pointerEvents: "none" }}>
            <div className="glass-panel-bright rounded px-3 py-1.5 whitespace-nowrap">
              <span className="font-mono text-[10px] text-primary uppercase tracking-[0.3em] font-semibold">
                {data.name}
              </span>
            </div>
          </Html>
        )}
      </mesh>

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

      {/* Selection ring */}
      {isSelected && (
        <mesh ref={ringRef}>
          <ringGeometry args={[data.size * 1.5, data.size * 1.7, 64]} />
          <meshBasicMaterial
            color={data.color}
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  )
}
