import snapshot from './snapshot.json'

export const CURRENT_SCENARIOS = {
  ready: 'First auction · restricted',
  permissionless: 'First auction · permissionless',
  hybrid: 'Hybrid · weights required',
  live: 'Auction live · bids',
  'no-bids': 'Auction live · no bids',
  repeat: 'Next auction · prior run',
  remove: 'Remove tokens · first auction',
  progressing: 'Progressing · next auction',
  liquidity: 'Liquidity warnings · Ondo cap',
  'liquidity-closed': 'Liquidity warnings · Ondo market closed',
  complete: 'Target reached · window open',
  expired: 'Expired · incomplete',
  'expired-complete': 'Expired · complete',
  filler: 'Unlisted DTF · browser filler',
  multiple: 'Two current records',
  empty: 'No current rebalance',
  loading: 'Current records loading',
  'not-found': 'Unmatched proposal',
} as const
export type Scenario = keyof typeof CURRENT_SCENARIOS
export type Viewer = 'visitor' | 'member' | 'launcher'
export type DataState =
  | 'ready'
  | 'pending'
  | 'price-error'
  | 'auction-error'
  | 'metadata-error'
  | 'bounds'
  | 'error'
export type Outcome = 'success' | 'reject' | 'revert' | 'indexing'
type CapturedRecord = (typeof snapshot)['bsc/cmc20']
export type SourceRecord = Omit<CapturedRecord, 'tokens'> & {
  tokens: Pick<
    CapturedRecord['tokens'][number],
    'address' | 'name' | 'symbol'
  >[]
}
export type Asset = SourceRecord['tokens'][number]
export const SOURCE_RECORDS: Record<'cmc20' | 'lcap', SourceRecord> = {
  cmc20: snapshot['bsc/cmc20'],
  lcap: snapshot['base/lcap'],
}

// The liquidity pressure fixture adds a source-identified BSC asset, not a real CMC20 holding.
export const LIQUIDITY_RECORD: SourceRecord = {
  ...SOURCE_RECORDS.cmc20,
  tokens: [
    ...SOURCE_RECORDS.cmc20.tokens,
    {
      address: '0xA9eE28C80f960B889dFbd1902055218cBa016F75',
      symbol: 'NVDAon',
      name: 'NVIDIA (Ondo Tokenized)',
    },
  ],
}
export const DATA_STATES: Record<DataState, string> = {
  ready: 'Data available',
  pending: 'Prices pending',
  'price-error': 'Price unavailable',
  'auction-error': 'Auction query failed',
  'metadata-error': 'Token metadata missing',
  bounds: 'Token out of bounds',
  error: 'Metrics unavailable',
}
export const VIEWERS: Record<Viewer, string> = {
  launcher: 'Connected launcher',
  visitor: 'Disconnected visitor',
  member: 'Connected non-launcher',
}
export const OUTCOMES: Record<Outcome, string> = {
  success: 'Confirmed → auction live',
  reject: 'Wallet rejection',
  revert: 'Receipt reverted',
  indexing: 'Confirmed → indexing delayed',
}

// Holdings and starting targets deliberately differ in this illustrative editor fixture.
export const CURRENT_BASKET_UNITS = [
  '0.52',
  '0.012',
  '0.41',
  '0.12',
  '0.0048',
  '0.018',
  '0.63',
  '0.00016',
]
export const INITIAL_UNITS = [
  '0.52',
  '0.018',
  '0.37',
  '0.12',
  '0.0042',
  '0.021',
  '0.63',
  '0.00018',
]
export const UNIT_PRICES = [
  '0.18',
  '47',
  '2.9',
  '0.4',
  '4200',
  '190',
  '0.8',
  '110000',
]

export function orderedAssets(record: SourceRecord) {
  const preferred = [
    'ETH',
    'XRP',
    'TRX',
    'ADA',
    'LINK',
    'LTC',
    'AVAX',
    'BCH',
    'SHIB',
    'BTCB',
    'WBNB',
    'SOL',
  ]
  return [...record.tokens].sort((a, b) => {
    const rank = (symbol: string) => {
      const index = preferred.indexOf(symbol)
      return index < 0 ? preferred.length : index
    }
    return rank(a.symbol) - rank(b.symbol)
  })
}
