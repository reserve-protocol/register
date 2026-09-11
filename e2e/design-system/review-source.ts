import { createHash } from 'node:crypto'
import {
  existsSync,
  lstatSync,
  readFileSync,
  readdirSync,
  readlinkSync,
  watch,
} from 'node:fs'
import { join } from 'node:path'

const directories = [
  'src',
  'public',
  'e2e/design-system',
  'e2e/fixtures',
  'e2e/helpers',
]
const rootFiles = [
  'index.html',
  'package.json',
  'pnpm-lock.yaml',
  'pnpm-workspace.yaml',
  'vite.config.ts',
  'tailwind.config.ts',
  'postcss.config.js',
  'lingui.config.ts',
  'playwright.design-system.config.ts',
  'tsconfig.json',
]
const hash = (value: string | Buffer) =>
  createHash('sha256').update(value).digest('hex')
const privateConfiguration = new WeakMap<object, string>()
const isEnvironmentFile = (path: string) => /^\.env($|\.)/.test(path)

export const isReviewSource = (path: string) =>
  rootFiles.includes(path) ||
  isEnvironmentFile(path) ||
  directories.some(
    (directory) => path === directory || path.startsWith(`${directory}/`)
  )

export const readReviewSource = (root: string) => {
  const files: { path: string; sha256: string }[] = []
  const visit = (path: string) => {
    const absolute = join(root, path)
    if (!existsSync(absolute)) return
    const stat = lstatSync(absolute)
    if (stat.isSymbolicLink()) {
      files.push({ path, sha256: hash(`symlink:${readlinkSync(absolute)}`) })
    } else if (stat.isDirectory()) {
      for (const child of readdirSync(absolute).sort())
        visit(`${path}/${child}`)
    } else if (stat.isFile()) {
      files.push({ path, sha256: hash(readFileSync(absolute)) })
    }
  }
  const envFiles = readdirSync(root).filter(isEnvironmentFile)
  for (const path of [...directories, ...rootFiles, ...envFiles]) visit(path)
  files.sort((a, b) => a.path.localeCompare(b.path))
  const publicFiles = files.filter((file) => !isEnvironmentFile(file.path))
  const source = {
    digest: hash(JSON.stringify(publicFiles)),
    files: publicFiles,
  }
  // Private fingerprints must never be serializable into retained evidence.
  privateConfiguration.set(
    source,
    hash(JSON.stringify(files.filter((file) => isEnvironmentFile(file.path))))
  )
  return source
}

export const assertUnchangedSource = (
  before: ReturnType<typeof readReviewSource>,
  after: ReturnType<typeof readReviewSource>,
  observedChanges: string[] = []
) => {
  if (
    !privateConfiguration.has(before) ||
    !privateConfiguration.has(after) ||
    privateConfiguration.get(before) !== privateConfiguration.get(after) ||
    before.digest !== after.digest ||
    observedChanges.length
  ) {
    throw new Error(
      'Review source changed during capture; discard this run and repeat from stable source.'
    )
  }
}

export const watchReviewSource = (root: string) => {
  const changes = new Set<string>()
  const watchers: ReturnType<typeof watch>[] = []
  const close = () => watchers.forEach((watcher) => watcher.close())
  try {
    for (const directory of ['', ...directories]) {
      if (!existsSync(join(root, directory))) continue
      const watcher = watch(
        join(root, directory),
        { recursive: directory !== '' },
        (_event, filename) => {
          const name = filename?.toString().replaceAll('\\', '/')
          const path = directory && name ? `${directory}/${name}` : name
          if (
            !path ||
            isReviewSource(path) ||
            directories.some((dir) => dir.startsWith(`${path}/`))
          )
            changes.add(path ?? 'unknown')
        }
      )
      watchers.push(watcher)
      watcher.on('error', () => changes.add('watcher-error'))
    }
  } catch (error) {
    close()
    throw error
  }
  return { changes, close }
}

export const requireReviewAttachments = (
  actual: string[],
  required: string[]
) => {
  const missing = required.filter((name) => !actual.includes(name))
  if (missing.length)
    throw new Error(`Missing review evidence: ${missing.join(', ')}`)
}
