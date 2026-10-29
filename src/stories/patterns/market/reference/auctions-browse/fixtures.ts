export interface RebalanceIdentity {
  id: string
  title: string
  creationTime: number
  proposer: string
  nonce: number
  restrictedUntil: number
  availableUntil: number
}

export const CMC20_ADDRESS = '0x2f8a339b5889ffac4c5a956787cda593b3c36867'

export const REBALANCE_IDENTITIES: RebalanceIdentity[] = [
  {
    id: '61599063002015809294990623651485426780864054918295694975209877368266408019309',
    title: 'August 2026 Rebalance',
    creationTime: 1785783029,
    proposer: '0xb209eed4d80fb47e5c16577e44dad1073c5c5015',
    nonce: 11,
    restrictedUntil: 1786227244,
    availableUntil: 1786313644,
  },
  {
    id: '87907500144414917179255128099168694097277683731973227045053109024251964127398',
    title: 'July Rebalance 2026',
    creationTime: 1782920925,
    proposer: '0xb209eed4d80fb47e5c16577e44dad1073c5c5015',
    nonce: 10,
    restrictedUntil: 1783364084,
    availableUntil: 1783364084,
  },
  {
    id: '23248694086402002290088704377398656735246472257581769394170384582916040139824',
    title: 'June 2026 Rebalance',
    creationTime: 1780340502,
    proposer: '0xb209eed4d80fb47e5c16577e44dad1073c5c5015',
    nonce: 9,
    restrictedUntil: 1781008480,
    availableUntil: 1781094880,
  },
  {
    id: '100494821337414379311373500756008562824516816764677786702316513256347665638382',
    title: 'Swap Wrapped TONCOIN Basket Component',
    creationTime: 1763005163,
    proposer: '0xb209eed4d80fb47e5c16577e44dad1073c5c5015',
    nonce: 2,
    restrictedUntil: 1763371611,
    availableUntil: 1763371611,
  },
]

export const PREVIEW_STATES = {
  default: 'Default',
  pressure: 'Long content',
  'metrics-loading': 'Metrics loading',
  unavailable: 'Unavailable',
  'price-unavailable': 'Price unavailable — cannot launch',
  zero: 'Zero',
  historical: 'Historical Rebalances',
  loading: 'Loading',
  empty: 'Empty',
} as const

export type PreviewState = keyof typeof PREVIEW_STATES
export type AuctionPhase = 'restricted' | 'permissionless' | 'ongoing'
export type AuctionsRun = 0 | 1 | 2

export const AUCTION_PHASES: Record<AuctionPhase, string> = {
  restricted: 'Restricted period',
  permissionless: 'Permissionless',
  ongoing: 'Ongoing auction',
}

export const ILLUSTRATIVE_METRICS = [
  { accuracy: 96.4, priceImpact: 1.51, auctions: 3, traded: '$84,210' },
  { accuracy: 100, priceImpact: -0.12, auctions: 1, traded: '$11,593' },
  { accuracy: 98.2, priceImpact: 0, auctions: 2, traded: '$120,000' },
] as const

export const ONGOING_FIXTURE = {
  frozenAt: 1786227304,
  endTime: 1786227604,
} as const
