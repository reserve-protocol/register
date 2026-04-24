import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const snapshotsDir = join(__dirname, '..', 'snapshots')

interface SnapshotMeta {
  source: string
  capturedAt: string
  dtf?: string
  chainId?: number
}

interface SnapshotFile<T = unknown> {
  _meta: SnapshotMeta
  data: T
}

export function loadSnapshot<T = unknown>(relativePath: string): T {
  const fullPath = join(snapshotsDir, relativePath)

  if (!existsSync(fullPath)) {
    throw new Error(
      `Snapshot not found: ${relativePath}\nRun "npm run e2e:capture" to generate snapshots.`
    )
  }

  const raw: SnapshotFile<T> = JSON.parse(
    readFileSync(fullPath, 'utf-8')
  )
  return raw.data
}

export function loadSnapshotRaw<T = unknown>(
  relativePath: string
): SnapshotFile<T> {
  const fullPath = join(snapshotsDir, relativePath)

  if (!existsSync(fullPath)) {
    throw new Error(
      `Snapshot not found: ${relativePath}\nRun "npm run e2e:capture" to generate snapshots.`
    )
  }

  return JSON.parse(readFileSync(fullPath, 'utf-8'))
}

export function snapshotExists(relativePath: string): boolean {
  return existsSync(join(snapshotsDir, relativePath))
}
