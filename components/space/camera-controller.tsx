"use client"

import { useRef, useEffect, useCallback } from "react"
import { useThree, useFrame } from "@react-three/fiber"
import * as THREE from "three"

interface CameraControllerProps {
  selectedPlanet: { x: number; z: number } | null
  launched: boolean
}

export function CameraController({ selectedPlanet, launched }: CameraControllerProps) {
  const { camera, gl } = useThree()
  const targetPos = useRef(new THREE.Vector3(0, 40, 60))
  const targetLook = useRef(new THREE.Vector3(0, 0, 0))
  const scrollRef = useRef(0)
  const angleRef = useRef(0)

  // Mouse drag state
  const isDragging = useRef(false)
  const lastMouse = useRef({ x: 0, y: 0 })
  const dragAngleX = useRef(0)
  const dragAngleY = useRef(0)

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    scrollRef.current += e.deltaY * 0.001
    angleRef.current += e.deltaY * 0.002
  }, [])

  // Mouse drag handlers
  const handlePointerDown = useCallback((e: PointerEvent) => {
    isDragging.current = true
    lastMouse.current = { x: e.clientX, y: e.clientY }
    gl.domElement.style.cursor = "grabbing"
  }, [gl])

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!isDragging.current) return
    const dx = e.clientX - lastMouse.current.x
    const dy = e.clientY - lastMouse.current.y
    dragAngleX.current += dx * 0.003
    dragAngleY.current = Math.max(-0.5, Math.min(0.5, dragAngleY.current + dy * 0.002))
    lastMouse.current = { x: e.clientX, y: e.clientY }
  }, [])

  const handlePointerUp = useCallback(() => {
    isDragging.current = false
    gl.domElement.style.cursor = "default"
  }, [gl])

  useEffect(() => {
    const el = gl.domElement
    window.addEventListener("wheel", handleWheel, { passive: false })
    el.addEventListener("pointerdown", handlePointerDown)
    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("pointerup", handlePointerUp)
    return () => {
      window.removeEventListener("wheel", handleWheel)
      el.removeEventListener("pointerdown", handlePointerDown)
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
    }
  }, [handleWheel, handlePointerDown, handlePointerMove, handlePointerUp, gl])

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
      const totalAngle = angleRef.current + dragAngleX.current
      const orbitDist = 45 + Math.sin(scrollRef.current * 0.3) * 10
      const height = 20 + Math.cos(scrollRef.current * 0.2) * 8 + dragAngleY.current * 20
      targetPos.current.set(
        Math.sin(totalAngle) * orbitDist,
        Math.max(5, height),
        Math.cos(totalAngle) * orbitDist
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
