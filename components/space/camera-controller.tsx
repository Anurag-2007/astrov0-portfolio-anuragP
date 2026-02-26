"use client"

import { useRef, useEffect, useCallback } from "react"
import { useThree, useFrame } from "@react-three/fiber"
import * as THREE from "three"

interface CameraControllerProps {
  selectedPlanet: { x: number; z: number } | null
  launched: boolean
}

export function CameraController({ selectedPlanet, launched }: CameraControllerProps) {
  const { camera } = useThree()
  const targetPos = useRef(new THREE.Vector3(0, 40, 60))
  const targetLook = useRef(new THREE.Vector3(0, 0, 0))
  const scrollRef = useRef(0)
  const angleRef = useRef(0)

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    scrollRef.current += e.deltaY * 0.001
    angleRef.current += e.deltaY * 0.002
  }, [])

  useEffect(() => {
    window.addEventListener("wheel", handleWheel, { passive: false })
    return () => window.removeEventListener("wheel", handleWheel)
  }, [handleWheel])

  useFrame(() => {
    if (!launched) {
      camera.position.set(0, 100, 150)
      camera.lookAt(0, 0, 0)
      return
    }

    if (selectedPlanet) {
      targetPos.current.set(
        selectedPlanet.x * 0.7,
        8,
        selectedPlanet.z * 0.7 + 15
      )
      targetLook.current.set(selectedPlanet.x, 0, selectedPlanet.z)
    } else {
      const orbitDist = 45 + Math.sin(scrollRef.current * 0.3) * 10
      const height = 20 + Math.cos(scrollRef.current * 0.2) * 8
      targetPos.current.set(
        Math.sin(angleRef.current) * orbitDist,
        height,
        Math.cos(angleRef.current) * orbitDist
      )
      targetLook.current.set(0, 0, 0)
    }

    camera.position.lerp(targetPos.current, 0.02)
    const currentLook = new THREE.Vector3()
    camera.getWorldDirection(currentLook)
    const targetDir = targetLook.current.clone().sub(camera.position).normalize()
    currentLook.lerp(targetDir, 0.03)
    camera.lookAt(
      camera.position.x + currentLook.x,
      camera.position.y + currentLook.y,
      camera.position.z + currentLook.z
    )
  })

  return null
}
