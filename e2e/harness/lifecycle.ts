import { expect, type Locator } from '@playwright/test'

// Loading-lifecycle helpers built on the harness hold gate. The L0→L3 model:
//   L0 blank    — route mounts, container present, no crash
//   L1 skeleton — right shape/count, occupies the content's box (no reflow)
//   L2 partial  — each island resolves independently; resolving A must not shift B
//   L3 full     — all islands resolved → behavior/value assertions
// Freeze L1/L2 by holding a boundary (`harness.mock.hold(...)`), assert, then
// release and assert the content in the SAME box via `expectStableBox`.

export interface Box {
  x: number
  y: number
  width: number
  height: number
}

// Largest single-axis movement between two boxes, in px. Pure — unit-tested.
export function maxDelta(a: Box, b: Box): number {
  return Math.max(
    Math.abs(a.x - b.x),
    Math.abs(a.y - b.y),
    Math.abs(a.width - b.width),
    Math.abs(a.height - b.height)
  )
}

// Largest POSITION movement (ignores width/height) — for an island whose content
// legitimately resizes (skeleton→value) but must not MOVE. Pure — unit-tested.
export function maxPositionDelta(a: Box, b: Box): number {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y))
}

// Assert a locator's box doesn't move more than `budgetPx` across `action`
// (typically releasing a hold so an island resolves). A small budget tolerates
// intentional micro-animations (balance card, cover collapse) per the CLS
// decision; 0 asserts a hard no-reflow.
export async function expectStableBox(
  locator: Locator,
  action: () => Promise<void>,
  budgetPx = 2
): Promise<void> {
  await measureAcross(locator, action, budgetPx, maxDelta, 'box')
}

// Like expectStableBox but ignores size changes — the island may resize
// (skeleton→value) as long as its top-left corner holds.
export async function expectStablePosition(
  locator: Locator,
  action: () => Promise<void>,
  budgetPx = 2
): Promise<void> {
  await measureAcross(locator, action, budgetPx, maxPositionDelta, 'position')
}

async function measureAcross(
  locator: Locator,
  action: () => Promise<void>,
  budgetPx: number,
  metric: (a: Box, b: Box) => number,
  label: string
): Promise<void> {
  const before = await locator.boundingBox()
  await action()
  const after = await locator.boundingBox()
  if (!before) throw new Error(`layoutShift: locator had no box BEFORE the action`)
  if (!after) throw new Error(`layoutShift: locator had no box AFTER the action`)
  const delta = metric(before, after)
  expect(
    delta,
    `${label} shifted ${delta.toFixed(1)}px (budget ${budgetPx}px): ${JSON.stringify({ before, after })}`
  ).toBeLessThanOrEqual(budgetPx)
}
