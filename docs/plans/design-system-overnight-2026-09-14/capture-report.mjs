import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const [source, destination, selection = '(?!)'] = process.argv.slice(2)
if (!source || !destination)
  throw new Error('Expected report, destination, image selection regex')
const raw = fs.readFileSync(source)
const report = JSON.parse(raw)
const selected = new RegExp(selection)
const hash = (body) => crypto.createHash('sha256').update(body).digest('hex')
const records = []
fs.mkdirSync(destination, { recursive: true })

function walk(suite, parents = []) {
  const trail = [...parents, suite.title].filter(Boolean)
  for (const spec of suite.specs ?? []) {
    for (const test of spec.tests ?? []) {
      records.push({
        file: spec.file,
        line: spec.line,
        title: [...trail, spec.title].join(' / '),
        status: test.status,
        expectedStatus: test.expectedStatus,
        results: test.results.map((result) => ({
          status: result.status,
          duration: result.duration,
          retry: result.retry,
          errors: result.errors,
          attachments: (result.attachments ?? []).map((attachment) => {
            const body = attachment.body
              ? Buffer.from(attachment.body, 'base64')
              : attachment.path && fs.existsSync(attachment.path)
                ? fs.readFileSync(attachment.path)
                : undefined
            if (!body)
              return {
                name: attachment.name,
                contentType: attachment.contentType,
              }
            const digest = hash(body)
            const item = {
              name: attachment.name,
              contentType: attachment.contentType,
              bytes: body.length,
              sha256: digest,
            }
            if (
              attachment.contentType === 'image/png' &&
              selected.test(`${spec.title}::${attachment.name}`)
            ) {
              const stem = `${spec.title}-${attachment.name}`
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .slice(0, 130)
              item.file = `${stem}-${digest.slice(0, 8)}.png`
              fs.writeFileSync(path.join(destination, item.file), body)
            } else if (attachment.contentType === 'text/plain') {
              item.text = body.toString('utf8')
            }
            return item
          }),
        })),
      })
    }
  }
  for (const child of suite.suites ?? []) walk(child, trail)
}
walk(report)
const result = {
  rawReportSha256: hash(raw),
  stats: report.stats,
  errors: report.errors,
  records,
}
fs.writeFileSync(
  path.join(destination, 'results.json'),
  `${JSON.stringify(result, null, 2)}\n`
)
console.log(
  JSON.stringify({
    stats: report.stats,
    retainedImages: records
      .flatMap((r) => r.results.flatMap((v) => v.attachments))
      .filter((a) => a.file).length,
  })
)
