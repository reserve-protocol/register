import type { Page } from '@playwright/test'
import { setMockNow } from './rpc'

// Freeze browser time at a fixed point. Date.now()/new Date()/timers all read
// this frozen value; advance with page.clock.runFor(ms) to trigger polling.
// Call BEFORE page.goto() for full coverage. Governance/rebalance states are
// pinned by combining this with the *Time helpers below, so tests don't rot as
// snapshots age. Also freezes the Node-side mock time so block/feed timestamps
// served by the RPC mock agree with the browser's frozen world.
let frozenMs: number | undefined

// Called by the base fixture at teardown — a stale frozen value would make
// advanceTime desync the next test's clocks.
export function resetFrozenTime() {
  frozenMs = undefined
}

export async function freezeTime(page: Page, timestampSeconds: number) {
  frozenMs = timestampSeconds * 1000
  await page.clock.install({ time: frozenMs })
  await page.clock.pauseAt(frozenMs)
  setMockNow(frozenMs)
}

// Advance BOTH clocks in lockstep. Raw page.clock.runFor() moves only the
// browser, silently desyncing block/feed timestamps served by the RPC mock —
// use this everywhere a frozen test pumps timers (Codex audit item 9).
export async function advanceTime(page: Page, ms: number) {
  await page.clock.runFor(ms)
  if (frozenMs !== undefined) {
    frozenMs += ms
    setMockNow(frozenMs)
  }
}

// A timestamp (seconds) placed inside/around a proposal's voting window, read
// from snapshot data so the frozen clock lands the proposal in a known phase.
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

// A timestamp (seconds) relative to a rebalance's auction window.
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
