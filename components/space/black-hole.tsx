"use client"

import { useRef, useMemo, useState, useCallback } from "react"
import { useFrame } from "@react-three/fiber"
import { Html } from "@react-three/drei"
import * as THREE from "three"
import { useSounds } from "./sound-engine"

const ARCHIVE_ENTRIES = [
  { text: "First project that totally failed", lesson: "Learned to scope down" },
  { text: "Shipped a bug to production at 2am", lesson: "Learned CI/CD the hard way" },
  { text: "Rewrote everything from scratch", lesson: "Learned when NOT to rewrite" },
  { text: "Over-engineered a simple form", lesson: "Learned YAGNI principle" },
  { text: "Ignored user feedback for months", lesson: "Learned to listen first, code second" },
  { text: "Biggest mistake I learned from", lesson: "Every failure is a lesson in disguise" },
]

const SPAGHETTI_WORDS = [
  "GRAVITY", "SPACETIME", "SINGULARITY", "PORTFOLIO",
  "DEVELOPER", "CREATIVE", "QUANTUM", "PHOTON",
  "COSMIC", "NEBULA", "ELECTRON", "FUSION",
]

interface FloatingText {
  id: number
  word: string
  position: THREE.Vector3
  velocity: THREE.Vector3
  stretching: number
  sucked: boolean
  opacity: number
  scale: number
}

