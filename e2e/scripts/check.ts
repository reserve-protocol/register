/**
 * Verify e2e snapshots exist, have a valid {_meta, data} envelope, and are
 * fresh. Hard-fails (exit 1) when snapshots are older than MAX_AGE_DAYS.
 *
 * Usage: pnpm e2e:check
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'fs'
import { dirname, join, relative } from 'path'
import { fileURLToPath } from 'url'
import { REGISTRY, YIELD_REGISTRY } from '../helpers/registry'
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
        // Yield fixtures carry their own identity + pinned-block metadata and a
        // nonempty replay map — a capture against the wrong RToken/chain, or a
        // truncated map, must fail here rather than at test time.
        const rtoken = YIELD_REGISTRY.find((entry) => rel.startsWith(`${entry.snapshotDir}/`))
        if (rtoken) {
          if (
            String(raw._meta.dtf).toLowerCase() !== rtoken.address.toLowerCase() ||
            Number(raw._meta.chainId) !== rtoken.chainId
          ) {
            console.error(`FAIL: yield snapshot identity mismatch in ${rel}`)
            ok = false
          }
          if (rel.endsWith('rtoken-chain-state.json')) {
            if (!Number.isFinite(raw._meta.block) || !Number.isFinite(raw._meta.blockTimestamp)) {
              console.error(`FAIL: yield chain-state missing block/blockTimestamp in ${rel}`)
              ok = false
            }
            if (!raw.data || Object.keys(raw.data).length === 0) {
              console.error(`FAIL: yield chain-state replay map is empty in ${rel}`)
              ok = false
            }
          }
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

// The yield replay keys are chain-scoped, so a shared address (e.g. the RSR/USD
// Chainlink feed) legitimately appears on two chains with different values.
// This check documents that overlap and fails only if the SAME chain's file
// somehow carries a duplicate — a real capture corruption.
function checkYieldCollisions(): boolean {
  let ok = true
  let crossChainShared = 0
  const perChain = new Map<number, Map<string, string>>()
  for (const rtoken of YIELD_REGISTRY) {
    const file = join(snapshotsDir, rtoken.snapshotDir, 'rtoken-chain-state.json')
    if (!existsSync(file)) continue
    const map = JSON.parse(readFileSync(file, 'utf-8')).data as Record<string, string>
    const chainMap = perChain.get(rtoken.chainId) ?? new Map<string, string>()
    for (const [key, value] of Object.entries(map)) {
      if (chainMap.has(key)) {
        console.error(`FAIL: duplicate replay key within chain ${rtoken.chainId}: ${key}`)
        ok = false
      }
      chainMap.set(key, value)
    }
    perChain.set(rtoken.chainId, chainMap)
  }
  const chains = [...perChain.entries()]
  for (let i = 0; i < chains.length; i++) {
    for (let j = i + 1; j < chains.length; j++) {
      for (const key of chains[i][1].keys()) {
        if (chains[j][1].has(key)) crossChainShared++
      }
    }
  }
  if (ok) {
    console.log(
      `ok: yield replay keys are chain-scoped (${crossChainShared} address:calldata shared across chains, disambiguated by chainId)`
    )
  }
  return ok
}

// A committed `test.fixme` must assert DESIRED behavior that fails when
// un-fixmed — not a placeholder that would already pass (CODEX HARN-021). We
// can't cheaply un-skip every fixme in a browser here, but we CAN reject the
// fake-test class statically: a fixme body that never observes the app (no
// page/harness/testid/tx interaction) cannot possibly fail for a product reason.
function checkFixmeValidity(): boolean {
  const testsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'tests')
  const APP_SIGNALS = [
    'page.',
    'harness.',
    'getByTestId',
    'boundaryRequests',
    'txLog',
    'decodeFunctionData',
    'toBeVisible',
    'toBeEnabled',
    'toBeDisabled',
    'toHaveCount',
  ]
  const specFiles: string[] = []
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, entry.name)
      if (entry.isDirectory()) walk(p)
      else if (entry.name.endsWith('.spec.ts')) specFiles.push(p)
    }
  }
  walk(testsDir)
  let ok = true
  let count = 0
  for (const file of specFiles) {
    const lines = readFileSync(file, 'utf8').split('\n')
    for (let i = 0; i < lines.length; i++) {
      if (!/test\.fixme\(/.test(lines[i])) continue
      count++
      let end = i + 1
      while (
        end < lines.length &&
        end < i + 80 &&
        !/\btest(\.fixme)?\(/.test(lines[end])
      ) {
        end++
      }
      // Strip comments FIRST — a signal must appear in executable code, not in
      // a descriptive comment. Without this, a placeholder fixme that only
      // *mentions* `page.`/`txLog` in prose would pass (CODEX: the raw-text scan
      // is too weak). This lint still cannot prove a fixme FAILS when un-skipped
      // (that needs a browser run) — it only rejects the never-observes-the-app
      // class. HARN-021 stays PARTIAL until a runtime unfix-and-require-fail gate.
      const body = lines
        .slice(i, end)
        .join('\n')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/[^\n]*/g, '')
      if (!APP_SIGNALS.some((s) => body.includes(s))) {
        console.error(
          `FAIL: placeholder fixme at ${relative(process.cwd(), file)}:${i + 1} — it never observes the app (no page/harness/testid/tx). A fixme must assert desired behavior that fails when un-fixmed.`
        )
        ok = false
      }
    }
  }
  if (ok) {
    console.log(`ok: all ${count} test.fixme cases observe real app behavior (no placeholder fixmes)`)
  }
  return ok
}

console.log('Checking e2e snapshots...\n')
const results = [
  checkAge(),
  checkStructure(),
  checkCoverage(),
  checkYieldCollisions(),
  checkFixmeValidity(),
]
if (results.some((r) => !r)) process.exit(1)
console.log('\nAll checks passed.')
