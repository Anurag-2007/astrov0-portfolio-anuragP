"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

export function Sun() {
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const coronaRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002
    }
    if (glowRef.current) {
      const s = 3.5 + Math.sin(state.clock.elapsedTime * 0.5) * 0.2
      glowRef.current.scale.setScalar(s)
    }
    if (coronaRef.current) {
      const s = 5 + Math.sin(state.clock.elapsedTime * 0.3) * 0.5
      coronaRef.current.scale.setScalar(s)
      coronaRef.current.rotation.z += 0.001
    }
  })

  return (
    <group>
      {/* Core */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial
          color="#00c8dc"
          emissive="#00a8bc"
          emissiveIntensity={2}
          roughness={0}
          metalness={0.1}
        />
      </mesh>

      {/* Inner glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#00c8dc"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Outer corona */}
      <mesh ref={coronaRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#006878"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Point light from sun */}
      <pointLight color="#00c8dc" intensity={100} distance={200} decay={2} />
      <pointLight color="#ffffff" intensity={50} distance={100} decay={2} />
    </group>
  )
}
