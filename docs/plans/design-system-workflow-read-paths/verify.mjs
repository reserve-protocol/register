import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const base = '49f9f22ae94d579b4c530de845e8637d299a9c7d'
const read = (file) => readFileSync(file, 'utf8')
const previous = (file) =>
  execFileSync('git', ['show', `${base}:${file}`], { encoding: 'utf8' })
const normalized = (text) => text.replace(/\s+/g, ' ').trim()
const words = (text) => text.trim().split(/\s+/).length
const section = (text, start, end) => {
  const from = text.indexOf(start)
  assert.notEqual(from, -1, start)
  const to = end ? text.indexOf(end, from) : text.length
  assert.notEqual(to, -1, end)
  return text.slice(from, to).trim()
}
const labFile = 'src/views/internal/design-system/CLAUDE.md'
const planFile = 'docs/plans/design-system-v1.md'
const labBefore = previous(labFile)
const lab = read(labFile)
const planBefore = previous(planFile)
const plan = read(planFile)
const guideRoot = 'src/views/internal/design-system/guidance'
const moves = [
  ['charts', '`charts/` starts', '## Retained table and auction references'],
  [
    'auction-tables',
    'The retained navigation-only current table',
    'The unfinished, deferred Auctions workspace',
  ],
  [
    'auction-workspace',
    'The unfinished, deferred Auctions workspace',
    'The retained history projection',
  ],
  [
    'auction-tables',
    'The retained history projection',
    'Auction browse records live',
  ],
  [
    'auction-tables',
    'Auction browse records live',
    'Owned Portfolio positions live',
  ],
  ['table-records', 'Owned Portfolio positions live', undefined],
]
for (const [guide, start, end] of moves) {
  const moved = read(`${guideRoot}/${guide}.md`).replace(/\]\(\.\.\//g, '](')
  assert(
    normalized(moved).includes(normalized(section(labBefore, start, end))),
    start
  )
  assert(!lab.includes(start), `Unremoved duplicate: ${start}`)
  assert(lab.includes(`guidance/${guide}.md`), `Missing route: ${guide}`)
}
assert.equal(
  normalized(
    section(labBefore, '# Design-system lab', '## Current review boundary')
  ),
  normalized(section(lab, '# Design-system lab', '## Family-specific guidance'))
)
const oldRegister = section(
  planBefore,
  '### Deferred engineering-review register',
  '## Unresolved decisions'
)
const register = read('docs/plans/design-system-engineering-handoff.md')
const rows = (text) =>
  text
    .split('\n')
    .filter((line) => line.startsWith('|'))
    .map(normalized)
assert.deepEqual(rows(register), rows(oldRegister))
assert(plan.includes('### Deferred engineering-review register'))
assert(
  plan.includes(
    '[engineering handoff register](design-system-engineering-handoff.md)'
  )
)
const originalPolicy = section(
  oldRegister,
  'Engineering review is deferred',
  '| Review surface'
)
assert(
  normalized(plan).includes(
    normalized(
      originalPolicy.replace(
        'specific row here',
        'specific row in the linked register'
      )
    )
  )
)
assert(
  normalized(plan).includes(
    normalized(section(oldRegister, 'Exploratory lab-only treatments'))
  )
)
assert(lab.includes('Shared lab-host changes load each affected'))
assert(
  lab.includes(
    'Read only for explicitly authorized work on that deferred workspace.'
  )
)

const changed = [
  ...new Set(
    [
      ...execFileSync('git', ['diff', '--name-only', base, '-z'], {
        encoding: 'utf8',
      }).split('\0'),
      ...execFileSync(
        'git',
        ['ls-files', '--others', '--exclude-standard', '-z'],
        { encoding: 'utf8' }
      ).split('\0'),
    ].filter(Boolean)
  ),
]
const pilotRoot = 'docs/plans/design-system-mobile-axis-pilot'
const archivedImages = new Map(
  [
    ...read(`${pilotRoot}/README.md`).matchAll(
      /\]\((evidence\/[^)]+\.png)\)\s*\|\s*`([a-f0-9]{64})`/g
    ),
  ].map(([, file, hash]) => [`${pilotRoot}/${file}`, hash])
)
assert.equal(archivedImages.size, 6, 'Pilot archive must retain six captures')
for (const [file, hash] of archivedImages) {
  assert.equal(
    createHash('sha256').update(readFileSync(file)).digest('hex'),
    hash,
    `Pilot capture changed: ${file}`
  )
}
for (const file of changed) {
  assert(
    file.endsWith('.md') ||
      archivedImages.has(file) ||
      file === 'docs/plans/design-system-workflow-read-paths/verify.mjs',
    `Non-document change: ${file}`
  )
}
const slug = (heading) =>
  heading
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .replace(/ /g, '-')
let linksChecked = 0
for (const file of changed.filter((file) => file.endsWith('.md'))) {
  let content = read(file)
  if (file === 'docs/wiki/log.md') {
    const original = previous(file)
    assert(content.startsWith(original), 'Existing append-only log changed')
    content = content.slice(original.length)
  }
  for (const [, target] of content.matchAll(/\]\(([^)]+)\)/g)) {
    if (/^(https?:|mailto:)/.test(target)) continue
    const [relative, anchor] = target.split('#')
    const resolved = relative
      ? path.resolve(path.dirname(file), relative)
      : path.resolve(file)
    assert(existsSync(resolved), `${file}: missing ${target}`)
    if (anchor && resolved.endsWith('.md')) {
      const headings = [...read(resolved).matchAll(/^#{1,6} (.+)$/gm)].map(
        ([, title]) => slug(title)
      )
      assert(headings.includes(anchor), `${file}: missing anchor ${target}`)
    }
    linksChecked++
  }
}
const counts = Object.fromEntries(
  [planFile, labFile].map((file) => [
    file,
    { before: words(previous(file)), after: words(read(file)) },
  ])
)
const guides = Object.fromEntries(
  [...new Set(moves.map(([id]) => id))].map((id) => [
    id,
    words(read(`${guideRoot}/${id}.md`)),
  ])
)
console.log(
  JSON.stringify(
    {
      base,
      guidanceBlocksPreserved: moves.length,
      engineeringRowsPreserved: rows(register).length - 2,
      pilotCaptureHashesVerified: archivedImages.size,
      linksChecked,
      runtimeChanges: 0,
      wordCounts: counts,
      guideWordCounts: guides,
      chartPathSelectedDocuments: {
        before: words(planBefore) + words(labBefore),
        after: words(plan) + words(lab) + guides.charts,
        excludes:
          'Unchanged root/skill/catalog/product/test reading; not a total-context or token measurement',
      },
      behavior:
        'Static route/preservation and archive checks only; no live-agent compliance or cost measurement',
    },
    null,
    2
  )
)
