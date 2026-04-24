/**
 * Snapshot staleness check — verifies snapshots are fresh and schema hasn't drifted.
 *
 * Usage: npx tsx e2e/scripts/check-snapshots.ts
 *
 * Exits with code 1 if snapshots are stale (>30 days) or schema has drifted.
 */

import { readFileSync, readdirSync, statSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const snapshotsDir = join(__dirname, '..', 'snapshots')

const MAX_AGE_DAYS = 30

function getSnapshotFiles(dir: string): string[] {
  const files: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      files.push(...getSnapshotFiles(full))
    } else if (entry.endsWith('.json') && entry !== '_meta.json') {
      files.push(full)
    }
  }
  return files
}

function checkAge() {
  const metaPath = join(snapshotsDir, '_meta.json')
  let capturedAt: string

  try {
    const raw = JSON.parse(readFileSync(metaPath, 'utf-8'))
    capturedAt = raw.data?.capturedAt ?? raw._meta?.capturedAt
  } catch {
    console.error('✗ No _meta.json found. Run "npm run e2e:capture" first.')
    return false
  }

  const age = Date.now() - new Date(capturedAt).getTime()
  const days = Math.floor(age / (1000 * 60 * 60 * 24))

  if (days > MAX_AGE_DAYS) {
    console.warn(
      `⚠ Snapshots are ${days} days old (captured ${capturedAt}). Run "npm run e2e:capture" to refresh.`
    )
    return false
  }

  console.log(`✓ Snapshots are ${days} day(s) old (captured ${capturedAt})`)
  return true
}

function checkStructure() {
  const files = getSnapshotFiles(snapshotsDir)
  let valid = true

  for (const file of files) {
    try {
      const raw = JSON.parse(readFileSync(file, 'utf-8'))

      if (!raw._meta) {
        console.warn(`⚠ Missing _meta in ${file.replace(snapshotsDir + '/', '')}`)
        valid = false
        continue
      }

      if (raw.data === undefined || raw.data === null) {
        console.warn(
          `⚠ Empty data in ${file.replace(snapshotsDir + '/', '')}`
        )
        valid = false
      }
    } catch (e) {
      console.error(
        `✗ Invalid JSON: ${file.replace(snapshotsDir + '/', '')}: ${(e as Error).message}`
      )
      valid = false
    }
  }

  if (valid) {
    console.log(`✓ All ${files.length} snapshot files have valid structure`)
  }

  return valid
}

function main() {
  console.log('Checking e2e snapshots...\n')

  const ageOk = checkAge()
  const structureOk = checkStructure()

  if (!ageOk || !structureOk) {
    process.exit(1)
  }

  console.log('\nAll checks passed.')
}

main()
