export const MANUAL_ISSUANCE_ANCHORS = [
  'Mint requirements',
  'Redeem preview',
] as const

export type ManualIssuanceAnchorState = (typeof MANUAL_ISSUANCE_ANCHORS)[number]

export type ManualIssuanceOperation = 'mint' | 'redeem'

export type ManualAssetFixture = {
  address: string
  balance: string
  name: string
  permission: 'approved' | 'approve' | 'revoke' | null
  isInsufficient: boolean
  required: string
  symbol: string
  value: string
  requiredAmount: bigint
  allowanceAmount: bigint
}

type ManualAssetSource = {
  address: string
  name: string
  symbol: string
  balanceAmount: bigint
  allowance: bigint
  requiresReset?: boolean
  baseAmount: bigint
  decimals: number
  maximumFractionDigits: number
  minimumFractionDigits: number
  valueCents: bigint
}

const MANUAL_ASSET_SOURCES: ManualAssetSource[] = [
  {
    address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    baseAmount: 180_000n,
    balanceAmount: 410_000n,
    allowance: 360_000n,
    decimals: 8,
    maximumFractionDigits: 5,
    minimumFractionDigits: 4,
    name: 'Wrapped Bitcoin',
    symbol: 'WBTC',
    valueCents: 351_280n,
  },
  {
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    baseAmount: 1_024_000_000_000_000_000n,
    balanceAmount: 1_804_000_000_000_000_000n,
    allowance: 0n,
    decimals: 18,
    maximumFractionDigits: 4,
    minimumFractionDigits: 3,
    name: 'Wrapped Ether',
    symbol: 'WETH',
    valueCents: 348_720n,
  },
  {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    baseAmount: 1_250_000_000n,
    balanceAmount: 2_100_000_000n,
    allowance: 1_000_000n,
    requiresReset: true,
    decimals: 6,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    name: 'Tether USD',
    symbol: 'USDT',
    valueCents: 125_000n,
  },
  {
    address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
    baseAmount: 6_785_700_000_000_000_000n,
    balanceAmount: 8_220_000_000_000_000_000n,
    allowance: 0n,
    decimals: 18,
    maximumFractionDigits: 4,
    minimumFractionDigits: 2,
    name: 'Aave',
    symbol: 'AAVE',
    valueCents: 95_000n,
  },
  {
    address: '0x320623b8E4fF03373931769A31Fc52A4E78B5d70',
    baseAmount: 118_934_300_000_000_000_000_000n,
    balanceAmount: 125_000_000_000_000_000_000_000n,
    allowance: 237_868_600_000_000_000_000_000n,
    decimals: 18,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    name: 'Reserve Rights',
    symbol: 'RSR',
    valueCents: 79_686n,
  },
]

const SHARE_SCALE = 1_000_000n
const BASE_SHARE_AMOUNT = 100n * SHARE_SCALE
const WALLET_SHARES = 124_630_000n

export const manualMaxAmountForOperation = (
  operation: ManualIssuanceOperation
) => {
  const maximum =
    operation === 'redeem'
      ? WALLET_SHARES
      : (MANUAL_ASSET_SOURCES.reduce<bigint | null>((limit, asset) => {
          const capacity =
            (asset.balanceAmount * BASE_SHARE_AMOUNT) / asset.baseAmount
          return limit === null || capacity < limit ? capacity : limit
        }, null) ?? 0n)

  return formatAtomicAmount(maximum, 6, 6, 0).replaceAll(',', '')
}

export const manualAmountExceedsBalance = (
  amount: string,
  operation: ManualIssuanceOperation
) => {
  const shares = parseShareAmount(amount)
  if (shares === null) return false
  return operation === 'redeem'
    ? shares > WALLET_SHARES
    : manualAssetsForAmount(amount).some((asset) => asset.isInsufficient)
}

export const manualAssetsForAmount = (
  amount: string,
  allowances: Record<string, bigint> = {}
): ManualAssetFixture[] => {
  const shareAmount = parseShareAmount(amount)
  const hasAmount = shareAmount !== null && shareAmount > 0n

  return MANUAL_ASSET_SOURCES.map((asset) => {
    const required = hasAmount
      ? (asset.baseAmount * shareAmount + BASE_SHARE_AMOUNT - 1n) /
        BASE_SHARE_AMOUNT
      : 0n
    const allowance = allowances[asset.symbol] ?? asset.allowance
    const needsApproval = allowance < required
    return {
      address: asset.address,
      requiredAmount: required,
      allowanceAmount: allowance,
      balance: `${formatAtomicAmount(asset.balanceAmount, asset.decimals, asset.maximumFractionDigits, asset.minimumFractionDigits)} ${asset.symbol}`,
      name: asset.name,
      permission: !hasAmount
        ? null
        : !needsApproval
          ? 'approved'
          : asset.requiresReset && allowance > 0n
            ? 'revoke'
            : 'approve',
      isInsufficient: required > asset.balanceAmount,
      required: hasAmount
        ? `${formatAtomicAmount(
            required,
            asset.decimals,
            asset.maximumFractionDigits,
            asset.minimumFractionDigits
          )} ${asset.symbol}`
        : '—',
      symbol: asset.symbol,
      value: hasAmount
        ? formatCurrency(
            scaleFixtureValueRounded(asset.valueCents, shareAmount)
          )
        : '—',
    }
  })
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
