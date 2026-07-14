import { expect, test } from '../../fixtures/base'
import { advanceTime, freezeTime, proposalTime } from '../../helpers/clock'
import { dtfPath, findDtfByAddress } from '../../helpers/registry'
import { loadSnapshot } from '../../helpers/snapshots'
import { loadEnrichedProposal } from '../../helpers/subgraph'
import type { BoundaryRequest } from '../../helpers/requests'
import type { MockOverrides } from '../../helpers/overrides'

// SECURITY: proposal descriptions reach the chain verbatim (the propose specs
// prove the form sends raw markdown/HTML with no escaping), so XSS safety rests
// ENTIRELY on the detail renderer — the shared
// src/components/governance/proposal-md-description.tsx, which runs
// rehype-sanitize AFTER rehype-raw with an allowlist schema (S3 fix; the
// schema's own unit vectors live next to the component). These tests render a
// proposal whose on-chain `description` is attacker-controlled and assert no
// payload EXECUTES and no embed tag survives, on the real page.
//
// Recipe mirrors governance-states.spec.ts: a GetIndexDtfProposal overlay that
// mutates exactly one field (`description`) + freezeTime so the SDK's state
// derivation is deterministic (the description renders in every lifecycle
// state; we pin one). No wallet — the renderer runs for any visitor.
//
// Pre-fix history (why these exact vectors): <script> mounted but stayed inert;
// <img onerror> was stripped by react-markdown; `javascript:` hrefs were
// neutralized to javascript:void(0); but a raw <iframe> MATERIALIZED and LOADED
// its attacker-controlled src (observed egress to https://evil.example/frame).
// Post-fix, the sanitizer strips script/iframe/object/embed/form entirely and
// removes javascript:/data: URLs (the hostile anchor renders with NO href).

const DTF_ADDRESS = '0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8' // base/lcap
const PROPOSAL_ID =
  '111337429388977163548785296806473337490511918976677753366781905746718791330309'

const dtf = findDtfByAddress(DTF_ADDRESS)!

// proposal-detail-content.tsx strips the FIRST description line (title) and, if
// the SECOND line lacks "forum", keeps it. So line 0 is a throwaway; every
// payload lives from line 1 on. Blank lines keep each raw-HTML block distinct
// for the markdown parser. `window.__e2e_pwned` is the execution tripwire: both
// the inline <script> and the <img onerror> set it, so if EITHER runs the flag
// flips. `javascript:` href needs a click to fire, hence the click below.
//
// The iframe is deliberately NOT in this payload — it egresses to an external
// host (the bug), which would fail teardown here and mask the exec assertions;
// it lives in its own fixme test.
const EXEC_PAYLOAD = [
  '# Security E2E Proposal', // line 0 — stripped by the detail parser
  'Intro paragraph with no f-word so the parser keeps it.', // line 1 — kept
  '',
  '## Control Heading',
  '',
  'This is **control bold** text that must survive sanitization.',
  '',
  '<script>window.__e2e_pwned=true</script>',
  '',
  '<img src=x onerror="window.__e2e_pwned=true">',
  '',
  '[hostile link](javascript:alert(1))',
].join('\n')

// Control + raw embed tags. Any of these loading its src fires the suite's
// unmocked-egress guard, so a regression fails twice over.
const EMBED_PAYLOAD = [
  '# Security E2E Proposal',
  'Intro paragraph with no f-word so the parser keeps it.',
  '',
  '## Control Heading',
  '',
  '<iframe src="https://evil.example/frame"></iframe>',
  '',
  '<object data="https://evil.example/object"></object>',
  '',
  '<embed src="https://evil.example/embed">',
].join('\n')

interface DtfSnapshot {
  dtf: Record<string, unknown>
}

// Full GetIndexDtfProposal overlay: the raw dtf object (same one the central
// mock serves) + the enriched proposal with the hostile description spliced in.
function hostileProposalOverlay(description: string) {
  const { dtf: dtfObj } = loadSnapshot<DtfSnapshot>(`${dtf.snapshotDir}/dtf.json`)
  const { proposal } = loadEnrichedProposal(PROPOSAL_ID)!
  return { dtf: dtfObj, proposal: { ...proposal, description } }
}

function loadProposalTimes() {
  return loadEnrichedProposal(PROPOSAL_ID)!.proposal as {
    voteStart: string
    voteEnd: string
  }
}

