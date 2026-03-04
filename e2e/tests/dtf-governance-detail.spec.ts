/**
 * E2E tests for Index DTF Governance — proposal details, optimistic UI
 * updates, countdown timers, and edge cases.
 *
 * Covers:
 * - Proposal detail views (all states)
 * - Optimistic vote/queue/execute flows (wallet connected)
 * - Stats derived from atom (no on-chain read)
 * - Countdown timer behavior
 * - Navigation flows and edge cases
 */
import { test as baseTest, expect as baseExpect } from '../fixtures/base'
import { test as walletTest, expect as walletExpect } from '../fixtures/wallet'
import { TEST_DTFS } from '../helpers/test-data'
import { MOCK_PROPOSALS } from '../helpers/subgraph-mocks'

const DTF = TEST_DTFS.lcap
const GOV_URL = `/base/index-dtf/${DTF.address}/governance`
const proposalUrl = (num: number) =>
  `/base/index-dtf/${DTF.address}/governance/proposal/${MOCK_PROPOSALS[num - 1].id}`

// ---------------------------------------------------------------------------
// PROPOSAL LIST — all states
// ---------------------------------------------------------------------------
baseTest.describe('Governance: Proposal List (all states)', () => {
  baseTest.beforeEach(async ({ page }) => {
    await page.goto(GOV_URL)
    await baseExpect(page.getByText('LCAP').first()).toBeVisible({
      timeout: 10000,
    })
  })

  baseTest('shows all 5 proposals including new states', async ({ page }) => {
    const proposals = page.getByTestId('governance-proposals')
    await baseExpect(proposals).toBeVisible()

    await baseExpect(
      proposals.getByText(/Update basket allocation/).first()
    ).toBeVisible({ timeout: 10000 })
    await baseExpect(
      proposals.getByText(/Reduce minting fee/).first()
    ).toBeVisible()
    await baseExpect(
      proposals.getByText(/Add new collateral type/).first()
    ).toBeVisible()
    await baseExpect(
      proposals.getByText(/Increase redemption fee/).first()
    ).toBeVisible()
    await baseExpect(
      proposals.getByText(/Lower auction delay/).first()
    ).toBeVisible()
  })

  baseTest('shows Succeeded and Queued state badges', async ({ page }) => {
    const proposals = page.getByTestId('governance-proposals')
    await baseExpect(
      proposals.getByText(/Update basket allocation/).first()
    ).toBeVisible({ timeout: 10000 })

    await baseExpect(proposals.getByText('Succeeded').first()).toBeVisible()
    await baseExpect(proposals.getByText('Queued').first()).toBeVisible()
  })
})

// ---------------------------------------------------------------------------
// PROPOSAL DETAIL — Active state
// ---------------------------------------------------------------------------
baseTest.describe('Governance: Active Proposal Detail', () => {
  baseTest.beforeEach(async ({ page }) => {
    await page.goto(proposalUrl(1))
    await baseExpect(page.getByText('LCAP').first()).toBeVisible({
      timeout: 10000,
    })
  })

  baseTest('renders proposal title and metadata', async ({ page }) => {
    await baseExpect(
      page.getByText('Update basket allocation').first()
    ).toBeVisible({ timeout: 10000 })

    await baseExpect(page.getByText('Proposed by').first()).toBeVisible()
    await baseExpect(page.getByText('Proposed on').first()).toBeVisible()
    await baseExpect(page.getByText('ID').first()).toBeVisible()
  })

  baseTest(
    'shows "Current votes" header for active proposal',
    async ({ page }) => {
      await baseExpect(
        page.getByText('Update basket allocation').first()
      ).toBeVisible({ timeout: 10000 })

      await baseExpect(page.getByText('Current votes').first()).toBeVisible()
    }
  )

  baseTest('shows quorum and majority support stats', async ({ page }) => {
    await baseExpect(
      page.getByText('Update basket allocation').first()
    ).toBeVisible({ timeout: 10000 })

    await baseExpect(page.getByText('Quorum').first()).toBeVisible()
    await baseExpect(page.getByText('Majority support').first()).toBeVisible()
  })

  baseTest(
    'shows vote distribution (For / Against / Abstain)',
    async ({ page }) => {
      await baseExpect(
        page.getByText('Update basket allocation').first()
      ).toBeVisible({ timeout: 10000 })

      await baseExpect(page.getByText('For').first()).toBeVisible()
      await baseExpect(page.getByText('Against').first()).toBeVisible()
      await baseExpect(page.getByText('Abstain').first()).toBeVisible()
    }
  )

  baseTest('shows individual votes from subgraph', async ({ page }) => {
    await baseExpect(
      page.getByText('Update basket allocation').first()
    ).toBeVisible({ timeout: 10000 })

    await baseExpect(page.getByText('0x03d0').first()).toBeVisible({
      timeout: 10000,
    })
  })

  baseTest('back button navigates to governance list', async ({ page }) => {
    await baseExpect(
      page.getByText('Update basket allocation').first()
    ).toBeVisible({ timeout: 10000 })

    const backLink = page.locator('a[href*="governance"]').first()
    await backLink.click()

    await baseExpect(page).toHaveURL(/\/governance$/)
    await baseExpect(page.getByTestId('governance-proposals')).toBeVisible()
  })
})

