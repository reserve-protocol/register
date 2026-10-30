import { useEffect, useRef } from 'react'
import uglycashCard from '../assets/uglycash-card.png'
import globe from '../mock/globe-dots.json'
import { CATEGORIES } from '../mock/ugly-cash-series'
import { CATEGORY_COLORS } from './category-colors'

const cssColor = (name: string, alpha = 1) => {
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim()
  return `hsl(${v} / ${alpha})`
}

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Runs a canvas draw loop only while the canvas is on screen; one still frame under reduced motion.
const useCanvasLoop = (
  draw: (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    dt: number,
    t: number
  ) => void,
  setup?: (w: number, h: number) => void
) => {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let w = 0
    let h = 0
    let raf = 0
    let visible = true
    let last = performance.now()
    const start = last
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      setup?.(w, h)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible && !raf) {
        last = performance.now()
        raf = requestAnimationFrame(loop)
      }
    })
    io.observe(canvas)
    const loop = (now: number) => {
      raf = 0
      if (!visible || document.hidden) return
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      draw(ctx, w, h, dt, (now - start) / 1000)
      raf = requestAnimationFrame(loop)
    }
    if (prefersReducedMotion()) draw(ctx, w, h, 0, 4)
    else raf = requestAnimationFrame(loop)
    const onVisibility = () => {
      if (!document.hidden && visible && !raf && !prefersReducedMotion()) {
        last = performance.now()
        raf = requestAnimationFrame(loop)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return ref
}

const pickCategory = () => {
  let r = Math.random()
  for (const c of CATEGORIES) {
    r -= c.share
    if (r <= 0) return c.key
  }
  return CATEGORIES[0].key
}

type Particle = {
  a: number
  r: number
  w: number
  v: number
  size: number
  color: string
}

// V20: activity of every type spirals into eUSD; each arrival feeds a pulse on the core.
export const EusdVortex = () => {
  const coinRef = useRef<HTMLDivElement>(null)
  const state = useRef({
    particles: [] as Particle[],
    rings: [] as number[],
    arrivals: 0,
  })

  const spawn = (R: number, fresh: boolean): Particle => ({
    a: Math.random() * Math.PI * 2,
    r: fresh
      ? R * (0.35 + Math.random() * 0.65)
      : R * (0.85 + Math.random() * 0.15),
    w: 0.5 + Math.random() * 0.5,
    v: 16 + Math.random() * 22,
    size: 1.4 + Math.random() * 1.8,
    color: CATEGORY_COLORS[pickCategory()],
  })

  const canvasRef = useCanvasLoop(
    (ctx, w, h, dt) => {
      const s = state.current
      const cx = w / 2
      const cy = h / 2
      const R = Math.min(w, h) / 2 - 6
      ctx.globalCompositeOperation = 'destination-out'
      ctx.fillStyle = `rgba(0,0,0,${dt === 0 ? 1 : Math.min(1, dt * 7)})`
      ctx.fillRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'source-over'
      for (const p of s.particles) {
        const pull = Math.pow(R / Math.max(p.r, 20), 0.6)
        p.a += p.w * pull * dt
        p.r -= p.v * pull * dt
        if (p.r < 30) {
          Object.assign(p, spawn(R, false))
          s.arrivals++
          if (s.arrivals % 14 === 0) {
            s.rings.push(0)
            const coin = coinRef.current
            coin?.animate(
              [
                { transform: 'translate(-50%,-50%) scale(1)' },
                { transform: 'translate(-50%,-50%) scale(1.08)' },
                { transform: 'translate(-50%,-50%) scale(1)' },
              ],
              { duration: 380, easing: 'ease-out' }
            )
          }
        }
        const x = cx + Math.cos(p.a) * p.r
        const y = cy + Math.sin(p.a) * p.r * 0.62
        ctx.globalAlpha = Math.min(1, (p.r - 30) / 40)
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(x, y, p.size, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      s.rings = s.rings.filter((r) => r < 1)
      for (let i = 0; i < s.rings.length; i++) {
        s.rings[i] += dt * 0.9
        const r = s.rings[i]
        ctx.strokeStyle = cssColor('--primary', 0.5 * (1 - r))
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.ellipse(
          cx,
          cy,
          34 + r * R * 0.9,
          (34 + r * R * 0.9) * 0.62,
          0,
          0,
          Math.PI * 2
        )
        ctx.stroke()
      }
    },
    (w, h) => {
      const R = Math.min(w, h) / 2 - 6
      state.current.particles = Array.from({ length: 170 }, () =>
        spawn(R, true)
      )
    }
  )

  return (
    <div className="relative h-[300px] w-full" aria-hidden="true">
      <canvas ref={canvasRef} className="h-full w-full" />
      <div
        ref={coinRef}
        className="absolute left-1/2 top-1/2 flex h-[72px] w-[72px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-primary bg-card shadow-[0_10px_30px_rgba(1,87,177,0.25)]"
      >
        <img src="/svgs/eusd.svg" alt="" className="h-12 w-12" />
      </div>
    </div>
  )
}

type Arc = { from: [number, number]; to: [number, number]; t: number }

const toVec = ([lon, lat]: number[]) => {
  const l = (lon * Math.PI) / 180
  const p = (lat * Math.PI) / 180
  return [Math.cos(p) * Math.cos(l), Math.cos(p) * Math.sin(l), Math.sin(p)]
}

const slerp = (a: number[], b: number[], t: number) => {
  const dot = Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]))
  const om = Math.acos(dot)
  if (om < 1e-6) return a
  const s = Math.sin(om)
  const k1 = Math.sin((1 - t) * om) / s
  const k2 = Math.sin(t * om) / s
  return [a[0] * k1 + b[0] * k2, a[1] * k1 + b[1] * k2, a[2] * k1 + b[2] * k2]
}

