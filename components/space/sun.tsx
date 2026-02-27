"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

export function Sun() {
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const coronaRef = useRef<THREE.Mesh>(null)
  const corona2Ref = useRef<THREE.Mesh>(null)
  const flareRef = useRef<THREE.Points>(null)

  // Solar flare particles
  const flarePositions = useMemo(() => {
    const count = 200
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 2 + Math.random() * 2
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)
    }
    return pos
  }, [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002
      // Pulsing size
      const pulse = 1 + Math.sin(t * 0.8) * 0.02
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

    // Animate flare particles
    if (flareRef.current) {
      const positions = flareRef.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < 200; i++) {
        const idx = i * 3
        const r = Math.sqrt(
          positions[idx] ** 2 + positions[idx + 1] ** 2 + positions[idx + 2] ** 2
        )
        // Move outward
        const speed = 0.02
        positions[idx] += (positions[idx] / r) * speed
        positions[idx + 1] += (positions[idx + 1] / r) * speed
        positions[idx + 2] += (positions[idx + 2] / r) * speed

        // Reset when too far
        if (r > 5) {
          const theta = Math.random() * Math.PI * 2
          const phi = Math.acos(2 * Math.random() - 1)
          const newR = 2 + Math.random()
          positions[idx] = newR * Math.sin(phi) * Math.cos(theta)
          positions[idx + 1] = newR * Math.sin(phi) * Math.sin(theta)
          positions[idx + 2] = newR * Math.cos(phi)
        }
      }
      flareRef.current.geometry.attributes.position.needsUpdate = true
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

      {/* Outer corona 2 - wide halo */}
      <mesh ref={corona2Ref}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#004858"
          transparent
          opacity={0.03}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Solar flare particles */}
      <points ref={flareRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={200}
            array={flarePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.3}
          color="#00e8fc"
          transparent
          opacity={0.5}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      {/* Ring detail around sun */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3, 3.1, 128]} />
        <meshBasicMaterial
          color="#00c8dc"
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Point lights from sun */}
      <pointLight color="#00c8dc" intensity={100} distance={200} decay={2} />
      <pointLight color="#ffffff" intensity={50} distance={100} decay={2} />
      <pointLight color="#00a8bc" intensity={30} distance={300} decay={2} />
    </group>
  )
}
