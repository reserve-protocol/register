import { connectWallet, expect, test } from '../../../fixtures/wallet'
import { encodeAbiParameters, encodeFunctionData, parseAbi } from 'viem'
import { TEST_ADDRESS } from '../../../helpers/registry'
import type { MockOverrides } from '../../../helpers/overrides'

// A partial 200 portfolio response with one malformed proposal row must not
// blank the route: the page renders, the healthy proposal survives, the
// malformed one is dropped.
// RED: revert the parseWei guard in portfolio atoms — BigInt('') throws during
// atom evaluation and the route crashes (section and count disappear).

const STAKED_POSITION = {
  address: '0x0000000000000000000000000000000000000101',
  stRSRAddress: '0x0000000000000000000000000000000000000102',
  name: 'Test RToken',
  symbol: 'TRSR',
  chainId: 1,
  amount: '10',
  rsrAmount: '10',
  value: 10,
  performance7d: null,
  apy: null,
  votingPower: '10',
  votingWeight: 0,
  delegate: null,
  pendingWithdrawals: [],
}

const proposal = (
  id: string,
  forWeightedVotes: string,
  extra: Record<string, unknown> = {}
) => ({
  id,
  description: 'Test proposal',
  state: 'ACTIVE',
  proposer: '0x0000000000000000000000000000000000000001',
  creationTime: '1',
  voteStart: '100',
  voteEnd: '99999999999',
  quorumVotes: '100',
  forWeightedVotes,
  againstWeightedVotes: '0',
  abstainWeightedVotes: '0',
  totalWeightedVotes: forWeightedVotes,
  queueTime: null,
  executionETA: null,
  ...extra,
})

const VOTE_LOCK_POSITION = {
  stTokenAddress: '0x0000000000000000000000000000000000000201',
  symbol: 'vlTEST',
  name: 'Vote Lock Test',
  chainId: 8453,
  amount: '10',
  value: 10,
  underlying: {
    name: 'Test DTF',
    symbol: 'TDTF',
    address: '0x0000000000000000000000000000000000000202',
    decimals: 18,
  },
  dtfs: [
    {
      name: 'Test DTF',
      symbol: 'TDTF',
      address: '0x0000000000000000000000000000000000000202',
    },
  ],
  locks: [],
  rewards: [],
}

// A live (non-transitioned) optimistic proposal carries the full veto context.
const optimisticFields = {
  isOptimistic: true,
  vetoThreshold: '100000000000000000',
  vetoThresholdVotes: '1000',
  optimisticSnapshot: '1',
  optimisticSnapshotSupply: '10000',
}

test('portfolio survives a malformed proposal row and keeps the healthy one', async ({
  page,
  overrides,
}) => {
  overrides.api(
    { pathname: `/v1/portfolio/${TEST_ADDRESS}` },
    {
      totalHoldingsUSD: 10,
      indexDTFs: [],
      yieldDTFs: [],
      voteLocks: [],
      rsrBalances: [],
      stakedRSR: [
        {
          ...STAKED_POSITION,
          activeProposals: [
            proposal('healthy', '1000'),
            proposal('malformed', ''), // non-integer wei used to throw mid-atom
          ],
        },
      ],
    }
  )

  await page.goto('/portfolio')
  await connectWallet(page)

  const section = page.getByTestId('portfolio-active-proposals')
  await expect(section).toBeVisible({ timeout: 15_000 })
  await expect(section).toHaveAttribute('data-proposal-count', '1')
})

// An optimistic Index row with a broken veto/snapshot field must be dropped,
// not passed to the SDK context-less — the oracle would report an expired
// opposed proposal ACTIVE forever, pinning it to the active list.
// RED: revert the malformed-optimistic guard in portfolio atoms — the broken
// row stays ACTIVE and the count reads 2.
// The vote-lock migration check reads the old vault; an owned vault with a delay is not retired, so nothing migrates.
const LEGACY_VAULT_ABI = parseAbi([
  'function owner() view returns (address)',
  'function unstakingDelay() view returns (uint256)',
  'function asset() view returns (address)',
  'function symbol() view returns (string)',
  'function balanceOf(address) view returns (uint256)',
])
function seedActiveVoteLock(overrides: MockOverrides) {
  const vault = VOTE_LOCK_POSITION.stTokenAddress as `0x${string}`
  const call = (functionName: string, args: readonly unknown[] = []) =>
    encodeFunctionData({ abi: LEGACY_VAULT_ABI, functionName, args } as never)
  const answers: Array<[string, readonly unknown[], `0x${string}`]> = [
    ['owner', [], encodeAbiParameters([{ type: 'address' }], [TEST_ADDRESS])],
    ['unstakingDelay', [], encodeAbiParameters([{ type: 'uint256' }], [604_800n])],
    ['asset', [], encodeAbiParameters([{ type: 'address' }], [VOTE_LOCK_POSITION.underlying.address as `0x${string}`])],
    ['symbol', [], encodeAbiParameters([{ type: 'string' }], [VOTE_LOCK_POSITION.symbol])],
    ['balanceOf', [TEST_ADDRESS], encodeAbiParameters([{ type: 'uint256' }], [10n ** 19n])],
  ]
  for (const [functionName, args, answer] of answers) {
    overrides.ethCall(vault, call(functionName, args), answer)
  }
  overrides.ethCall(
    VOTE_LOCK_POSITION.underlying.address,
    call('symbol'),
    encodeAbiParameters([{ type: 'string' }], [VOTE_LOCK_POSITION.underlying.symbol])
  )
}

test('portfolio drops an optimistic proposal with malformed veto fields, keeps the healthy one', async ({
  page,
  overrides,
}) => {
  seedActiveVoteLock(overrides)
  const expired = { voteEnd: '200', againstWeightedVotes: '10' }
  overrides.api(
    { pathname: `/v1/portfolio/${TEST_ADDRESS}` },
    {
      totalHoldingsUSD: 10,
      indexDTFs: [],
      yieldDTFs: [],
      rsrBalances: [],
      stakedRSR: [],
      voteLocks: [
        {
          ...VOTE_LOCK_POSITION,
          activeProposals: [
            // Healthy: expired, opposed below threshold → SUCCEEDED (active list).
            proposal('healthy-optimistic', '1000', {
              ...optimisticFields,
              ...expired,
            }),
            // Malformed: same shape, garbage snapshot — must be dropped.
            proposal('malformed-optimistic', '1000', {
              ...optimisticFields,
              ...expired,
              optimisticSnapshot: 'NaN',
            }),
          ],
        },
      ],
    }
  )

  await page.goto('/portfolio')
  await connectWallet(page)

  const section = page.getByTestId('portfolio-active-proposals')
  await expect(section).toBeVisible({ timeout: 15_000 })
  await expect(section).toHaveAttribute('data-proposal-count', '1')
})
