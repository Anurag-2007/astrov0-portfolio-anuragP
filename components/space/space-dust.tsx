"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

export function SpaceDust({ count = 600 }) {
  const pointsRef = useRef<THREE.Points>(null)

  const [positions, colors, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const s = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const r = 20 + Math.random() * 120
      const theta = Math.random() * Math.PI * 2
      const phi = (Math.random() - 0.5) * Math.PI * 0.4
      pos[i * 3] = r * Math.cos(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi)
      pos[i * 3 + 2] = r * Math.cos(phi) * Math.sin(theta)

      // Color variety
      const colorChoice = Math.random()
      if (colorChoice < 0.3) {
        // Cyan
        col[i * 3] = 0
        col[i * 3 + 1] = 0.7 + Math.random() * 0.3
        col[i * 3 + 2] = 0.8 + Math.random() * 0.2
      } else if (colorChoice < 0.6) {
        // Orange
        col[i * 3] = 0.8 + Math.random() * 0.2
        col[i * 3 + 1] = 0.3 + Math.random() * 0.3
        col[i * 3 + 2] = 0
      } else {
        // White
        col[i * 3] = 0.7 + Math.random() * 0.3
        col[i * 3 + 1] = 0.7 + Math.random() * 0.3
        col[i * 3 + 2] = 0.8 + Math.random() * 0.2
      }

      s[i] = 0.3 + Math.random() * 0.5
    }

    return [pos, col, s]
  }, [count])

  useFrame((state) => {
    if (!pointsRef.current) return
    const t = state.clock.elapsedTime
    pointsRef.current.rotation.y = t * 0.003
    pointsRef.current.rotation.x = Math.sin(t * 0.001) * 0.1

    // Twinkle effect
    const sizeAttr = pointsRef.current.geometry.attributes.size
    if (sizeAttr) {
      const arr = sizeAttr.array as Float32Array
      for (let i = 0; i < count; i++) {
        arr[i] = sizes[i] * (0.7 + Math.sin(t * 2 + i * 0.1) * 0.3)
      }
      sizeAttr.needsUpdate = true
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
        <bufferAttribute attach="attributes-size" count={count} array={new Float32Array(sizes)} itemSize={1} />
      </bufferGeometry>
      <pointsMaterial
        size={0.4}
        vertexColors
        transparent
        opacity={0.4}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  )
}
