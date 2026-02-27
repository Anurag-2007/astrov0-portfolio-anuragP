"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

export function Sun() {
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const coronaRef = useRef<THREE.Mesh>(null)
  const corona2Ref = useRef<THREE.Mesh>(null)
  const corona3Ref = useRef<THREE.Mesh>(null)
  const flareRef = useRef<THREE.Points>(null)
  const innerFlareRef = useRef<THREE.Points>(null)

  // Create sun surface texture
  const sunTexture = useMemo(() => {
    const size = 256
    const canvas = document.createElement("canvas")
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext("2d")!

    // Base cyan-blue color
    ctx.fillStyle = "#00b8cc"
    ctx.fillRect(0, 0, size, size)

    const imageData = ctx.getImageData(0, 0, size, size)
    const data = imageData.data

    let s = 42
    const rand = () => {
      s = (s * 16807 + 0) % 2147483647
      return (s & 0x7fffffff) / 2147483647
    }

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4
        // Solar granulation pattern
        const nx = x / size * 6
        const ny = y / size * 6
        const pattern =
          Math.sin(nx * 3.14 + ny * 2.1) * 0.15 +
          Math.sin(nx * 5.7 + ny * 4.3) * 0.1 +
          (rand() - 0.5) * 0.08

        data[idx] = Math.max(0, Math.min(255, 0 + pattern * 60))
        data[idx + 1] = Math.max(0, Math.min(255, 184 + pattern * 50))
        data[idx + 2] = Math.max(0, Math.min(255, 204 + pattern * 40))
      }
    }

    ctx.putImageData(imageData, 0, 0)
    return new THREE.CanvasTexture(canvas)
  }, [])

  // Solar flare particles
  const flarePositions = useMemo(() => {
    const count = 300
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 2.1 + Math.random() * 2.5
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)
    }
    return pos
  }, [])

  // Inner flare particles (close to surface)
  const innerFlarePositions = useMemo(() => {
    const count = 200
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 2.05 + Math.random() * 0.8
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)
    }
    return pos
  }, [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.0015
      const pulse = 1 + Math.sin(t * 0.8) * 0.015
      meshRef.current.scale.setScalar(pulse)
    }
    if (glowRef.current) {
      const s = 3.5 + Math.sin(t * 0.5) * 0.3
      glowRef.current.scale.setScalar(s)
    }
    if (coronaRef.current) {
      const s = 5 + Math.sin(t * 0.3) * 0.8 + Math.sin(t * 0.7) * 0.3
      coronaRef.current.scale.setScalar(s)
      coronaRef.current.rotation.z += 0.001
    }
    if (corona2Ref.current) {
      const s = 7 + Math.cos(t * 0.2) * 1
      corona2Ref.current.scale.setScalar(s)
      corona2Ref.current.rotation.z -= 0.0005
    }
    if (corona3Ref.current) {
      const s = 9 + Math.sin(t * 0.15) * 1.2
      corona3Ref.current.scale.setScalar(s)
      corona3Ref.current.rotation.z += 0.0003
    }

    // Animate flare particles outward
    if (flareRef.current) {
      const positions = flareRef.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < 300; i++) {
        const idx = i * 3
        const r = Math.sqrt(
          positions[idx] ** 2 + positions[idx + 1] ** 2 + positions[idx + 2] ** 2
        )
        const speed = 0.018
        positions[idx] += (positions[idx] / r) * speed
        positions[idx + 1] += (positions[idx + 1] / r) * speed
        positions[idx + 2] += (positions[idx + 2] / r) * speed

        if (r > 5.5) {
          const theta = Math.random() * Math.PI * 2
          const phi = Math.acos(2 * Math.random() - 1)
          const newR = 2.1 + Math.random() * 0.5
          positions[idx] = newR * Math.sin(phi) * Math.cos(theta)
          positions[idx + 1] = newR * Math.sin(phi) * Math.sin(theta)
          positions[idx + 2] = newR * Math.cos(phi)
        }
      }
      flareRef.current.geometry.attributes.position.needsUpdate = true
    }

    // Inner flare shimmer
    if (innerFlareRef.current) {
      const positions = innerFlareRef.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < 200; i++) {
        const idx = i * 3
        const r = Math.sqrt(
          positions[idx] ** 2 + positions[idx + 1] ** 2 + positions[idx + 2] ** 2
        )
        positions[idx] += (positions[idx] / r) * 0.008
        positions[idx + 1] += (positions[idx + 1] / r) * 0.008
        positions[idx + 2] += (positions[idx + 2] / r) * 0.008

        if (r > 3) {
          const theta = Math.random() * Math.PI * 2
          const phi = Math.acos(2 * Math.random() - 1)
          const newR = 2.05 + Math.random() * 0.3
          positions[idx] = newR * Math.sin(phi) * Math.cos(theta)
          positions[idx + 1] = newR * Math.sin(phi) * Math.sin(theta)
          positions[idx + 2] = newR * Math.cos(phi)
        }
      }
      innerFlareRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <group>
      {/* Core with texture */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial
          map={sunTexture}
          emissive="#00a8bc"
          emissiveIntensity={2.5}
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

      {/* Outer corona 1 */}
      <mesh ref={coronaRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#006878"
          transparent
          opacity={0.06}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Outer corona 2 */}
      <mesh ref={corona2Ref}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#004858"
          transparent
          opacity={0.03}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Outermost corona halo */}
      <mesh ref={corona3Ref}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshBasicMaterial
          color="#003040"
          transparent
          opacity={0.015}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Solar flare particles - outer */}
      <points ref={flareRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={300}
            array={flarePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.25}
          color="#00e8fc"
          transparent
          opacity={0.45}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      {/* Solar flare particles - inner bright */}
      <points ref={innerFlareRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={200}
            array={innerFlarePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.15}
          color="#88ffff"
          transparent
          opacity={0.6}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      {/* Equatorial prominence ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.8, 0.04, 16, 128]} />
        <meshBasicMaterial
          color="#00c8dc"
          transparent
          opacity={0.12}
        />
      </mesh>

      {/* Second prominence ring - tilted */}
      <mesh rotation={[Math.PI / 2.5, 0.3, 0]}>
        <torusGeometry args={[3.2, 0.03, 16, 128]} />
        <meshBasicMaterial
          color="#00a8bc"
          transparent
          opacity={0.06}
        />
      </mesh>

      {/* Point lights from sun */}
      <pointLight color="#00c8dc" intensity={100} distance={200} decay={2} />
      <pointLight color="#ffffff" intensity={50} distance={100} decay={2} />
      <pointLight color="#00a8bc" intensity={30} distance={300} decay={2} />
    </group>
  )
}
