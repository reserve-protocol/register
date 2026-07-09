/**
 * Verify e2e snapshots exist, have a valid {_meta, data} envelope, and are
 * fresh. Hard-fails (exit 1) when snapshots are older than MAX_AGE_DAYS.
 *
 * Usage: pnpm e2e:check
 */
import { readFileSync, readdirSync, statSync } from 'fs'
import { dirname, join, relative } from 'path'
import { fileURLToPath } from 'url'
import { REGISTRY } from '../helpers/registry'

const snapshotsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'snapshots')
const MAX_AGE_DAYS = 45

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
  const days = Math.floor((Date.now() - new Date(capturedAt).getTime()) / 86_400_000)
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
      }
    } catch (e) {
      console.error(`FAIL: invalid JSON ${rel}: ${(e as Error).message}`)
      ok = false
    }
  }
  if (ok) console.log('ok: all snapshots have a valid {_meta, data} envelope')
  return ok
}

// Every registry DTF must have at least its core dtf.json snapshot.
function checkCoverage(): boolean {
  let ok = true
  for (const dtf of REGISTRY) {
    try {
      statSync(join(snapshotsDir, dtf.snapshotDir, 'dtf.json'))
    } catch {
      console.error(`FAIL: missing ${dtf.snapshotDir}/dtf.json for ${dtf.slug}. Run "pnpm e2e:capture".`)
      ok = false
    }
  }
  if (ok) console.log(`ok: all ${REGISTRY.length} registry DTFs have snapshots`)
  return ok
}

console.log('Checking e2e snapshots...\n')
const results = [checkAge(), checkStructure(), checkCoverage()]
if (results.some((r) => !r)) process.exit(1)
console.log('\nAll checks passed.')
