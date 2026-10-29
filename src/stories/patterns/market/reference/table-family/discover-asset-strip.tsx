import { useCallback, useEffect, useRef, useState } from 'react'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { cn } from '@/lib/utils'
import type { DiscoverRow } from './discover-fixtures'

export function DiscoverAssetStrip({
  assets,
  paused,
  open,
}: {
  assets: DiscoverRow['basket']
  paused: boolean
  open: boolean
}) {
  const viewport = useRef<HTMLDivElement>(null)
  const frame = useRef<HTMLDivElement>(null)
  const sequence = useRef<HTMLUListElement>(null)
  const [reduced, setReduced] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
  const [manual, setManual] = useState(false)
  const [copies, setCopies] = useState(1)
  const [hasOverflow, setHasOverflow] = useState(false)
  const elapsed = useRef(0)
  const active = open && hasOverflow && !paused && !reduced && !manual
  useEffect(() => {
    if (!open) {
      setManual(false)
      elapsed.current = 0
      if (viewport.current) viewport.current.scrollLeft = 0
    }
  }, [open])
  const updateEdges = useCallback(() => {
    const view = viewport.current
    const edge = frame.current
    if (!view || !edge) return
    const start = String(view.scrollLeft > 1)
    const end = String(
      view.scrollLeft < view.scrollWidth - view.clientWidth - 1
    )
    if (edge.dataset.overflowStart !== start) edge.dataset.overflowStart = start
    if (edge.dataset.overflowEnd !== end) edge.dataset.overflowEnd = end
  }, [])
  useEffect(updateEdges, [updateEdges, copies, manual, reduced, hasOverflow])
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  useEffect(() => {
    const view = viewport.current
    const strip = sequence.current
    if (!view || !strip) return
    const measure = () => {
      if (!view.clientWidth || !strip.scrollWidth) return
      const overflowing = strip.scrollWidth > view.clientWidth + 1
      setHasOverflow(overflowing)
      setCopies(
        overflowing
          ? Math.max(2, Math.ceil(view.clientWidth / strip.scrollWidth) + 2)
          : 1
      )
      elapsed.current = 0
      view.scrollLeft = 0
      updateEdges()
    }
    const observer = new ResizeObserver(measure)
    observer.observe(view)
    observer.observe(strip)
    return () => observer.disconnect()
  }, [updateEdges])
  useEffect(() => {
    if (!active) return
    let frame = 0
    let previous = 0
    const tick = (time: number) => {
      const view = viewport.current
      const width = sequence.current?.scrollWidth ?? 0
      if (previous) elapsed.current += (time - previous) / 1000
      previous = time
      if (view && width)
        view.scrollLeft = discoverScrollDistance(elapsed.current) % width
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [active])
  const items = [...assets].sort(
    (a, b) => Number(b.weight ?? 0) - Number(a.weight ?? 0)
  )
  return (
    <div
      ref={frame}
      data-overflow-start="false"
      data-overflow-end="false"
      className="group/asset-strip relative overflow-hidden rounded-full border border-card py-2 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring"
    >
      <div
        ref={viewport}
        role="list"
        aria-label="Collateral:"
        tabIndex={0}
        data-slot="asset-strip-viewport"
        className="flex overflow-x-auto overscroll-x-contain outline-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onFocus={() => setManual(true)}
        onPointerDown={() => setManual(true)}
        onWheel={() => setManual(true)}
        onScroll={updateEdges}
        onKeyDown={(event) => {
          const view = viewport.current
          if (!view) return
          const targets: Record<string, number> = {
            Home: 0,
            End: view.scrollWidth,
            ArrowRight: view.scrollLeft + 72,
            ArrowLeft: view.scrollLeft - 72,
          }
          if (!(event.key in targets)) return
          event.preventDefault()
          view.scrollLeft = targets[event.key]
        }}
      >
        {Array.from({ length: reduced || manual ? 1 : copies }, (_, index) => (
          <ul
            key={index}
            ref={index === 0 ? sequence : undefined}
            role="presentation"
            aria-hidden={index > 0 || undefined}
            className="flex shrink-0 items-center pl-2"
          >
            <li
              role="presentation"
              className={cn(
                type.supporting,
                'shrink-0 px-1.5 py-1 text-supporting-foreground'
              )}
            >
              Collateral:
            </li>
            {items.map((token) => (
              <li
                key={token.address}
                role="listitem"
                className={cn(
                  type.supporting,
                  'flex shrink-0 items-center gap-1 whitespace-nowrap px-1.5 py-1'
                )}
              >
                <span className="ml-1">${token.symbol}</span>
                <span className="text-supporting-foreground tabular-nums">
                  {token.weight === undefined ? '—' : `${token.weight}%`}
                </span>
              </li>
            ))}
          </ul>
        ))}
      </div>
      <div
        aria-hidden="true"
        data-slot="asset-strip-fade-left"
        className="pointer-events-none absolute inset-y-2 left-0 w-3 bg-gradient-to-r from-card to-transparent opacity-0 group-data-[overflow-start=true]/asset-strip:opacity-100"
      />
      <div
        aria-hidden="true"
        data-slot="asset-strip-fade-right"
        className="pointer-events-none absolute inset-y-2 right-0 w-3 bg-gradient-to-l from-card to-transparent opacity-0 group-data-[overflow-end=true]/asset-strip:opacity-100"
      />
    </div>
  )
}

export function discoverScrollDistance(seconds: number) {
  const ramp = Math.min(seconds, 1.2) / 1.2
  return 28.8 * ramp ** 3 + Math.max(0, seconds - 1.2) * 72
}
