/**
 * Verify e2e snapshots exist, have a valid {_meta, data} envelope, and are
 * fresh. Hard-fails (exit 1) when snapshots are older than MAX_AGE_DAYS.
 *
 * Usage: pnpm e2e:check
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'fs'
import { dirname, join, relative } from 'path'
import { fileURLToPath } from 'url'
import { REGISTRY } from '../helpers/registry'
import { requiredSnapshotPaths } from '../helpers/snapshot-manifest'

const snapshotsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'snapshots')
const MAX_AGE_DAYS = 45
const DAY_MS = 86_400_000

function ageInDays(capturedAt: unknown): number | undefined {
  if (typeof capturedAt !== 'string') return undefined
  const timestamp = new Date(capturedAt).getTime()
  if (!Number.isFinite(timestamp) || timestamp > Date.now() + DAY_MS) return undefined
  return Math.floor((Date.now() - timestamp) / DAY_MS)
}

function allJsonFiles(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) out.push(...allJsonFiles(full))
    else if (entry.endsWith('.json')) out.push(full)
  }
  return out
}

function checkAge(): boolean {
  let capturedAt: string
  try {
    const raw = JSON.parse(readFileSync(join(snapshotsDir, '_meta.json'), 'utf-8'))
    capturedAt = raw.data?.capturedAt ?? raw._meta?.capturedAt
  } catch {
    console.error('FAIL: no _meta.json. Run "pnpm e2e:capture".')
    return false
  }
  const days = ageInDays(capturedAt)
  if (days === undefined) {
    console.error(`FAIL: invalid full-capture timestamp: ${String(capturedAt)}`)
    return false
  }
  if (days > MAX_AGE_DAYS) {
    console.error(`FAIL: snapshots are ${days} days old (>${MAX_AGE_DAYS}). Run "pnpm e2e:capture".`)
    return false
  }
  console.log(`ok: snapshots ${days} day(s) old (captured ${capturedAt})`)
  return true
}

function checkStructure(): boolean {
  let ok = true
  for (const file of allJsonFiles(snapshotsDir)) {
    const rel = relative(snapshotsDir, file)
    if (rel === '_meta.json') continue
    try {
      const raw = JSON.parse(readFileSync(file, 'utf-8'))
      if (!raw._meta) {
        console.error(`FAIL: missing _meta in ${rel}`)
        ok = false
      } else if (raw.data === undefined || raw.data === null) {
        console.error(`FAIL: empty data in ${rel}`)
        ok = false
      } else {
        const days = ageInDays(raw._meta.capturedAt)
        if (days === undefined || days > MAX_AGE_DAYS) {
          console.error(
            `FAIL: invalid/stale capturedAt in ${rel}: ${String(raw._meta.capturedAt)}`
          )
          ok = false
        }
        const dtf = REGISTRY.find((entry) => rel.startsWith(`${entry.snapshotDir}/`))
        if (
          dtf &&
          (String(raw._meta.dtf).toLowerCase() !== dtf.address.toLowerCase() ||
            Number(raw._meta.chainId) !== dtf.chainId)
        ) {
          console.error(`FAIL: snapshot identity mismatch in ${rel}`)
          ok = false
        }
      }
    } catch (e) {
      console.error(`FAIL: invalid JSON ${rel}: ${(e as Error).message}`)
      ok = false
    }
  }
  if (ok) console.log('ok: all snapshots have a valid {_meta, data} envelope')
  return ok
}

// Every shared and per-DTF boundary required by committed tests must exist.
function checkCoverage(): boolean {
  let ok = true
  const required = requiredSnapshotPaths()
  for (const relativePath of required) {
    if (!existsSync(join(snapshotsDir, relativePath))) {
      console.error(`FAIL: missing ${relativePath}. Run "pnpm e2e:capture".`)
      ok = false
    }
  }
  if (ok) console.log(`ok: all ${required.length} required snapshots exist`)
  return ok
}

console.log('Checking e2e snapshots...\n')
const results = [checkAge(), checkStructure(), checkCoverage()]
if (results.some((r) => !r)) process.exit(1)
console.log('\nAll checks passed.')
