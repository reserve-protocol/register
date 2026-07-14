import { existsSync, readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

// Snapshots live at e2e/snapshots/<chain>/<slug>/*.json plus shared/*.json.
const snapshotsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'snapshots')

export interface SnapshotMeta {
  source: string
  capturedAt: string
  dtf?: string
  chainId?: number
  query?: string
  // Moving-window params recorded so time-series windows are reproducible.
  window?: Record<string, unknown>
}

export interface SnapshotFile<T = unknown> {
  _meta: SnapshotMeta
  data: T
}

export function snapshotPath(relativePath: string): string {
  return join(snapshotsDir, relativePath)
}

export function snapshotExists(relativePath: string): boolean {
  return existsSync(snapshotPath(relativePath))
}

// Per-worker parse cache. Snapshots are immutable at test time (tests change
// responses via MockOverrides, never by mutating a loaded object), so every
// worker parses each file at most once instead of re-reading + re-parsing the
// multi-hundred-KB historical/price JSON on every mocked request. NEVER mutate
// a returned snapshot object — a mutation would poison this cache for the rest
// of the worker's tests.
const parseCache = new Map<string, SnapshotFile<unknown>>()

export function loadSnapshotRaw<T = unknown>(relativePath: string): SnapshotFile<T> {
  const cached = parseCache.get(relativePath)
  if (cached) return cached as SnapshotFile<T>
  const full = snapshotPath(relativePath)
  if (!existsSync(full)) {
    throw new Error(
      `Snapshot not found: ${relativePath}\nRun "pnpm e2e:capture" to generate snapshots.`
    )
  }
  const parsed = JSON.parse(readFileSync(full, 'utf-8')) as SnapshotFile<T>
  parseCache.set(relativePath, parsed)
  return parsed
}

// Returns the unwrapped `data` payload from the {_meta, data} envelope.
export function loadSnapshot<T = unknown>(relativePath: string): T {
  return loadSnapshotRaw<T>(relativePath).data
}
