import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))
const files = fs
  .readdirSync(root, { recursive: true })
  .filter((file) => fs.statSync(path.join(root, file)).isFile())
const errors = []
let links = 0
let images = 0
for (const file of files.filter((file) => file.endsWith('.md'))) {
  const absolute = path.join(root, file)
  const markdown = fs
    .readFileSync(absolute, 'utf8')
    .replace(/```[\s\S]*?```/g, '')
  for (const [, target] of markdown.matchAll(/\]\(([^\s)]+)\)/g)) {
    if (/^(https?:|#)/.test(target)) continue
    links++
    const destination = path.resolve(
      path.dirname(absolute),
      target.split('#')[0]
    )
    if (!fs.existsSync(destination)) errors.push(`${file}: missing ${target}`)
  }
}
for (const file of files.filter((file) => file.endsWith('/results.json'))) {
  const report = JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'))
  for (const record of report.records) {
    for (const result of record.results) {
      for (const attachment of result.attachments.filter((item) => item.file)) {
        const data = fs.readFileSync(
          path.join(root, path.dirname(file), attachment.file)
        )
        const digest = crypto.createHash('sha256').update(data).digest('hex')
        if (digest !== attachment.sha256 || data.length !== attachment.bytes)
          errors.push(`${file}: mismatched ${attachment.file}`)
        images++
      }
    }
  }
}
console.log(JSON.stringify({ links, images, errors }))
if (errors.length) process.exitCode = 1
