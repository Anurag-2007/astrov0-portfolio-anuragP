"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

export function Nebula() {
  const group1Ref = useRef<THREE.Points>(null)
  const group2Ref = useRef<THREE.Points>(null)

  const [positions1, positions2] = useMemo(() => {
    const createCloud = (centerX: number, centerY: number, centerZ: number, count: number, spread: number) => {
      const pos = new Float32Array(count * 3)
      for (let i = 0; i < count; i++) {
        pos[i * 3] = centerX + (Math.random() - 0.5) * spread
        pos[i * 3 + 1] = centerY + (Math.random() - 0.5) * spread * 0.5
        pos[i * 3 + 2] = centerZ + (Math.random() - 0.5) * spread
      }
      return pos
    }
    return [
      createCloud(-70, 20, -60, 500, 40),
      createCloud(40, -15, -80, 400, 30),
    ]
  }, [])

  useFrame((_, delta) => {
    if (group1Ref.current) group1Ref.current.rotation.y += delta * 0.001
    if (group2Ref.current) group2Ref.current.rotation.y -= delta * 0.0015
  })

  return (
    <>
      <points ref={group1Ref}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={500} array={positions1} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={2} color="#00c8dc" transparent opacity={0.15} depthWrite={false} sizeAttenuation />
      </points>
      <points ref={group2Ref}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={400} array={positions2} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={2.5} color="#ff6600" transparent opacity={0.1} depthWrite={false} sizeAttenuation />
      </points>
    </>
  )
}