export function BlackHole() {
  const diskRef = useRef<THREE.Mesh>(null)
  const ring1Ref = useRef<THREE.Mesh>(null)
  const ring2Ref = useRef<THREE.Mesh>(null)
  const particlesRef = useRef<THREE.Points>(null)
  const jetRef = useRef<THREE.Points>(null)
  const [hovered, setHovered] = useState(false)
  const [sucking, setSucking] = useState(false)
  const [score, setScore] = useState(0)
  const [showScore, setShowScore] = useState(false)
  const [showArchive, setShowArchive] = useState(false)
  const [archiveIndex, setArchiveIndex] = useState(0)
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([])
  const suckProgress = useRef(0)
  const nextWordId = useRef(0)
  const spawnTimer = useRef(0)
  const clickCount = useRef(0)
  const sounds = useSounds()

  const diskPosition = useMemo(() => new THREE.Vector3(65, 5, -45), [])

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
      const t = (r - 3) / 6
      colors[i * 3] = 1
      colors[i * 3 + 1] = 0.3 + t * 0.4
      colors[i * 3 + 2] = t * 0.2
    }
    return [pos, colors]
  }, [])

  // Jet particles
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

  const spawnWord = useCallback(() => {
    const word = SPAGHETTI_WORDS[Math.floor(Math.random() * SPAGHETTI_WORDS.length)]
    const angle = Math.random() * Math.PI * 2
    const dist = 12 + Math.random() * 8
    const pos = new THREE.Vector3(
      Math.cos(angle) * dist,
      (Math.random() - 0.5) * 6,
      Math.sin(angle) * dist
    )
    const orbitalSpeed = 0.3 + Math.random() * 0.3
    const vel = new THREE.Vector3(
      -Math.sin(angle) * orbitalSpeed,
      (Math.random() - 0.5) * 0.1,
      Math.cos(angle) * orbitalSpeed
    )
    setFloatingTexts((prev) => [
      ...prev.slice(-8),
      {
        id: nextWordId.current++,
        word,
        position: pos,
        velocity: vel,
        stretching: 0,
        sucked: false,
        opacity: 1,
        scale: 1,
      },
    ])
  }, [])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    if (diskRef.current) {
      diskRef.current.rotation.z += 0.008
      diskRef.current.rotation.x = Math.PI / 2.5 + Math.sin(t * 0.2) * 0.05
    }
    if (ring1Ref.current) ring1Ref.current.rotation.z -= 0.003
    if (ring2Ref.current) ring2Ref.current.rotation.z += 0.005

    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.01
      particlesRef.current.rotation.x = Math.PI / 2.5
      const scale = hovered ? 1.1 : 1
      particlesRef.current.scale.setScalar(scale)
    }

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

    if (sucking) {
      suckProgress.current = Math.min(1, suckProgress.current + 0.015)
    }

    // Spawn words periodically
    spawnTimer.current += delta
    if (spawnTimer.current > 2.5 && floatingTexts.length < 6) {
      spawnTimer.current = 0
      spawnWord()
    }

    // Update floating texts - gravitational pull
    setFloatingTexts((prev) =>
      prev
        .map((ft) => {
          const pos = ft.position.clone()
          const dir = pos.clone().negate().normalize()
          const dist = pos.length()

          if (sucking && !ft.sucked) {
            const pullStrength = 2 / Math.max(dist, 1)
            pos.add(dir.multiplyScalar(pullStrength * 60 * delta))
            const newStretching = Math.min(1, ft.stretching + delta * 2)
            const newScale = Math.max(0, 1 - newStretching * 0.7)

            if (dist < 2.5) {
              sounds.play("blackhole-hum", { volume: 0.15 })
              setScore((s) => s + 10)
              return { ...ft, position: pos, sucked: true, stretching: 1, opacity: 0, scale: 0 }
            }
            return { ...ft, position: pos, stretching: newStretching, scale: newScale }
          }

          // Gentle orbital motion
          pos.add(ft.velocity.clone().multiplyScalar(delta))
          const gravity = 0.3 / Math.max(dist * dist, 4)
          const pullDir = pos.clone().negate().normalize()
          const newVel = ft.velocity.clone().add(pullDir.multiplyScalar(gravity))

          return { ...ft, position: pos, velocity: newVel }
        })
        .filter((ft) => !ft.sucked || ft.opacity > 0)
    )
  })

  const handleClick = useCallback(
    (e: { stopPropagation: () => void }) => {
      e.stopPropagation()
      clickCount.current++

      // Every 3rd click opens the archive
      if (clickCount.current % 3 === 0) {
        setShowArchive(true)
        setArchiveIndex((i) => (i + 1) % ARCHIVE_ENTRIES.length)
        sounds.play("scan")
        setTimeout(() => setShowArchive(false), 5000)
        return
      }

      setSucking(true)
      suckProgress.current = 0
      setShowScore(true)
      sounds.play("blackhole-hum")
      for (let i = 0; i < 4; i++) {
        setTimeout(() => spawnWord(), i * 200)
      }
      setTimeout(() => setSucking(false), 4000)
    },
    [sounds, spawnWord]
  )

  return (
    <group position={diskPosition}>
      {/* Core */}
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

      {/* Event horizon glow */}
      <mesh>
        <sphereGeometry args={[2.1, 64, 64]} />
        <meshBasicMaterial
          color={sucking ? "#ff2200" : "#ff4400"}
          transparent
          opacity={hovered ? 0.25 : 0.1}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Gravitational lensing ring */}
      <mesh>
        <torusGeometry args={[2.15, 0.05, 16, 128]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={hovered ? 0.6 : 0.3} />
      </mesh>

      {/* Second lensing ring - offset */}
      <mesh rotation={[0.3, 0.2, 0]}>
        <torusGeometry args={[2.6, 0.03, 16, 128]} />
        <meshBasicMaterial color="#ffaa44" transparent opacity={hovered ? 0.3 : 0.1} />
      </mesh>

      {/* Accretion disk */}
      <mesh ref={diskRef} rotation={[Math.PI / 2.5, 0, 0]}>
        <ringGeometry args={[3, 8, 128]} />
        <meshBasicMaterial color="#ff6600" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>

      {/* Accretion disk particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={1500} array={diskParticles} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={1500} array={diskColors} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.15} vertexColors transparent opacity={0.7} depthWrite={false} sizeAttenuation />
      </points>

      {/* Relativistic jets */}
      <points ref={jetRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={300} array={jetParticles} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.1} color="#8888ff" transparent opacity={0.3} depthWrite={false} sizeAttenuation />
      </points>

      {/* Inner rings */}
      <mesh ref={ring1Ref} rotation={[Math.PI / 2.5, 0.2, 0]}>
        <ringGeometry args={[2.5, 4, 128]} />
        <meshBasicMaterial color="#ff8800" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={ring2Ref} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.2, 3, 128]} />
        <meshBasicMaterial color="#ffaa00" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>

      {/* Suck vortex effect */}
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

      {/* Floating spaghettifiable texts */}
      {floatingTexts.map((ft) => (
        <Html
          key={ft.id}
          position={[ft.position.x, ft.position.y, ft.position.z]}
          center
          distanceFactor={20}
          style={{ pointerEvents: "none" }}
        >
          <div
            className="font-mono text-xs font-bold select-none whitespace-nowrap"
            style={{
              color: `rgba(255, ${Math.round(120 + ft.stretching * 135)}, ${Math.round(ft.stretching * 50)}, ${ft.opacity})`,
              transform: `scaleX(${ft.scale}) scaleY(${1 + ft.stretching * 3})`,
              textShadow: ft.stretching > 0.3
                ? `0 0 ${10 + ft.stretching * 20}px rgba(255, 68, 0, ${ft.stretching * 0.6})`
                : "0 0 8px rgba(0, 200, 220, 0.4)",
              transition: "transform 0.05s linear",
              letterSpacing: `${ft.stretching * 12}px`,
              filter: ft.stretching > 0.5 ? `blur(${ft.stretching * 2}px)` : "none",
            }}
          >
            {ft.word}
          </div>
        </Html>
      ))}

      {/* Archive overlay - appears near the event horizon */}
      {showArchive && (
        <Html center distanceFactor={20} position={[0, 8, 0]} style={{ pointerEvents: "none" }}>
          <div className="glass-panel-bright rounded-lg px-4 py-3 w-64 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
              <span className="font-mono text-[10px] text-destructive uppercase tracking-[0.2em] font-bold">
                EVENT HORIZON ARCHIVE
              </span>
            </div>
            <div className="h-px w-full bg-gradient-to-r from-transparent via-destructive/30 to-transparent mb-2" />
            <p
              className="font-mono text-xs text-foreground/70 leading-relaxed"
              style={{
                transform: "scaleY(1.05)",
                textShadow: "0 2px 4px rgba(255,68,0,0.15)",
              }}
            >
              {ARCHIVE_ENTRIES[archiveIndex].text}
            </p>
            <p className="font-mono text-[10px] text-chart-4/80 mt-1.5 italic">
              {ARCHIVE_ENTRIES[archiveIndex].lesson}
            </p>
          </div>
        </Html>
      )}

      {/* Label / Score on hover */}
      {hovered && !showArchive && (
        <Html center distanceFactor={20} position={[0, 5, 0]} style={{ pointerEvents: "none" }}>
          <div className="glass-panel-bright rounded px-3 py-1.5 whitespace-nowrap">
            <span className="font-mono text-[10px] text-destructive uppercase tracking-[0.3em] font-semibold">
              SINGULARITY
            </span>
            <div className="font-mono text-[8px] text-muted-foreground mt-0.5">
              Click to spaghettify -- 3rd click reveals archive
            </div>
            {showScore && (
              <div className="font-mono text-[10px] text-chart-4 mt-0.5">
                {"SCORE: "}{score}
              </div>
            )}
          </div>
        </Html>
      )}

      <pointLight
        color={sucking ? "#ff2200" : "#ff4400"}
        intensity={hovered ? 40 : 20}
        distance={50}
        decay={2}
      />
    </group>
  )
}
