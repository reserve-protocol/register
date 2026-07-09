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

export function loadSnapshotRaw<T = unknown>(relativePath: string): SnapshotFile<T> {
  const full = snapshotPath(relativePath)
  if (!existsSync(full)) {
    throw new Error(
      `Snapshot not found: ${relativePath}\nRun "pnpm e2e:capture" to generate snapshots.`
    )
  }
  return JSON.parse(readFileSync(full, 'utf-8')) as SnapshotFile<T>
}

// Returns the unwrapped `data` payload from the {_meta, data} envelope.
export function loadSnapshot<T = unknown>(relativePath: string): T {
  return loadSnapshotRaw<T>(relativePath).data
}
