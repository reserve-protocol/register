import { connectWallet, expect, test } from '../../../fixtures/wallet'
import { advanceTime, freezeTime, proposalTime } from '../../../helpers/clock'
import { dtfPath, findDtfByAddress } from '../../../helpers/registry'
import { loadSnapshot } from '../../../helpers/snapshots'
import { loadEnrichedProposal } from '../../../helpers/subgraph'

// Regression: a proposal title containing an address (no spaces to break on)
// used to blow past the modal's 420px box — the vote checkboxes and separators
// rendered outside the dialog, and the title opened with a quote it never closed.

const DTF_ADDRESS = '0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8' // base/lcap
const PROPOSAL_ID =
  '111337429388977163548785296806473337490511918976677753366781905746718791330309'
const LONG_TITLE =
  'Add 0xb3CF59A5f12cA319861376C5e63Eef4790a42B44 as an optimistic proposer'

interface ProposalSnapshot {
  proposal: { id: string; voteStart: string; voteEnd: string; [key: string]: unknown }
}

test('vote modal keeps an address-length title inside the dialog @mobile', async ({
  page,
  overrides,
}) => {
  const dtf = findDtfByAddress(DTF_ADDRESS)!
  const { proposal } = loadSnapshot<ProposalSnapshot>(
    `${dtf.snapshotDir}/proposals/${PROPOSAL_ID}.json`
  )
  const { dtf: dtfObject } = loadSnapshot<{ dtf: unknown }>(`${dtf.snapshotDir}/dtf.json`)
  const { proposal: enriched } = loadEnrichedProposal(PROPOSAL_ID)!

  overrides.subgraph(
    { operationName: 'GetIndexDtfProposal', variables: { proposalId: PROPOSAL_ID } },
    { dtf: dtfObject, proposal: { ...enriched, description: `${LONG_TITLE}\n\nBody` } }
  )

  await freezeTime(page, proposalTime(proposal, 'active'))
  await page.goto(dtfPath(dtf, `governance/proposal/${PROPOSAL_ID}`))
  await connectWallet(page)
  await advanceTime(page, 5_000)

  await page.getByTestId('proposal-vote-btn').click()
  await advanceTime(page, 5_000)

  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  const dialogBox = (await dialog.boundingBox())!

  for (const option of ['for', 'against', 'abstain']) {
    const box = (await page.getByTestId(`vote-option-${option}`).boundingBox())!
    expect(box.x).toBeGreaterThanOrEqual(dialogBox.x)
    expect(box.x + box.width).toBeLessThanOrEqual(dialogBox.x + dialogBox.width)
  }

  // Quotes around the title are balanced (the leading one used to be orphaned).
  await expect(dialog.getByText(`“${LONG_TITLE}”`)).toBeVisible()
})
