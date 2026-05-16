import { useEffect, useMemo, useRef, useState } from 'react'
import Globe, { type GlobeMethods } from 'react-globe.gl'
import { MeshPhongMaterial } from 'three'
import { globeArcs, type GlobeArc } from '@/data/globeArcs'
import { globeNodes, type GlobeNode, type GlobeNodeType } from '@/data/globeNodes'

const nodeColors: Record<GlobeNodeType, string> = {
  research: '#22d3ee',
  donor: '#4ade80',
  dao: '#a855f7',
  ai: '#facc15',
  validator: '#38bdf8',
}

const fallbackSize = {
  width: 560,
  height: 520,
}

export function ScienceGlobe() {
  const containerRef = useRef<HTMLDivElement>(null)
  const globeRef = useRef<GlobeMethods | undefined>(undefined)
  const [size, setSize] = useState(fallbackSize)

  const globeMaterial = useMemo(
    () =>
      new MeshPhongMaterial({
        color: '#07111f',
        emissive: '#0e7490',
        emissiveIntensity: 0.24,
        shininess: 14,
        transparent: true,
        opacity: 0.98,
      }),
    [],
  )

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const resizeObserver = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize({
        width: Math.max(320, Math.floor(width)),
        height: Math.max(360, Math.floor(height)),
      })
    })

    resizeObserver.observe(container)

    return () => resizeObserver.disconnect()
  }, [])

  useEffect(() => {
    const controls = globeRef.current?.controls()
    if (!controls) return

    controls.autoRotate = true
    controls.autoRotateSpeed = 0.55
    controls.enableZoom = false
    controls.enablePan = false
  }, [])

  function nodeColor(node: object) {
    return nodeColors[(node as GlobeNode).type]
  }

  function nodeLabel(node: object) {
    const globeNode = node as GlobeNode
    return `${globeNode.name} · ${globeNode.type}`
  }

  function arcColor(arc: object) {
    return (arc as GlobeArc).color
  }

  function arcLabel(arc: object) {
    return (arc as GlobeArc).label
  }

  return (
    <div
      ref={containerRef}
      className="relative min-h-[420px] overflow-hidden lg:min-h-[540px]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(34,211,238,0.16),transparent_34%),radial-gradient(circle_at_58%_52%,rgba(168,85,247,0.14),transparent_42%)]" />
      <div className="pointer-events-none absolute inset-x-10 bottom-8 h-20 rounded-[50%] bg-cyan-300/10 blur-3xl" />

      <Globe
        ref={globeRef}
        width={size.width}
        height={size.height}
        backgroundColor="rgba(0,0,0,0)"
        globeMaterial={globeMaterial}
        showAtmosphere
        atmosphereColor="#22d3ee"
        atmosphereAltitude={0.18}
        showGraticules
        pointsData={globeNodes}
        pointLat="lat"
        pointLng="lng"
        pointAltitude={0.025}
        pointRadius={0.38}
        pointResolution={18}
        pointColor={nodeColor}
        pointLabel={nodeLabel}
        labelsData={globeNodes}
        labelLat="lat"
        labelLng="lng"
        labelAltitude={0.075}
        labelText="name"
        labelSize={0.72}
        labelDotRadius={0.25}
        labelColor={nodeColor}
        labelResolution={2}
        arcsData={globeArcs}
        arcStartLat="startLat"
        arcStartLng="startLng"
        arcEndLat="endLat"
        arcEndLng="endLng"
        arcColor={arcColor}
        arcLabel={arcLabel}
        arcAltitude={0.28}
        arcStroke={0.8}
        arcDashLength={0.44}
        arcDashGap={1.4}
        arcDashAnimateTime={2600}
        arcsTransitionDuration={900}
        enablePointerInteraction
      />
    </div>
  )
}
