import { Trans } from '@lingui/react/macro'
import { useEffect, useRef } from 'react'
import { COUNTRY_COUNT, COUNTRY_SERVICE } from '../data/countries'
import geography from '../data/geography.json'
import {
  ARC_END,
  ARC_HEAD_RADIUS,
  ARC_LIFT,
  arcGlobeRadius,
  arcVisibility,
  arcWindow,
  hasVisibleDeparture,
} from './globe-arc'

type Vector = [number, number, number]
type Arc = { from: Vector; to: Vector; progress: number }
type Draw = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  dt: number
) => void

const ROTATION_DEG_PER_SECOND = 9
const TILT = (-18 * Math.PI) / 180
const COS_TILT = Math.cos(TILT)
const SIN_TILT = Math.sin(TILT)
const ARC_SPEED = 0.55
const ARC_INTERVAL_SECONDS = 0.7
const MAX_ARCS = 4
const ARC_SEGMENTS = 24
const LAUNCH_ATTEMPTS = 12

const cssColor = (name: string, alpha = 1) => {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim()
  return `hsl(${value} / ${alpha})`
}

// Draws only while the canvas is on screen; under reduced motion it paints one still frame (dt = 0).
const useCanvasLoop = (draw: Draw) => {
  const ref = useRef<HTMLCanvasElement>(null)
  const drawRef = useRef(draw)
  drawRef.current = draw

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let width = 0
    let height = 0
    let raf = 0
    let visible = true
    let last = performance.now()

    const loop = (now: number) => {
      raf = 0
      if (!visible || document.hidden) return
      if (motion.matches) {
        drawRef.current(ctx, width, height, 0)
        return
      }
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      drawRef.current(ctx, width, height, dt)
      raf = requestAnimationFrame(loop)
    }
    const start = () => {
      if (raf || !visible || document.hidden) return
      last = performance.now()
      raf = requestAnimationFrame(loop)
    }
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      drawRef.current(ctx, width, height, 0)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      start()
    })
    io.observe(canvas)
    start()
    document.addEventListener('visibilitychange', start)
    motion.addEventListener('change', start)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', start)
      motion.removeEventListener('change', start)
    }
  }, [])

  return ref
}

const toVector = ([lon, lat]: number[]): Vector => {
  const lambda = (lon * Math.PI) / 180
  const phi = (lat * Math.PI) / 180
  return [
    Math.cos(phi) * Math.cos(lambda),
    Math.cos(phi) * Math.sin(lambda),
    Math.sin(phi),
  ]
}

const slerp = (a: Vector, b: Vector, t: number): Vector => {
  const dot = Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]))
  const omega = Math.acos(dot)
  if (omega < 1e-6) return a
  const sin = Math.sin(omega)
  const ka = Math.sin((1 - t) * omega) / sin
  const kb = Math.sin(t * omega) / sin
  return [a[0] * ka + b[0] * kb, a[1] * ka + b[1] * kb, a[2] * ka + b[2] * kb]
}

const DOTS = (geography.globeDots as [number, number, string][]).map(
  ([lon, lat, country]) => ({
    vector: toVector([lon, lat]),
    service: COUNTRY_SERVICE[country],
  })
)
const HUBS = Object.values(geography.globeCentroids).map(toVector)