// V21: a slowly turning dotted globe; active countries in blue, eUSD hopping between them.
export const EusdGlobe = () => {
  const state = useRef({ rot: -60, arcs: [] as Arc[], next: 0 })
  const pts = globe.pts as number[][]
  const vecs = useRef(pts.map((p) => toVec(p)))
  const actives = Object.values(globe.centroids as Record<string, number[]>)

  const canvasRef = useCanvasLoop((ctx, w, h, dt, t) => {
    const s = state.current
    s.rot += dt * 9
    const R = Math.min(w, h) / 2 - 10
    const cx = w / 2
    const cy = h / 2
    const lam = (s.rot * Math.PI) / 180
    const tilt = (-18 * Math.PI) / 180
    const cosL = Math.cos(lam)
    const sinL = Math.sin(lam)
    const cosT = Math.cos(tilt)
    const sinT = Math.sin(tilt)
    const project = (v: number[], lift = 0) => {
      const x1 = v[0] * cosL + v[1] * sinL
      const y1 = -v[0] * sinL + v[1] * cosL
      const z1 = v[2]
      const depth = x1 * cosT - z1 * sinT
      const up = x1 * sinT + z1 * cosT
      const k = R * (1 + lift)
      return { x: cx + y1 * k, y: cy - up * k, z: depth }
    }
    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = cssColor('--primary', 0.035)
    ctx.beginPath()
    ctx.arc(cx, cy, R, 0, Math.PI * 2)
    ctx.fill()
    const sand = cssColor('--border-secondary', 1)
    const blue = cssColor('--primary', 1)
    for (let i = 0; i < pts.length; i++) {
      const p = project(vecs.current[i])
      if (p.z <= 0) continue
      ctx.globalAlpha = 0.35 + 0.65 * p.z
      ctx.fillStyle = pts[i][2] ? blue : sand
      ctx.beginPath()
      ctx.arc(
        p.x,
        p.y,
        (pts[i][2] ? 1.9 : 1.5) * (0.6 + 0.4 * p.z),
        0,
        Math.PI * 2
      )
      ctx.fill()
    }
    ctx.globalAlpha = 1
    if (dt > 0 && t > s.next && s.arcs.length < 4) {
      const a = actives[Math.floor(Math.random() * actives.length)] as [
        number,
        number,
      ]
      const b = actives[Math.floor(Math.random() * actives.length)] as [
        number,
        number,
      ]
      if (a !== b) s.arcs.push({ from: a, to: b, t: 0 })
      s.next = t + 0.7
    }
    s.arcs = s.arcs.filter((arc) => arc.t < 1.4)
    for (const arc of s.arcs) {
      arc.t += dt * 0.55
      const va = toVec(arc.from)
      const vb = toVec(arc.to)
      const head = Math.min(1, arc.t)
      const tail = Math.max(0, arc.t - 0.45)
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.beginPath()
      let started = false
      for (let i = 0; i <= 24; i++) {
        const u = tail + ((head - tail) * i) / 24
        const p = project(slerp(va, vb, u), Math.sin(Math.PI * u) * 0.22)
        if (p.z < -0.15) {
          started = false
          continue
        }
        if (!started) ctx.moveTo(p.x, p.y)
        else ctx.lineTo(p.x, p.y)
        started = true
      }
      ctx.strokeStyle = cssColor(
        '--primary',
        0.85 * (1 - Math.max(0, arc.t - 1) / 0.4)
      )
      ctx.stroke()
      const hp = project(slerp(va, vb, head), Math.sin(Math.PI * head) * 0.22)
      if (hp.z > -0.15 && arc.t < 1) {
        ctx.fillStyle = blue
        ctx.beginPath()
        ctx.arc(hp.x, hp.y, 3.2, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  })

  return (
    <div className="relative h-[320px] w-full" aria-hidden="true">
      <canvas ref={canvasRef} className="h-full w-full" />
      <div className="absolute bottom-1 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full border-2 border-primary bg-card py-1.5 pl-1.5 pr-5 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
        <img src="/svgs/eusd.svg" alt="" className="h-9 w-9" />
        <span className="flex flex-col text-left leading-tight">
          <span className="text-primary">eUSD</span>
          <span className="text-xs text-legend">
            moving across 56 countries
          </span>
        </span>
      </div>
    </div>
  )
}

// V22: each type of activity streams into eUSD with a width set by its share; eUSD then powers UGLYCASH.
export const EusdStreams = () => {
  const rows = CATEGORIES.map((c, i) => ({
    ...c,
    y: 34 + i * 46,
    width: 3 + c.share * 34,
    speed: 2.6 - c.share * 3,
  }))
  const pill = { x: 320, y: 150 }
  return (
    <div className="w-full" aria-hidden="true">
      <style>{`
        @keyframes hp-stream { to { stroke-dashoffset: -120; } }
        @keyframes hp-stream-pill { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        .hp-stream-packet { animation: hp-stream var(--speed) linear infinite; }
        .hp-stream-pill { transform-origin: 320px 150px; animation: hp-stream-pill 1.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .hp-stream-packet, .hp-stream-pill { animation: none; } }
      `}</style>
      <svg viewBox="0 0 560 300" className="h-auto w-full">
        {rows.map((r) => {
          const d = `M118,${r.y} C210,${r.y} 230,${pill.y} ${pill.x - 40},${pill.y}`
          return (
            <g key={r.key}>
              <path
                d={d}
                fill="none"
                stroke={CATEGORY_COLORS[r.key]}
                strokeOpacity={0.22}
                strokeWidth={r.width}
                strokeLinecap="round"
              />
              <path
                d={d}
                fill="none"
                stroke={CATEGORY_COLORS[r.key]}
                strokeWidth={r.width}
                strokeLinecap="round"
                strokeDasharray="10 50"
                className="hp-stream-packet"
                style={{ '--speed': `${r.speed}s` } as React.CSSProperties}
              />
              <g transform={`translate(0 ${r.y - 13})`}>
                <rect
                  width="112"
                  height="26"
                  rx="13"
                  fill="hsl(var(--card))"
                  stroke="hsl(var(--border))"
                />
                <circle cx="14" cy="13" r="4" fill={CATEGORY_COLORS[r.key]} />
                <text
                  x="24"
                  y="17.5"
                  fontSize="12"
                  fill="hsl(var(--foreground))"
                >
                  {r.label}
                </text>
              </g>
            </g>
          )
        })}
        <path
          d={`M${pill.x + 40},${pill.y} L436,${pill.y}`}
          stroke="hsl(var(--primary))"
          strokeOpacity={0.2}
          strokeWidth={22}
          strokeLinecap="round"
        />
        <path
          d={`M${pill.x + 40},${pill.y} L436,${pill.y}`}
          stroke="hsl(var(--primary))"
          strokeWidth={22}
          strokeLinecap="round"
          strokeDasharray="10 30"
          className="hp-stream-packet"
          style={{ '--speed': '1.2s' } as React.CSSProperties}
        />
        <g className="hp-stream-pill">
          <circle
            cx={pill.x}
            cy={pill.y}
            r="40"
            fill="hsl(var(--card))"
            stroke="hsl(var(--primary))"
            strokeWidth="2.5"
          />
          <image
            href="/svgs/eusd.svg"
            x={pill.x - 26}
            y={pill.y - 26}
            width="52"
            height="52"
          />
        </g>
        <image
          href={uglycashCard}
          x="440"
          y="112"
          width="120"
          height="76"
          transform="rotate(-6 500 150)"
        />
      </svg>
    </div>
  )
}
