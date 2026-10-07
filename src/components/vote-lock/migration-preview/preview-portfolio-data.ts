import type {
  PortfolioResponse,
  PortfolioVoteLock,
} from '@/views/portfolio-page/types'

export const migrationPreviewAddress =
  '0x0000000000000000000000000000000000000101' as const

export const migrationPreviewLegacyVoteLock: PortfolioVoteLock = {
  stTokenAddress: '0x45a96cd0e4d89a41eebf3cc4204b00b1cf1582fa',
  chainId: 8453,
  name: 'Legacy LCAP vote-lock',
  symbol: 'vlRSR-LCAP',
  underlying: {
    address: '0x0000000000000000000000000000000000000103',
    symbol: 'RSR',
    name: 'Reserve Rights',
  },
  dtfs: [
    {
      address: '0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8',
      name: 'Large Cap Index',
      symbol: 'LCAP',
    },
  ],
  apy: 0,
  amount: '1210',
  value: 125,
  votingPower: '1250',
  rewards: [],
  locks: [],
  votingWeight: 0.02,
  activeProposals: [],
}

export const migrationPreviewPortfolio: PortfolioResponse = {
  totalHoldingsUSD: 125,
  indexDTFs: [],
  yieldDTFs: [],
  stakedRSR: [],
  voteLocks: [migrationPreviewLegacyVoteLock],
  rsrBalances: [],
}

export function migrationPreviewPortfolioAtStep(
  step: number
): PortfolioResponse {
  if (step === 0) return migrationPreviewPortfolio

  if (step < 3) {
    return {
      ...migrationPreviewPortfolio,
      voteLocks: [],
      rsrBalances: [
        {
          chainId: migrationPreviewLegacyVoteLock.chainId,
          amount: '1250',
          value: 125,
          price: 0.1,
          performance7d: null,
        },
      ],
    }
  }

  return {
    ...migrationPreviewPortfolio,
    voteLocks: [
      {
        ...migrationPreviewLegacyVoteLock,
        stTokenAddress: '0x0000000000000000000000000000000000000104',
        name: 'Shared vlRSR vote-lock',
        symbol: 'vlRSR',
        amount: '1250',
        votingPower: '1250',
      },
    ],
  }
}