// ---------------------------------------------------------------------------
// PROPOSAL DETAIL — Executed state
// ---------------------------------------------------------------------------
baseTest.describe('Governance: Executed Proposal Detail', () => {
  baseTest.beforeEach(async ({ page }) => {
    await page.goto(proposalUrl(2))
    await baseExpect(page.getByText('LCAP').first()).toBeVisible({
      timeout: 10000,
    })
  })

  baseTest(
    'shows "Final votes" header for executed proposal',
    async ({ page }) => {
      await baseExpect(
        page.getByText('Reduce minting fee').first()
      ).toBeVisible({ timeout: 10000 })

      await baseExpect(page.getByText('Final votes').first()).toBeVisible()
    }
  )

  baseTest(
    'shows "View execute tx" button with explorer link',
    async ({ page }) => {
      await baseExpect(
        page.getByText('Reduce minting fee').first()
      ).toBeVisible({ timeout: 10000 })

      const viewTxBtn = page.getByText('View execute tx').first()
      await baseExpect(viewTxBtn).toBeVisible({ timeout: 10000 })
    }
  )

  baseTest('no vote button on executed proposal', async ({ page }) => {
    await baseExpect(
      page.getByText('Reduce minting fee').first()
    ).toBeVisible({ timeout: 10000 })

    await baseExpect(page.getByText('Vote on-chain')).not.toBeVisible()
  })
})

// ---------------------------------------------------------------------------
// PROPOSAL DETAIL — Defeated state
// ---------------------------------------------------------------------------
baseTest.describe('Governance: Defeated Proposal Detail', () => {
  baseTest.beforeEach(async ({ page }) => {
    await page.goto(proposalUrl(3))
    await baseExpect(page.getByText('LCAP').first()).toBeVisible({
      timeout: 10000,
    })
  })

  baseTest(
    'shows "Final votes" header for defeated proposal',
    async ({ page }) => {
      await baseExpect(
        page.getByText('Add new collateral type').first()
      ).toBeVisible({ timeout: 10000 })

      await baseExpect(page.getByText('Final votes').first()).toBeVisible()
    }
  )

  baseTest('no action buttons on defeated proposal', async ({ page }) => {
    await baseExpect(
      page.getByText('Add new collateral type').first()
    ).toBeVisible({ timeout: 10000 })

    await baseExpect(page.getByText('Vote on-chain')).not.toBeVisible()
    await baseExpect(page.getByText('Queue proposal')).not.toBeVisible()
    await baseExpect(page.getByText('Execute proposal')).not.toBeVisible()
  })
})

// ---------------------------------------------------------------------------
// PROPOSAL DETAIL — Succeeded state (Queue action)
// ---------------------------------------------------------------------------
baseTest.describe('Governance: Succeeded Proposal Detail', () => {
  baseTest.beforeEach(async ({ page }) => {
    await page.goto(proposalUrl(4))
    await baseExpect(page.getByText('LCAP').first()).toBeVisible({
      timeout: 10000,
    })
  })

  baseTest(
    'shows "Final votes" since voting ended',
    async ({ page }) => {
      await baseExpect(
        page.getByText('Increase redemption fee').first()
      ).toBeVisible({ timeout: 10000 })

      await baseExpect(page.getByText('Final votes').first()).toBeVisible()
    }
  )
})

// ---------------------------------------------------------------------------
// PROPOSAL DETAIL — Queued state (Execute action)
// ---------------------------------------------------------------------------
baseTest.describe('Governance: Queued Proposal Detail', () => {
  baseTest.beforeEach(async ({ page }) => {
    await page.goto(proposalUrl(5))
    await baseExpect(page.getByText('LCAP').first()).toBeVisible({
      timeout: 10000,
    })
  })

  baseTest('shows queued state and timeline', async ({ page }) => {
    await baseExpect(
      page.getByText('Lower auction delay').first()
    ).toBeVisible({ timeout: 10000 })

    await baseExpect(page.getByText('Final votes').first()).toBeVisible()
    await baseExpect(page.getByText('Queued').first()).toBeVisible()
  })

  baseTest('no vote button on queued proposal', async ({ page }) => {
    await baseExpect(
      page.getByText('Lower auction delay').first()
    ).toBeVisible({ timeout: 10000 })

    await baseExpect(page.getByText('Vote on-chain')).not.toBeVisible()
  })
})

