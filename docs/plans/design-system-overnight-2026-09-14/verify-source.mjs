import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const [mode, root, manifest] = process.argv.slice(2)
if (!['capture', 'compare'].includes(mode) || !root || !manifest)
  throw new Error('Usage: verify-source.mjs capture|compare root manifest')
const { readReviewSource } = await import(
  pathToFileURL(resolve(root, 'e2e/design-system/review-source.ts'))
)
const current = readReviewSource(root)
if (mode === 'capture') {
  writeFileSync(manifest, JSON.stringify(current, null, 2) + '\n')
  console.log(
    JSON.stringify({ digest: current.digest, files: current.files.length })
  )
} else {
  const before = JSON.parse(readFileSync(manifest, 'utf8'))
  const oldFiles = new Map(before.files.map((file) => [file.path, file.sha256]))
  const newFiles = new Map(
    current.files.map((file) => [file.path, file.sha256])
  )
  const changed = [...new Set([...oldFiles.keys(), ...newFiles.keys()])].filter(
    (path) => oldFiles.get(path) !== newFiles.get(path)
  )
  console.log(
    JSON.stringify({ before: before.digest, after: current.digest, changed })
  )
  if (changed.length) process.exitCode = 1
}
