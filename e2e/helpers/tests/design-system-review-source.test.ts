import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { setImmediate } from 'node:timers/promises'
import { afterEach, expect, test, vi } from 'vitest'
import {
  assertUnchangedSource,
  readReviewSource,
  requireReviewAttachments,
  watchReviewSource,
} from '../../design-system/review-source'

const roots: string[] = []

afterEach(() =>
  roots.splice(0).forEach((root) => rmSync(root, { recursive: true }))
)

const fixture = () => {
  const root = mkdtempSync(join(tmpdir(), 'review-source-'))
  roots.push(root)
  mkdirSync(join(root, 'src'))
  writeFileSync(join(root, 'src', 'view.tsx'), 'first')
  writeFileSync(join(root, 'pnpm-lock.yaml'), 'locked')
  return root
}

test('records individual source content and ignores generated reports', () => {
  const root = fixture()
  const before = readReviewSource(root)
  mkdirSync(join(root, 'test-results'))
  writeFileSync(join(root, 'test-results', 'report.json'), 'report')
  expect(readReviewSource(root)).toEqual(before)
  expect(before.files.map((file) => file.path)).toContain('src/view.tsx')
  expect(before.files.every((file) => /^[a-f0-9]{64}$/.test(file.sha256))).toBe(
    true
  )
})

test('fails when source changed without a different commit or dirty boolean', () => {
  const root = fixture()
  const before = readReviewSource(root)
  writeFileSync(join(root, 'src', 'view.tsx'), 'second')
  expect(() => assertUnchangedSource(before, readReviewSource(root))).toThrow(
    /source changed/i
  )
})

test('serialized evidence excludes private configuration while edits still invalidate capture', () => {
  const root = fixture()
  const publicOnly = readReviewSource(root)
  writeFileSync(join(root, '.env'), 'SYNTHETIC_SECRET=private-first')
  const before = readReviewSource(root)
  expect(JSON.stringify(before)).toBe(JSON.stringify(publicOnly))
  expect(() => assertUnchangedSource(publicOnly, before)).toThrow()
  writeFileSync(join(root, '.env'), 'SYNTHETIC_SECRET=private-second')
  const after = readReviewSource(root)
  expect(JSON.stringify(after)).toBe(JSON.stringify(before))
  expect(() => assertUnchangedSource(before, after)).toThrow()
  expect(() =>
    assertUnchangedSource(after, readReviewSource(root))
  ).not.toThrow()
})

test('includes new source and dependency changes, not only tracked files', () => {
  const root = fixture()
  const before = readReviewSource(root)
  writeFileSync(join(root, 'src', 'added.tsx'), 'added')
  expect(() => assertUnchangedSource(before, readReviewSource(root))).toThrow()
  const withNewSource = readReviewSource(root)
  writeFileSync(join(root, 'pnpm-lock.yaml'), 'different dependencies')
  expect(() =>
    assertUnchangedSource(withNewSource, readReviewSource(root))
  ).toThrow()
})

test('rejects a run that observed a change even if source was restored', () => {
  const source = readReviewSource(fixture())
  expect(() => assertUnchangedSource(source, source, ['src/view.tsx'])).toThrow(
    /source changed/i
  )
})

test('observes actual source edits and closes its owned watcher', async () => {
  const root = fixture()
  const before = readReviewSource(root)
  const guard = watchReviewSource(root)
  try {
    await setImmediate()
    writeFileSync(join(root, 'src', 'view.tsx'), 'changed')
    await vi.waitFor(
      // Native backends may coalesce a file edit into its directory event.
      () =>
        expect([...guard.changes]).toEqual(
          expect.arrayContaining([expect.stringMatching(/^src(?:\/|$)/)])
        ),
      { timeout: 5_000 }
    )
    writeFileSync(join(root, 'src', 'view.tsx'), 'first')
    expect(readReviewSource(root)).toEqual(before)
    expect(() =>
      assertUnchangedSource(before, readReviewSource(root), [...guard.changes])
    ).toThrow(/source changed/i)
  } finally {
    guard.close()
  }
}, 7_500)

test('missing required capture cannot pass as a complete review record', () => {
  expect(() =>
    requireReviewAttachments(['source'], ['source', 'open'])
  ).toThrow('Missing review evidence: open')
  expect(() =>
    requireReviewAttachments(['source', 'open'], ['source', 'open'])
  ).not.toThrow()
})