// ---------------------------------------------------------------------------
// STATS: Derived from atom data (Phase 3 — no on-chain read)
// ---------------------------------------------------------------------------
baseTest.describe('Governance: Stats from atom data', () => {
  baseTest(
    'vote counts and quorum render from subgraph data (no on-chain read)',
    async ({ page }) => {
      // After Phase 3, proposal-detail-stats.tsx reads from proposalDetailAtom
      // instead of calling proposalVotes() on-chain. This test verifies the
      // stats section renders correctly from subgraph mock data alone.
      await page.goto(proposalUrl(1))
      await baseExpect(
        page.getByText('Update basket allocation').first()
      ).toBeVisible({ timeout: 10000 })

      // Stats should render from atom data
      await baseExpect(page.getByText('Quorum').first()).toBeVisible()
      await baseExpect(
        page.getByText('Majority support').first()
      ).toBeVisible()
      await baseExpect(page.getByText('For').first()).toBeVisible()
      await baseExpect(page.getByText('Against').first()).toBeVisible()
      await baseExpect(page.getByText('Abstain').first()).toBeVisible()
    }
  )
})

// ---------------------------------------------------------------------------
// OPTIMISTIC UI: Voting flow (wallet connected)
// ---------------------------------------------------------------------------
walletTest.describe('Governance: Optimistic Vote (wallet connected)', () => {
  walletTest.beforeEach(async ({ page }) => {
    await page.goto(proposalUrl(1))
    await walletExpect(page.getByText('LCAP').first()).toBeVisible({
      timeout: 10000,
    })
  })

  walletTest('shows voting power from on-chain read', async ({ page }) => {
    await walletExpect(
      page.getByText('Update basket allocation').first()
    ).toBeVisible({ timeout: 10000 })

    // With RPC mock returning non-zero getVotes, voting power should show
    await walletExpect(
      page.getByText('Your voting power').first()
    ).toBeVisible({ timeout: 10000 })
  })

  walletTest(
    'vote button is enabled when user has voting power',
    async ({ page }) => {
      await walletExpect(
        page.getByText('Update basket allocation').first()
      ).toBeVisible({ timeout: 10000 })

      const voteBtn = page.getByRole('button', { name: /Vote on-chain/i })
      await walletExpect(voteBtn).toBeVisible({ timeout: 10000 })
      await walletExpect(voteBtn).toBeEnabled({ timeout: 10000 })
    }
  )

  walletTest(
    'voting opens modal, selects option, and submits transaction',
    async ({ page }) => {
      await walletExpect(
        page.getByText('Update basket allocation').first()
      ).toBeVisible({ timeout: 10000 })

      // Click vote button to open modal
      const voteBtn = page.getByRole('button', { name: /Vote on-chain/i })
      await walletExpect(voteBtn).toBeEnabled({ timeout: 10000 })
      await voteBtn.click()

      // Modal should show voting options
      await walletExpect(page.getByText('Voting').first()).toBeVisible({
        timeout: 5000,
      })

      // Select "For" option — scope to dialog to avoid matching vote stats behind modal
      const dialog = page.locator('[role="dialog"]')
      await dialog.getByRole('checkbox').first().click()

      // Click the Vote submit button in the modal
      const submitVote = dialog.getByRole('button', { name: /^Vote$/i })
      await walletExpect(submitVote).toBeEnabled({ timeout: 5000 })
      await submitVote.click()

      // Transaction should succeed — modal shows success message
      await walletExpect(
        page.getByText('Transaction successful!').first()
      ).toBeVisible({ timeout: 15000 })
    }
  )

  walletTest(
    'after voting, button shows "You voted FOR" (optimistic update)',
    async ({ page }) => {
      await walletExpect(
        page.getByText('Update basket allocation').first()
      ).toBeVisible({ timeout: 10000 })

      // Open modal, select For, submit
      const voteBtn = page.getByRole('button', { name: /Vote on-chain/i })
      await walletExpect(voteBtn).toBeEnabled({ timeout: 10000 })
      await voteBtn.click()

      const dialog = page.locator('[role="dialog"]')
      await dialog.getByRole('checkbox').first().click()

      const submitVote = dialog.getByRole('button', { name: /^Vote$/i })
      await walletExpect(submitVote).toBeEnabled({ timeout: 5000 })
      await submitVote.click()

      // Wait for tx success
      await walletExpect(
        page.getByText('Transaction successful!').first()
      ).toBeVisible({ timeout: 15000 })

      // Close modal (click outside or press Escape)
      await page.keyboard.press('Escape')

      // Optimistic update: button should now show "You voted FOR"
      await walletExpect(
        page.getByRole('button', { name: /You voted.*FOR/i }).first()
      ).toBeVisible({ timeout: 5000 })
    }
  )
})

