export const MANUAL_ISSUANCE_ANCHORS = [
  'Mint requirements',
  'Redeem preview',
] as const

export type ManualIssuanceAnchorState = (typeof MANUAL_ISSUANCE_ANCHORS)[number]

export type ManualIssuanceOperation = 'mint' | 'redeem'

export type ManualAssetFixture = {
  balance: string
  name: string
  permission: 'approved' | 'approve' | 'revoke'
  required: string
  symbol: string
  value: string
}

type ManualAssetSource = Omit<ManualAssetFixture, 'required' | 'value'> & {
  baseAmount: bigint
  decimals: number
  maximumFractionDigits: number
  minimumFractionDigits: number
  valueCents: bigint
}

const MANUAL_ASSET_SOURCES: ManualAssetSource[] = [
  {
    baseAmount: 180_000n,
    balance: '0.0041 WBTC',
    decimals: 8,
    maximumFractionDigits: 5,
    minimumFractionDigits: 4,
    name: 'Wrapped Bitcoin',
    permission: 'approved',
    symbol: 'WBTC',
    valueCents: 351_280n,
  },
  {
    baseAmount: 1_024_000_000_000_000_000n,
    balance: '1.804 WETH',
    decimals: 18,
    maximumFractionDigits: 4,
    minimumFractionDigits: 3,
    name: 'Wrapped Ether',
    permission: 'approve',
    symbol: 'WETH',
    valueCents: 348_720n,
  },
  {
    baseAmount: 1_378_000_000_000_000_000n,
    balance: '2.10 WBNB',
    decimals: 18,
    maximumFractionDigits: 4,
    minimumFractionDigits: 3,
    name: 'Wrapped BNB',
    permission: 'revoke',
    symbol: 'WBNB',
    valueCents: 125_000n,
  },
  {
    baseAmount: 6_785_700_000_000_000_000n,
    balance: '8.22 AAVE',
    decimals: 18,
    maximumFractionDigits: 4,
    minimumFractionDigits: 2,
    name: 'Aave',
    permission: 'approve',
    symbol: 'AAVE',
    valueCents: 95_000n,
  },
  {
    baseAmount: 118_934_300_000_000_000_000_000n,
    balance: '125,000 RSR',
    decimals: 18,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    name: 'Reserve Rights',
    permission: 'approved',
    symbol: 'RSR',
    valueCents: 79_686n,
  },
]

const SHARE_SCALE = 1_000_000n
const BASE_SHARE_AMOUNT = 100n * SHARE_SCALE

export const manualAssetsForAmount = (
  amount: string
): ManualAssetFixture[] | null => {
  const shareAmount = parseShareAmount(amount)

  if (shareAmount === null) return null

  return MANUAL_ASSET_SOURCES.map((asset) => ({
    balance: asset.balance,
    name: asset.name,
    permission: asset.permission,
    required: `${formatAtomicAmount(
      scaleFixtureValue(asset.baseAmount, shareAmount),
      asset.decimals,
      asset.maximumFractionDigits,
      asset.minimumFractionDigits
    )} ${asset.symbol}`,
    symbol: asset.symbol,
    value: formatCurrency(
      scaleFixtureValueRounded(asset.valueCents, shareAmount)
    ),
  }))
}

export const manualShareValueForAmount = (amount: string) => {
  const shareAmount = parseShareAmount(amount)

  return shareAmount === null
    ? null
    : formatCurrency(scaleFixtureValueRounded(1_004_120n, shareAmount))
}

export const manualBasketValueForAmount = (amount: string) => {
  const shareAmount = parseShareAmount(amount)

  if (shareAmount === null) return null

  return formatCurrency(
    MANUAL_ASSET_SOURCES.reduce(
      (total, asset) =>
        total + scaleFixtureValueRounded(asset.valueCents, shareAmount),
      0n
    )
  )
}

export const isManualAmountPositive = (amount: string) => {
  const shareAmount = parseShareAmount(amount)

  return shareAmount !== null && shareAmount > 0n
}

export const operationForManualAnchor = (
  state: ManualIssuanceAnchorState
): ManualIssuanceOperation => (state === 'Redeem preview' ? 'redeem' : 'mint')

const parseShareAmount = (value: string): bigint | null => {
  const normalized = value.replaceAll(',', '').trim()
  const match = /^(\d{0,12})(?:\.(\d{0,6}))?$/.exec(normalized)

  if (!match || (!match[1] && !match[2])) return null

  const whole = BigInt(match[1] || '0')
  const fraction = BigInt((match[2] ?? '').padEnd(6, '0'))

  return whole * SHARE_SCALE + fraction
}

const scaleFixtureValue = (baseValue: bigint, shares: bigint) =>
  (baseValue * shares) / BASE_SHARE_AMOUNT

const scaleFixtureValueRounded = (baseValue: bigint, shares: bigint) =>
  (baseValue * shares + BASE_SHARE_AMOUNT / 2n) / BASE_SHARE_AMOUNT

const formatCurrency = (cents: bigint) => {
  const whole = (cents / 100n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  const fraction = (cents % 100n).toString().padStart(2, '0')

  return `$${whole}.${fraction}`
}

const formatAtomicAmount = (
  value: bigint,
  decimals: number,
  maximumFractionDigits: number,
  minimumFractionDigits: number
) => {
  const omittedDecimals = decimals - maximumFractionDigits
  const roundingScale = 10n ** BigInt(omittedDecimals)
  const rounded = (value + roundingScale / 2n) / roundingScale
  const displayScale = 10n ** BigInt(maximumFractionDigits)
  const whole = (rounded / displayScale)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  const fraction = (rounded % displayScale)
    .toString()
    .padStart(maximumFractionDigits, '0')
    .replace(/0+$/, '')
    .padEnd(minimumFractionDigits, '0')

  return fraction ? `${whole}.${fraction}` : whole
}
