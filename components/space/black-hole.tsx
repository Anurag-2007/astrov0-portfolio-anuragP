"use client"

import { useRef, useMemo, useState } from "react"
import { useFrame } from "@react-three/fiber"
import { Html } from "@react-three/drei"
import * as THREE from "three"

export function BlackHole() {
  const diskRef = useRef<THREE.Mesh>(null)
  const ring1Ref = useRef<THREE.Mesh>(null)
  const ring2Ref = useRef<THREE.Mesh>(null)
  const particlesRef = useRef<THREE.Points>(null)
  const jetRef = useRef<THREE.Points>(null)
  const [hovered, setHovered] = useState(false)
  const [sucking, setSucking] = useState(false)
  const suckProgress = useRef(0)

  const diskPosition = useMemo(() => new THREE.Vector3(60, 5, -40), [])

  // Accretion disk particles
  const [diskParticles, diskColors] = useMemo(() => {
    const count = 1500
    const pos = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const r = 3 + Math.random() * 6
      const height = (Math.random() - 0.5) * 0.5
      pos[i * 3] = Math.cos(angle) * r
      pos[i * 3 + 1] = height
      pos[i * 3 + 2] = Math.sin(angle) * r
      // Orange to white gradient based on distance
      const t = (r - 3) / 6
      colors[i * 3] = 1
      colors[i * 3 + 1] = 0.3 + t * 0.4
      colors[i * 3 + 2] = t * 0.2
    }
    return [pos, colors]
  }, [])

  // Jet particles (relativistic jets)
  const jetParticles = useMemo(() => {
    const count = 300
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const spread = Math.random() * 0.5
      const height = (Math.random() - 0.5) * 30
      const angle = Math.random() * Math.PI * 2
      pos[i * 3] = Math.cos(angle) * spread
      pos[i * 3 + 1] = height
      pos[i * 3 + 2] = Math.sin(angle) * spread
    }
    return pos
  }, [])

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

    // Rotate accretion particles
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.01
      particlesRef.current.rotation.x = Math.PI / 2.5
      const scale = hovered ? 1.1 : 1
      particlesRef.current.scale.setScalar(scale)
    }

    // Animate jet particles
    if (jetRef.current) {
      jetRef.current.rotation.y += 0.002
      const positions = jetRef.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < positions.length / 3; i++) {
        positions[i * 3 + 1] += (positions[i * 3 + 1] > 0 ? 0.15 : -0.15)
        if (Math.abs(positions[i * 3 + 1]) > 15) {
          positions[i * 3 + 1] = (Math.random() - 0.5) * 2
        }
      }
      jetRef.current.geometry.attributes.position.needsUpdate = true
    }

    // Suck animation
    if (sucking) {
      suckProgress.current = Math.min(1, suckProgress.current + 0.02)
    }
  })

  const handleClick = (e: THREE.Event) => {
    e.stopPropagation()
    setSucking(true)
    suckProgress.current = 0
    setTimeout(() => setSucking(false), 3000)
  }

  return (
    <group position={diskPosition}>
      {/* Core - the black sphere */}
      <mesh
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
        <sphereGeometry args={[2, 64, 64]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Event horizon glow - pulsing */}
      <mesh>
        <sphereGeometry args={[2.1, 64, 64]} />
        <meshBasicMaterial
          color={sucking ? "#ff2200" : "#ff4400"}
          transparent
          opacity={hovered ? 0.25 : 0.1}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Gravitational lensing ring - bright */}
      <mesh>
        <torusGeometry args={[2.15, 0.05, 16, 128]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={hovered ? 0.6 : 0.3}
        />
      </mesh>

      {/* Accretion disk - basic mesh */}
      <mesh ref={diskRef} rotation={[Math.PI / 2.5, 0, 0]}>
        <ringGeometry args={[3, 8, 128]} />
        <meshBasicMaterial
          color="#ff6600"
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Accretion disk particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={1500} array={diskParticles} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={1500} array={diskColors} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial
          size={0.15}
          vertexColors
          transparent
          opacity={0.7}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      {/* Relativistic jets */}
      <points ref={jetRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={300} array={jetParticles} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial
          size={0.1}
          color="#8888ff"
          transparent
          opacity={0.3}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

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

      {/* Suck vortex effect when clicked */}
      {sucking && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, 10 * suckProgress.current + 2, 64]} />
          <meshBasicMaterial
            color="#ff4400"
            transparent
            opacity={0.15 * (1 - suckProgress.current)}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Label on hover */}
      {hovered && (
        <Html center distanceFactor={20} position={[0, 4, 0]} style={{ pointerEvents: "none" }}>
          <div className="glass-panel-bright rounded px-3 py-1.5 whitespace-nowrap">
            <span className="font-mono text-[10px] text-destructive uppercase tracking-[0.3em] font-semibold">
              SINGULARITY
            </span>
            <div className="font-mono text-[8px] text-muted-foreground mt-0.5">
              Click to activate gravitational pull
            </div>
          </div>
        </Html>
      )}

      {/* Dim light */}
      <pointLight
        color={sucking ? "#ff2200" : "#ff4400"}
        intensity={hovered ? 40 : 20}
        distance={50}
        decay={2}
      />
    </group>
  )
}