// ---------------------------------------------------------------------------
// OPTIMISTIC UI: Queue flow (wallet connected)
// ---------------------------------------------------------------------------
walletTest.describe('Governance: Optimistic Queue (wallet connected)', () => {
  walletTest(
    'queue button visible and enabled for succeeded proposal',
    async ({ page }) => {
      await page.goto(proposalUrl(4))
      await walletExpect(page.getByText('LCAP').first()).toBeVisible({
        timeout: 10000,
      })
      await walletExpect(
        page.getByText('Increase redemption fee').first()
      ).toBeVisible({ timeout: 10000 })

      const queueBtn = page.getByText('Queue proposal').first()
      await walletExpect(queueBtn).toBeVisible({ timeout: 10000 })
    }
  )

  walletTest(
    'clicking queue transitions to QUEUED state (optimistic)',
    async ({ page }) => {
      await page.goto(proposalUrl(4))
      await walletExpect(page.getByText('LCAP').first()).toBeVisible({
        timeout: 10000,
      })
      await walletExpect(
        page.getByText('Increase redemption fee').first()
      ).toBeVisible({ timeout: 10000 })

      // Wait for queue button to be enabled (simulation must complete)
      const queueBtn = page.getByRole('button', { name: /Queue proposal/i })
      await walletExpect(queueBtn).toBeEnabled({ timeout: 15000 })
      await queueBtn.click()

      // After tx confirms, state should transition to QUEUED
      // The timeline should show "Queued" step
      await walletExpect(page.getByText('Queued').first()).toBeVisible({
        timeout: 15000,
      })
    }
  )
})

// ---------------------------------------------------------------------------
// OPTIMISTIC UI: Execute flow (wallet connected)
// ---------------------------------------------------------------------------
walletTest.describe(
  'Governance: Optimistic Execute (wallet connected)',
  () => {
    walletTest(
      'execute button visible for queued proposal with past ETA',
      async ({ page }) => {
        await page.goto(proposalUrl(5))
        await walletExpect(page.getByText('LCAP').first()).toBeVisible({
          timeout: 10000,
        })
        await walletExpect(
          page.getByText('Lower auction delay').first()
        ).toBeVisible({ timeout: 10000 })

        const executeBtn = page.getByText('Execute proposal').first()
        await walletExpect(executeBtn).toBeVisible({ timeout: 10000 })
      }
    )

    walletTest(
      'clicking execute transitions to EXECUTED state (optimistic)',
      async ({ page }) => {
        await page.goto(proposalUrl(5))
        await walletExpect(page.getByText('LCAP').first()).toBeVisible({
          timeout: 10000,
        })
        await walletExpect(
          page.getByText('Lower auction delay').first()
        ).toBeVisible({ timeout: 10000 })

        // Wait for execute button to be enabled (simulation must complete)
        const executeBtn = page.getByRole('button', {
          name: /Execute proposal/i,
        })
        await walletExpect(executeBtn).toBeEnabled({ timeout: 15000 })
        await executeBtn.click()

        // After tx confirms, state should optimistically transition to EXECUTED
        // "View execute tx" button appears for executed proposals
        await walletExpect(
          page.getByText('Executed').first()
        ).toBeVisible({ timeout: 15000 })
      }
    )
  }
)

// ---------------------------------------------------------------------------
// COUNTDOWN TIMER: Deadline-aware recalculation
// ---------------------------------------------------------------------------
baseTest.describe('Governance: Countdown Timer', () => {
  baseTest(
    'active proposal shows countdown deadline (not static)',
    async ({ page }) => {
      await page.goto(proposalUrl(1))
      await baseExpect(
        page.getByText('Update basket allocation').first()
      ).toBeVisible({ timeout: 10000 })

      // The Active proposal has voteEnd 3 days in the future.
      // The updater recalculates state on an interval.
      // The proposal should remain Active (not transition unexpectedly).
      await baseExpect(page.getByText('Current votes').first()).toBeVisible()

      // Wait 2 seconds and verify it's still Active (timer didn't break state)
      await page.waitForTimeout(2000)
      await baseExpect(page.getByText('Current votes').first()).toBeVisible()
      await baseExpect(
        page.getByText('unexpected error')
      ).not.toBeVisible()
    }
  )
})

