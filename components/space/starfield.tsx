"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

// Create a soft circle texture for round stars
function createStarTexture(): THREE.CanvasTexture {
  const size = 64
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")!
  const gradient = ctx.createRadialGradient(
    size / 2, size / 2, 0,
    size / 2, size / 2, size / 2
  )
  gradient.addColorStop(0, "rgba(255, 255, 255, 1)")
  gradient.addColorStop(0.15, "rgba(255, 255, 255, 0.9)")
  gradient.addColorStop(0.4, "rgba(255, 255, 255, 0.4)")
  gradient.addColorStop(0.7, "rgba(255, 255, 255, 0.08)")
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)")
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  return new THREE.CanvasTexture(canvas)
}

export function Starfield({ count = 5000 }) {
  const meshRef = useRef<THREE.Points>(null)

  const starTexture = useMemo(() => createStarTexture(), [])

  const [positions, sizes, colors, baseSizes] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const s = new Float32Array(count)
    const col = new Float32Array(count * 3)
    const base = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const r = 200 + Math.random() * 1200
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)

      base[i] = 0.5 + Math.random() * 2.5
      s[i] = base[i]

      // Star color variety
      const temp = Math.random()
      if (temp < 0.3) {
        col[i * 3] = 0.7 + Math.random() * 0.3
        col[i * 3 + 1] = 0.8 + Math.random() * 0.2
        col[i * 3 + 2] = 1
      } else if (temp < 0.5) {
        col[i * 3] = 1
        col[i * 3 + 1] = 0.9 + Math.random() * 0.1
        col[i * 3 + 2] = 0.6 + Math.random() * 0.2
      } else if (temp < 0.65) {
        col[i * 3] = 1
        col[i * 3 + 1] = 0.4 + Math.random() * 0.2
        col[i * 3 + 2] = 0.2 + Math.random() * 0.2
      } else if (temp < 0.8) {
        col[i * 3] = 0.3 + Math.random() * 0.2
        col[i * 3 + 1] = 0.8 + Math.random() * 0.2
        col[i * 3 + 2] = 0.9 + Math.random() * 0.1
      } else {
        col[i * 3] = 0.9 + Math.random() * 0.1
        col[i * 3 + 1] = 0.9 + Math.random() * 0.1
        col[i * 3 + 2] = 0.9 + Math.random() * 0.1
      }
    }

    return [pos, s, col, base]
  }, [count])

  const twinklePhases = useMemo(() => {
    return new Float32Array(count).map(() => Math.random() * Math.PI * 2)
  }, [count])

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.001
      meshRef.current.rotation.x += delta * 0.0005

      const t = state.clock.elapsedTime
      const sizeAttr = meshRef.current.geometry.attributes.size
      if (sizeAttr) {
        const arr = sizeAttr.array as Float32Array
        for (let i = 0; i < count; i++) {
          const twinkle = Math.sin(t * (1 + (i % 5) * 0.3) + twinklePhases[i])
          arr[i] = baseSizes[i] * (0.6 + twinkle * 0.4)
        }
        sizeAttr.needsUpdate = true
      }
    }
  })

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-size" count={count} array={sizes} itemSize={1} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={1.5}
        map={starTexture}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.9}
        depthWrite={false}
        alphaTest={0.01}
      />
    </points>
  )
}
