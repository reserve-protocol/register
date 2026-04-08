import type { Page } from '@playwright/test'

/**
 * Freeze browser time at a fixed point.
 * All Date.now(), new Date(), setTimeout, setInterval use this frozen time.
 * Advance with page.clock.runFor(ms) when needed (e.g. to trigger polling).
 *
 * Must be called BEFORE page.goto() for full coverage.
 */
export async function freezeTime(page: Page, timestampSeconds: number) {
  await page.clock.install({ time: timestampSeconds * 1000 })
  await page.clock.pauseAt(timestampSeconds * 1000)
}

/**
 * Calculate a timestamp relative to a proposal's voting window.
 * Reads timestamps FROM snapshot data to coordinate with frozen time.
 */
export function proposalTime(
  proposal: { voteStart: string; voteEnd: string },
  phase: 'pending' | 'active' | 'ended'
): number {
  const start = Number(proposal.voteStart)
  const end = Number(proposal.voteEnd)

  switch (phase) {
    case 'pending':
      return start - 3600
    case 'active':
      return start + Math.floor((end - start) / 2)
    case 'ended':
      return end + 3600
  }
}

/**
 * Calculate a timestamp relative to a rebalance's auction window.
 * Reads timestamps FROM snapshot data to coordinate with frozen time.
 */
export function rebalanceTime(
  rebalance: { restrictedUntil: string; availableUntil: string },
  phase: 'restricted' | 'permissionless' | 'expired'
): number {
  const restricted = Number(rebalance.restrictedUntil)
  const available = Number(rebalance.availableUntil)

  switch (phase) {
    case 'restricted':
      return restricted - 60
    case 'permissionless':
      return restricted + 60
    case 'expired':
      return available + 60
  }
}
