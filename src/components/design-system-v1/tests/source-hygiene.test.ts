import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { expect, test } from 'vitest'
import { v1Typography } from '../typography'
import { inspectStyleSource } from './source-hygiene'
import tailwind from '../../../../tailwind.config'

const roots = [
  'design-system-v1',
  'button',
  'icon-button',
  'checkbox',
  'dialog',
  'entity-identity',
  'metric',
  'lifecycle-status',
  'empty-state',
]
const knownVariables = new Set([
  ...[...readFileSync('src/app.css', 'utf8').matchAll(/(--[\w-]+)\s*:/g)].map(
    (match) => match[1]
  ),
  '--inline-message-surface',
  '--inline-message-icon-surface',
])
const colorTokens = new Set<string>()
const collectColors = (value: Record<string, unknown>, prefix = '') => {
  for (const [name, definition] of Object.entries(value)) {
    const token =
      name === 'DEFAULT' ? prefix : [prefix, name].filter(Boolean).join('-')
    if (typeof definition === 'string') colorTokens.add(token)
    else collectColors(definition as Record<string, unknown>, token)
  }
}
collectColors(tailwind.theme.extend.colors)

// Existing overlay scrims remain unchanged until an accepted semantic owner replaces them.
const overlayExceptions: Record<string, ReadonlySet<string>> = {
  'design-system-v1/drawer.tsx': new Set([
    'inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 motion-reduce:animate-none',
  ]),
  'dialog/index.tsx': new Set([
    'fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
  ]),
}

test('rejects colors and duplicated typography while allowing owned geometry and platform variables', () => {
  expect(
    inspectStyleSource(
      'const classes = "bg-blue-500 text-[#ffffff]"',
      knownVariables,
      {}
    )
  ).toHaveLength(2)
  expect(
    inspectStyleSource(
      'const classes = "text-base font-light leading-6"',
      knownVariables,
      v1Typography
    )
  ).toHaveLength(1)
  expect(
    inspectStyleSource(
      'const classes = "bg-[var(--invented-surface)]"',
      knownVariables,
      {}
    )
  ).toEqual(['unknown variable: --invented-surface'])
  expect(
    inspectStyleSource(
      'const classes = "w-[39rem] rounded-[4px] max-h-[var(--radix-select-content-available-height)] bg-card"',
      knownVariables,
      v1Typography
    )
  ).toEqual([])
})

test('canonical owners consume semantic colors and reviewed typography', () => {
  const violations: string[] = []
  for (const root of roots) {
    const directory = resolve('src/components', root)
    for (const file of readdirSync(directory)) {
      if (!/\.tsx?$/.test(file) || file === 'typography.ts') continue
      const path = `${directory}/${file}`
      const source = readFileSync(path, 'utf8')
      const permitted = overlayExceptions[`${root}/${file}`]
      violations.push(
        ...inspectStyleSource(
          source,
          knownVariables,
          v1Typography,
          permitted,
          colorTokens
        ).map((finding) => `${root}/${file}: ${finding}`)
      )
    }
  }
  expect(violations).toEqual([])
})

test('named semantic utilities resolve to registered aliases', () => {
  expect(
    inspectStyleSource(
      'const x = "bg-feedback-invented"',
      knownVariables,
      {},
      new Set(),
      colorTokens
    )
  ).toEqual(['unknown semantic utility: feedback-invented'])
  expect(
    inspectStyleSource(
      'const x = "bg-feedback-warning-surface ring-status-neutral-border text-supporting-foreground"',
      knownVariables,
      {},
      new Set(),
      colorTokens
    )
  ).toEqual([])
  const { surface, status, disabled, feedback, supporting } =
    tailwind.theme.extend.colors
  for (const definition of JSON.stringify({
    surface,
    status,
    disabled,
    feedback,
    supporting,
  }).matchAll(/var\((--[\w-]+)/g)) {
    expect(knownVariables.has(definition[1]), definition[1]).toBe(true)
  }
})

test('important modifiers and reordered type recipes cannot bypass the scoped checks', () => {
  for (const classes of ['!bg-red-500', 'hover:!bg-red-500']) {
    expect(inspectStyleSource(JSON.stringify(classes), knownVariables, {})).toHaveLength(1)
  }
  expect(inspectStyleSource('"data-[state=checked]:!bg-feedback-invented"', knownVariables, {}, new Set(), colorTokens)).toEqual(['unknown semantic utility: feedback-invented'])
  expect(inspectStyleSource('"leading-6 font-light text-base"', knownVariables, v1Typography)).toHaveLength(1)
  expect(inspectStyleSource('"hover:!bg-feedback-warning-surface w-[39rem]"', knownVariables, v1Typography, new Set(), colorTokens)).toEqual([])
})
