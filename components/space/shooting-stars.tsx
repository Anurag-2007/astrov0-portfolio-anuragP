"use client"

import { useRef, useMemo, useState } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

interface ShootingStar {
  start: THREE.Vector3
  direction: THREE.Vector3
  speed: number
  life: number
  maxLife: number
  width: number
}

export function ShootingStars() {
  const starsRef = useRef<ShootingStar[]>([])
  const trailsRef = useRef<THREE.Group>(null)
  const [, setTick] = useState(0)
  const nextSpawn = useRef(0)

  const trailGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const positions = new Float32Array(6) // 2 points for line
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    return geo
  }, [])

  useFrame((state) => {
    const t = state.clock.elapsedTime

    // Spawn new shooting stars
    if (t > nextSpawn.current && starsRef.current.length < 3) {
      const startPos = new THREE.Vector3(
        (Math.random() - 0.5) * 200,
        30 + Math.random() * 60,
        (Math.random() - 0.5) * 200
      )
      const dir = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        -0.5 - Math.random() * 0.5,
        (Math.random() - 0.5) * 2
      ).normalize()

      starsRef.current.push({
        start: startPos,
        direction: dir,
        speed: 40 + Math.random() * 60,
        life: 0,
        maxLife: 0.8 + Math.random() * 1.2,
        width: 0.02 + Math.random() * 0.04,
      })
      nextSpawn.current = t + 2 + Math.random() * 5
    }

    // Update
    starsRef.current = starsRef.current.filter((s) => {
      s.life += 1 / 60
      return s.life < s.maxLife
    })

    setTick((v) => v + 1)
  })

  return (
    <group ref={trailsRef}>
      {starsRef.current.map((star, i) => {
        const progress = star.life / star.maxLife
        const headPos = star.start
          .clone()
          .add(star.direction.clone().multiplyScalar(star.speed * star.life))
        const tailLen = Math.min(star.speed * 0.15, star.speed * star.life)
        const tailPos = headPos
          .clone()
          .sub(star.direction.clone().multiplyScalar(tailLen))
        const opacity = progress < 0.1 ? progress * 10 : progress > 0.7 ? (1 - progress) / 0.3 : 1

        return (
          <group key={`star-${i}-${star.start.x.toFixed(2)}`}>
            {/* Trail line */}
            <line>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  count={2}
                  array={new Float32Array([
                    tailPos.x, tailPos.y, tailPos.z,
                    headPos.x, headPos.y, headPos.z,
                  ])}
                  itemSize={3}
                />
              </bufferGeometry>
              <lineBasicMaterial
                color="#ffffff"
                transparent
                opacity={opacity * 0.8}
                linewidth={1}
              />
            </line>
            {/* Head glow */}
            <mesh position={headPos}>
              <sphereGeometry args={[0.15, 8, 8]} />
              <meshBasicMaterial
                color="#ffffff"
                transparent
                opacity={opacity}
              />
            </mesh>
            {/* Glow sphere */}
            <mesh position={headPos}>
              <sphereGeometry args={[0.5, 8, 8]} />
              <meshBasicMaterial
                color="#aaddff"
                transparent
                opacity={opacity * 0.2}
              />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}