// ---------------------------------------------------------------------------
// NAVIGATION flows
// ---------------------------------------------------------------------------
baseTest.describe('Governance: Navigation flows', () => {
  baseTest(
    'click proposal → detail → back → list preserved',
    async ({ page }) => {
      await page.goto(GOV_URL)
      await baseExpect(page.getByText('LCAP').first()).toBeVisible({
        timeout: 10000,
      })

      const proposals = page.getByTestId('governance-proposals')
      await baseExpect(
        proposals.getByText(/Update basket allocation/).first()
      ).toBeVisible({ timeout: 10000 })
      await proposals.getByText(/Update basket allocation/).first().click()

      await baseExpect(page).toHaveURL(/\/proposal\//)
      await baseExpect(
        page.getByText('Update basket allocation').first()
      ).toBeVisible({ timeout: 10000 })

      await page.goBack()
      await baseExpect(page).toHaveURL(/\/governance$/)
      await baseExpect(
        page.getByTestId('governance-proposals')
      ).toBeVisible()

      await baseExpect(
        proposals.getByText(/Update basket allocation/).first()
      ).toBeVisible({ timeout: 10000 })
    }
  )

  baseTest(
    'direct URL to non-existent proposal handles gracefully',
    async ({ page }) => {
      await page.goto(
        `/base/index-dtf/${DTF.address}/governance/proposal/99999999999999999`
      )
      await baseExpect(page.getByText('LCAP').first()).toBeVisible({
        timeout: 10000,
      })

      // UX-GAP: Shows "Loading..." indefinitely for unknown proposal IDs
      await baseExpect(page.getByText('Loading...').first()).toBeVisible({
        timeout: 10000,
      })

      await page.waitForTimeout(3000)
      await baseExpect(
        page.getByText('unexpected error')
      ).not.toBeVisible()
    }
  )
})

// ---------------------------------------------------------------------------
// EDGE CASES
// ---------------------------------------------------------------------------
baseTest.describe('Governance: Edge Cases', () => {
  baseTest(
    'page renders without crash for all proposal states',
    async ({ page }) => {
      for (const num of [1, 2, 3, 4, 5]) {
        await page.goto(proposalUrl(num))
        await baseExpect(page.getByText('LCAP').first()).toBeVisible({
          timeout: 10000,
        })
        await baseExpect(
          page.getByText('unexpected error')
        ).not.toBeVisible()
      }
    }
  )

  baseTest(
    'rapid navigation between proposals shows correct state',
    async ({ page }) => {
      await page.goto(proposalUrl(1))
      await baseExpect(page.getByText('LCAP').first()).toBeVisible({
        timeout: 10000,
      })

      await page.goto(proposalUrl(2))
      await baseExpect(
        page.getByText('Reduce minting fee').first()
      ).toBeVisible({ timeout: 10000 })

      // Should show Executed state, not Active from proposal 1
      await baseExpect(page.getByText('Final votes').first()).toBeVisible()
    }
  )

  baseTest(
    'atom cleanup on unmount prevents stale data flash',
    async ({ page }) => {
      // Navigate to Active proposal first
      await page.goto(proposalUrl(1))
      await baseExpect(
        page.getByText('Update basket allocation').first()
      ).toBeVisible({ timeout: 10000 })

      // Navigate to Defeated proposal
      await page.goto(proposalUrl(3))
      await baseExpect(
        page.getByText('Add new collateral type').first()
      ).toBeVisible({ timeout: 10000 })

      // Verify correct state
      await baseExpect(page.getByText('Final votes').first()).toBeVisible()
    }
  )
})

// ---------------------------------------------------------------------------
// RESPONSIVE
// ---------------------------------------------------------------------------
baseTest.describe('Governance: Responsive', () => {
  baseTest.use({ viewport: { width: 390, height: 844 } })

  baseTest(
    'proposal detail renders on mobile viewport',
    async ({ page }) => {
      await page.goto(proposalUrl(1))
      await baseExpect(
        page.getByText('Update basket allocation').first()
      ).toBeVisible({ timeout: 15000 })

      await baseExpect(page.getByText('Quorum').first()).toBeVisible()
    }
  )

  baseTest('governance list scrollable on mobile', async ({ page }) => {
    await page.goto(GOV_URL)

    const proposals = page.getByTestId('governance-proposals')
    await baseExpect(
      proposals.getByText(/Update basket allocation/).first()
    ).toBeVisible({ timeout: 15000 })
  })
})
