import type {
  PortfolioResponse,
  PortfolioVoteLock,
} from '../../src/views/portfolio-page/types'
import { getAddress } from 'viem'
import { sourceDaos, sourceSharedVault } from './earn-source-data'

export const ownedSource: PortfolioResponse = {
  totalHoldingsUSD: 292.66,
  indexDTFs: [],
  yieldDTFs: [],
  rsrBalances: [],
  voteLocks: sourceDaos
    .filter((row) => row.token.symbol !== 'vlRSR-CMCindex')
    .map(
      (row) =>
        ({
          stTokenAddress: getAddress(row.token.address),
          chainId: row.chainId,
          name: row.token.name,
          symbol: row.token.symbol,
          underlying: {
            ...row.underlying.token,
            address: getAddress(row.underlying.token.address),
          },
          dtfs: row.dtfs.map((token) => ({
            ...token,
            address: getAddress(token.address),
          })),
          apy: row.apr,
          amount: '1000',
          value: 42.66,
          votingPower: '0',
          rewards: [],
          locks: [],
          votingWeight: 0,
          activeProposals: [],
        }) satisfies PortfolioVoteLock
    ),
  stakedRSR: [],
}
ownedSource.stakedRSR.push({
  address: '0xa0d69e286b938e21cbf7e51d71f6a4c8918f482f',
  stRSRAddress: '0x18ba6e33ceb80f077deb9260c9111e62f21ae7b8',
  name: 'Electronic Dollar',
  symbol: 'eUSD',
  chainId: 1,
  amount: '62500',
  value: 164.68,
  performance7d: null,
  apy: 6.12,
  votingPower: '0',
  delegate: null,
  activeProposals: [],
  rsrAmount: '117600',
  votingWeight: 0,
  pendingWithdrawals: [],
})
ownedSource.stakedRSR.push({
  ...ownedSource.stakedRSR[0],
  address: '0xcc7ff230365bd730ee4b352cc2492cedac49383e',
  stRSRAddress: '0x796d2367af69deb3319b8e10712b8b65957371c3',
  chainId: 8453,
  symbol: 'hyUSD',
  name: 'High Yield USD',
  amount: '0',
  value: 0,
  rsrAmount: '0',
  pendingWithdrawals: [
    {
      endId: 1,
      amount: '250',
      value: 1.46,
      delay: 1209600,
      availableAt: 2000000000,
    },
  ],
})
export { sourceSharedVault }
