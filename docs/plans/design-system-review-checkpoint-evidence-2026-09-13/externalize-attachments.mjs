import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const directory = dirname(fileURLToPath(import.meta.url))
const storage = resolve(directory, 'attachments')
mkdirSync(storage, { recursive: true })

for (const input of process.argv.slice(2)) {
  const reportPath = resolve(input)
  const original = readFileSync(reportPath)
  const report = JSON.parse(original)
  const canonical = (value) =>
    JSON.stringify(value, (_key, item) =>
      item && typeof item === 'object' && !Array.isArray(item)
        ? Object.fromEntries(
            Object.entries(item).sort(([a], [b]) => a.localeCompare(b))
          )
        : item
    )
  const digest = (value) =>
    createHash('sha256').update(canonical(value)).digest('hex')
  const originalDigest = digest(report)
  const originals = new Map()
  const before = []
  const after = []
  let count = 0
  function visit(value) {
    if (!value || typeof value !== 'object') return
    if (Array.isArray(value.attachments)) {
      for (const attachment of value.attachments) {
        if (typeof attachment.body !== 'string') continue
        originals.set(attachment, { ...attachment })
        const bytes = Buffer.from(attachment.body, 'base64')
        const hash = createHash('sha256').update(bytes).digest('hex')
        const extension =
          attachment.contentType === 'image/png'
            ? 'png'
            : attachment.contentType === 'application/json'
              ? 'json'
              : 'txt'
        const destination = resolve(storage, `${hash}.${extension}`)
        if (!existsSync(destination))
          writeFileSync(destination, bytes, { flag: 'wx' })
        attachment.path = relative(dirname(reportPath), destination)
        delete attachment.body
        before.push(hash)
        after.push(
          createHash('sha256').update(readFileSync(destination)).digest('hex')
        )
        count += 1
      }
    }
    for (const item of Object.values(value)) {
      if (Array.isArray(item)) item.forEach(visit)
      else if (item && typeof item === 'object') visit(item)
    }
  }
  visit(report)
  if (JSON.stringify(before) !== JSON.stringify(after))
    throw new Error('Attachment mismatch')
  const restored = JSON.parse(
    JSON.stringify(report, (_key, value) => {
      const previous = originals.get(value)
      if (!previous) return value
      return {
        ...previous,
        body: readFileSync(resolve(dirname(reportPath), value.path)).toString(
          'base64'
        ),
      }
    })
  )
  if (digest(restored) !== originalDigest)
    throw new Error('Report round-trip mismatch')
  const output = JSON.stringify(report, null, 2) + '\n'
  writeFileSync(reportPath, output)
  process.stdout.write(
    JSON.stringify({
      path: input,
      attachments: count,
      beforeBytes: original.length,
      afterBytes: Buffer.byteLength(output),
      roundTripDigest: originalDigest,
    }) + '\n'
  )
}
