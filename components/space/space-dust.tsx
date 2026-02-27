"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

export function SpaceDust({ count = 800 }) {
  const pointsRef = useRef<THREE.Points>(null)

  const [positions, colors, baseSizes] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const s = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const r = 20 + Math.random() * 140
      const theta = Math.random() * Math.PI * 2
      const phi = (Math.random() - 0.5) * Math.PI * 0.4
      pos[i * 3] = r * Math.cos(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi)
      pos[i * 3 + 2] = r * Math.cos(phi) * Math.sin(theta)

      // Subtle color variety - mostly dim white with slight tints
      const colorChoice = Math.random()
      if (colorChoice < 0.3) {
        col[i * 3] = 0.4 + Math.random() * 0.2
        col[i * 3 + 1] = 0.7 + Math.random() * 0.2
        col[i * 3 + 2] = 0.8 + Math.random() * 0.2
      } else if (colorChoice < 0.5) {
        col[i * 3] = 0.7 + Math.random() * 0.2
        col[i * 3 + 1] = 0.4 + Math.random() * 0.2
        col[i * 3 + 2] = 0.1
      } else {
        col[i * 3] = 0.6 + Math.random() * 0.2
        col[i * 3 + 1] = 0.6 + Math.random() * 0.2
        col[i * 3 + 2] = 0.7 + Math.random() * 0.2
      }

      // Much smaller sizes to avoid "square" appearance
      s[i] = 0.1 + Math.random() * 0.25
    }

    return [pos, col, s]
  }, [count])

  // Create a soft circle texture for round particles
  const circleTexture = useMemo(() => {
    const size = 32
    const canvas = document.createElement("canvas")
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext("2d")
    if (ctx) {
      const gradient = ctx.createRadialGradient(
        size / 2, size / 2, 0,
        size / 2, size / 2, size / 2
      )
      gradient.addColorStop(0, "rgba(255, 255, 255, 1)")
      gradient.addColorStop(0.3, "rgba(255, 255, 255, 0.8)")
      gradient.addColorStop(0.7, "rgba(255, 255, 255, 0.2)")
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, size, size)
    }
    const texture = new THREE.CanvasTexture(canvas)
    return texture
  }, [])

  useFrame((state) => {
    if (!pointsRef.current) return
    const t = state.clock.elapsedTime
    pointsRef.current.rotation.y = t * 0.002
    pointsRef.current.rotation.x = Math.sin(t * 0.001) * 0.08
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.2}
        map={circleTexture}
        vertexColors
        transparent
        opacity={0.35}
        depthWrite={false}
        sizeAttenuation
        alphaTest={0.01}
      />
    </points>
  )
}