const EusdGlobe = () => {
  const state = useRef({ rotation: -60, arcs: [] as Arc[], next: 0, elapsed: 0 })

  const canvasRef = useCanvasLoop((ctx, width, height, dt) => {
    const s = state.current
    s.rotation += dt * ROTATION_DEG_PER_SECOND
    const radius = arcGlobeRadius(width, height)
    const cx = width / 2
    const cy = height / 2
    const lambda = (s.rotation * Math.PI) / 180
    const cosL = Math.cos(lambda)
    const sinL = Math.sin(lambda)
    const project = (v: Vector, lift = 0) => {
      const x = v[0] * cosL + v[1] * sinL
      const y = -v[0] * sinL + v[1] * cosL
      const k = radius * (1 + lift)
      return {
        x: cx + y * k,
        y: cy - (x * SIN_TILT + v[2] * COS_TILT) * k,
        z: x * COS_TILT - v[2] * SIN_TILT,
      }
    }
    type Point = ReturnType<typeof project>

    // The sand land token is near-black in dark mode, where the globe needs a lighter land and disc.
    const isDark = document.documentElement.classList.contains('dark')
    const colors = {
      land: isDark
        ? cssColor('--muted-foreground', 0.5)
        : cssColor('--border-secondary'),
      custodial: cssColor('--primary'),
      selfCustody: cssColor('--success'),
    }
    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = cssColor('--primary', isDark ? 0.14 : 0.035)
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.fill()
    for (const dot of DOTS) {
      const p = project(dot.vector)
      if (p.z <= 0) continue
      ctx.globalAlpha = 0.35 + 0.65 * p.z
      ctx.fillStyle = colors[dot.service ?? 'land']
      ctx.beginPath()
      ctx.arc(p.x, p.y, (dot.service ? 1.9 : 1.5) * (0.6 + 0.4 * p.z), 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
    if (dt === 0) return

    const sample = (arc: Arc, u: number) =>
      project(slerp(arc.from, arc.to, u), Math.sin(Math.PI * u) * ARC_LIFT)
    const visibility = ({ x, y, z }: Point) =>
      arcVisibility(z, Math.hypot(x - cx, y - cy), radius)

    s.elapsed += dt
    for (const arc of s.arcs) arc.progress += dt * ARC_SPEED
    s.arcs = s.arcs.filter((arc) => arc.progress < ARC_END)
    if (s.elapsed > s.next && s.arcs.length < MAX_ARCS) {
      for (let attempt = 0; attempt < LAUNCH_ATTEMPTS; attempt++) {
        const from = HUBS[Math.floor(Math.random() * HUBS.length)]
        const to = HUBS[Math.floor(Math.random() * HUBS.length)]
        if (from === to) continue
        const arc = { from, to, progress: 0 }
        if (!hasVisibleDeparture((u) => visibility(sample(arc, u)))) continue
        s.arcs.push(arc)
        break
      }
      s.next = s.elapsed + ARC_INTERVAL_SECONDS
    }

    ctx.strokeStyle = colors.custodial
    ctx.fillStyle = colors.custodial
    ctx.lineWidth = 2
    ctx.lineCap = 'butt'
    for (const arc of s.arcs) {
      const { head, tail, opacity } = arcWindow(arc.progress)
      let previous = sample(arc, tail)
      for (let i = 1; i <= ARC_SEGMENTS; i++) {
        const point = sample(arc, tail + ((head - tail) * i) / ARC_SEGMENTS)
        ctx.globalAlpha =
          (0.85 * opacity * (visibility(previous) + visibility(point))) / 2
        ctx.beginPath()
        ctx.moveTo(previous.x, previous.y)
        ctx.lineTo(point.x, point.y)
        ctx.stroke()
        previous = point
      }
      ctx.globalAlpha = opacity * visibility(previous)
      ctx.beginPath()
      ctx.arc(previous.x, previous.y, ARC_HEAD_RADIUS, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
  })

  return (
    <div className="flex w-full flex-col items-center">
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="block h-[320px] w-full"
      />
      <div className="flex items-center gap-3 rounded-full border-2 border-primary bg-card py-1.5 pl-1.5 pr-5 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
        <img src="/svgs/eusd.svg" alt="" className="h-9 w-9" />
        <span className="flex flex-col text-left leading-tight">
          <span className="text-primary">
            <Trans>eUSD within UGLYCASH</Trans>
          </span>
          <span className="text-xs text-legend">
            <Trans>moving across {COUNTRY_COUNT} countries</Trans>
          </span>
        </span>
      </div>
    </div>
  )
}

export default EusdGlobe
