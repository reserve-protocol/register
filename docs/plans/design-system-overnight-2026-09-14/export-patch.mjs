import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const [primary, isolated, destination] = process.argv.slice(2)
if (!primary || !isolated || !destination)
  throw new Error('Expected primary, isolated and output patch paths')
const files = [
  'src/views/internal/design-system/table-family/earn-columns.tsx',
  'src/views/internal/design-system/table-family/owned-columns.tsx',
  'e2e/design-system/overnight-lab-regressions.spec.ts',
]
let patch = ''
for (const file of files) {
  const original = path.join(primary, file)
  const before = fs.existsSync(original) ? original : '/dev/null'
  const after = path.join(isolated, file)
  const result = spawnSync('git', ['diff', '--no-index', '--', before, after], {
    encoding: 'utf8',
  })
  if (result.status !== 0 && result.status !== 1) throw new Error(result.stderr)
  patch += result.stdout
    .replaceAll(`a${before}`, `a/${file}`)
    .replaceAll(`b${after}`, `b/${file}`)
    .replaceAll(`a${after}`, `a/${file}`)
}
fs.writeFileSync(destination, patch)
console.log(JSON.stringify({ files, bytes: Buffer.byteLength(patch) }))
