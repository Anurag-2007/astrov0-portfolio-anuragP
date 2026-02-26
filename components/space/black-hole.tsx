"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

export function BlackHole() {
  const diskRef = useRef<THREE.Mesh>(null)
  const ring1Ref = useRef<THREE.Mesh>(null)
  const ring2Ref = useRef<THREE.Mesh>(null)

  const diskPosition = useMemo(() => new THREE.Vector3(60, 5, -40), [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (diskRef.current) {
      diskRef.current.rotation.z += 0.008
      diskRef.current.rotation.x = Math.PI / 2.5 + Math.sin(t * 0.2) * 0.05
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z -= 0.003
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z += 0.005
    }
  })

  return (
    <group position={diskPosition}>
      {/* Core - the black sphere */}
      <mesh>
        <sphereGeometry args={[2, 64, 64]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Event horizon glow */}
      <mesh>
        <sphereGeometry args={[2.1, 64, 64]} />
        <meshBasicMaterial
          color="#ff4400"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Accretion disk */}
      <mesh ref={diskRef} rotation={[Math.PI / 2.5, 0, 0]}>
        <ringGeometry args={[3, 8, 128]} />
        <meshBasicMaterial
          color="#ff6600"
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Inner ring 1 */}
      <mesh ref={ring1Ref} rotation={[Math.PI / 2.5, 0.2, 0]}>
        <ringGeometry args={[2.5, 4, 128]} />
        <meshBasicMaterial
          color="#ff8800"
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Inner ring 2 */}
      <mesh ref={ring2Ref} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.2, 3, 128]} />
        <meshBasicMaterial
          color="#ffaa00"
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Gravitational lensing ring */}
      <mesh>
        <ringGeometry args={[2.05, 2.15, 128]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Dim light */}
      <pointLight color="#ff4400" intensity={20} distance={50} decay={2} />
    </group>
  )
}