async function settleProposal(
  page: import('@playwright/test').Page,
  boundaryRequests: BoundaryRequest[]
) {
  await advanceTime(page, 5_000) // flush DTF identity; enables proposal detail
  await expect
    .poll(() =>
      boundaryRequests.some(
        (request) =>
          request.boundary === 'subgraph' &&
          request.operationName === 'GetIndexDtfProposal'
      )
    )
    .toBe(true)
  await advanceTime(page, 5_000) // flush the proposal response into React
}

// Render a proposal carrying `description` and return the markdown container.
async function renderDescription(
  page: import('@playwright/test').Page,
  overrides: MockOverrides,
  boundaryRequests: BoundaryRequest[],
  description: string
) {
  overrides.subgraph(
    { operationName: 'GetIndexDtfProposal', variables: { proposalId: PROPOSAL_ID } },
    hostileProposalOverlay(description)
  )
  await freezeTime(page, proposalTime(loadProposalTimes(), 'ended'))
  await page.goto(dtfPath(dtf, `governance/proposal/${PROPOSAL_ID}`))
  await settleProposal(page, boundaryRequests)

  const container = page.locator('.wmde-markdown')
  await expect(container).toBeVisible()
  return container
}

test('markdown control content renders — sanitizer is not over-aggressive', async ({
  page,
  overrides,
  boundaryRequests,
}) => {
  const container = await renderDescription(
    page,
    overrides,
    boundaryRequests,
    EXEC_PAYLOAD
  )

  // The renderer must stay useful: ordinary markdown still produces a heading
  // and bold. If this regresses, sanitization has become so aggressive it broke
  // the feature.
  await expect(container.locator('h2')).toContainText('Control Heading')
  await expect(container.locator('strong')).toHaveText('control bold')
})

test('script, img onerror, and javascript: href payloads never execute', async ({
  page,
  overrides,
  boundaryRequests,
}) => {
  // A surviving javascript: href fires alert() on click. Register the trap
  // BEFORE navigation; dismiss so a modal hang can't mask the flip.
  let dialogFired = false
  page.on('dialog', (dialog) => {
    dialogFired = true
    void dialog.dismiss()
  })

  const container = await renderDescription(
    page,
    overrides,
    boundaryRequests,
    EXEC_PAYLOAD
  )

  // No live onerror handler survives on any rendered <img> — a passthrough
  // onerror attribute would run on the src=x load failure. (The <img> itself
  // still renders as a broken image; only the handler must be gone.)
  await expect(container.locator('img[onerror]')).toHaveCount(0)

  // The javascript: link renders as text, but the sanitizer strips its href —
  // assert the alert() payload is gone, then CLICK it to prove the anchor is
  // inert.
  const hostileLink = container.getByText('hostile link', { exact: true })
  await expect(hostileLink).toHaveCount(1)
  const href = (await hostileLink.first().getAttribute('href')) ?? ''
  expect(href).not.toContain('alert')
  await hostileLink.first().click()

  // The execution tripwire never flipped (the <script> body, the <img onerror>,
  // and the clicked javascript: link all ran nothing) and no dialog ever fired.
  const pwned = await page.evaluate(
    () => (window as unknown as Record<string, unknown>).__e2e_pwned
  )
  expect(pwned).toBeUndefined()
  expect(dialogFired).toBe(false)
})

// Regression for the S3 fix: pre-fix, a raw <iframe> MATERIALIZED and LOADED
// its src (observed egress to https://evil.example/frame). The renderer now
// runs rehype-sanitize with an allowlist schema
// (src/components/governance/proposal-md-description.tsx) that strips
// iframe/object/embed; if any of them regresses, its src load also trips the
// unmocked-egress teardown guard.
test('raw iframe/object/embed in a description must not materialize or load their src', async ({
  page,
  overrides,
  boundaryRequests,
}) => {
  const container = await renderDescription(
    page,
    overrides,
    boundaryRequests,
    EMBED_PAYLOAD
  )
  await expect(container.locator('h2')).toContainText('Control Heading')
  await expect(container.locator('iframe')).toHaveCount(0)
  await expect(container.locator('object')).toHaveCount(0)
  await expect(container.locator('embed')).toHaveCount(0)
})
