import { ChainId } from '@/utils/chains'

export const AUTOMATED_MINT_STATE_GROUPS = [
  {
    label: 'Configure',
    states: [
      'Introduction',
      'Wallet required',
      'Incompatible wallet',
      'Initial configuration',
      'Trading paused',
      'BSC configuration',
    ],
  },
  {
    label: 'Quote',
    states: [
      'Quote searching',
      'Quote paused',
      'Quote unavailable',
      'Input only ready',
      'Existing collateral ready',
      'Existing collateral only',
      'Price unavailable',
      'Per-order quote failure',
      'Split order quotes',
      'No swaps needed',
    ],
  },
  {
    label: 'Execute',
    states: [
      'Authorizing orders',
      'Orders filling',
      'Recoverable failure',
      'Collateral ready',
      'Final mint signing',
      'Cancelled order',
      'Wallet unavailable',
      'Transaction failed',
    ],
  },
  { label: 'Outcome', states: ['Mint complete', 'Redeem complete'] },
] as const

export type AutomatedMintReviewState =
  (typeof AUTOMATED_MINT_STATE_GROUPS)[number]['states'][number]

export type AutomatedIssuanceOperation = 'mint' | 'redeem'

export type AutomatedMintOrderStatus =
  | 'Quote ready'
  | 'Prepared'
  | 'Pending'
  | 'Filled'
  | 'Failed'
  | 'Expired'
  | 'Cancelled'
  | 'Quote unavailable'

export type FixtureAmount = {
  decimals: number
  symbol: string
  value: bigint
}

export type AutomatedMintOrderFixture = {
  asset: string
  bought: FixtureAmount
  boughtIsEstimate: boolean
  orderId?: string
  sold: FixtureAmount
  status: AutomatedMintOrderStatus
}

export type AutomatedMintInputFixture = {
  amount?: FixtureAmount
  display: string
  exceedsBalance?: boolean
  usdDisplay: string
}

const USDC_DECIMALS = 6
const USDT_DECIMALS = 18
const WBTC_DECIMALS = 8
const WETH_DECIMALS = 18
const TOKEN_DECIMALS = 18
const ZERO_USD_DISPLAY = '$0.00'

export type AutomatedIssuanceChain = typeof ChainId.Base | typeof ChainId.BSC

export const quoteTokenForChain = (chain: AutomatedIssuanceChain) =>
  chain === ChainId.BSC
    ? { decimals: USDT_DECIMALS, symbol: 'USDT' }
    : { decimals: USDC_DECIMALS, symbol: 'USDC' }

const ORDER_IDS = [
  '0x41c8be21a1ab44007f8710f523b6627d63b91d2d9b1ba8dbd3f598d29418a12ba0a8481fc246cd12f75227abb96220ff5360fad36b8b4567',
  '0x09ed2c946184444b7f155e2f43398929516057c8b440accb9866192d621e8c44a0a8481fc246cd12f75227abb96220ff5360fad36b8b45f0',
  '0x79585f0026812e401e54a6c220375bf3943b0eae09673fe8b35f893b8fd2c0daa0a8481fc246cd12f75227abb96220ff5360fad36b8b456a',
  '0x589421262494b6dccc2131173d4d6447c0fb1c70113e74f4c81f565864a1640fa0a8481fc246cd12f75227abb96220ff5360fad36b8b456b',
  '0x0b5e282f8bbb346536671b1209ab59673807dc1844c1d50b46d6af5aedfb1676a0a8481fc246cd12f75227abb96220ff5360fad36b8b456c',
] as const

const amount = (
  value: bigint,
  decimals: number,
  symbol: string
): FixtureAmount => ({ value, decimals, symbol })

const inputOnlyOrders: AutomatedMintOrderFixture[] = [
  {
    asset: 'WBTC',
    sold: amount(3_512_800_000n, USDC_DECIMALS, 'USDC'),
    bought: amount(5_418_000n, WBTC_DECIMALS, 'WBTC'),
    boughtIsEstimate: true,
    status: 'Quote ready',
  },
  {
    asset: 'WETH',
    sold: amount(3_487_200_000n, USDC_DECIMALS, 'USDC'),
    bought: amount(1_024_000_000_000_000_000n, WETH_DECIMALS, 'WETH'),
    boughtIsEstimate: true,
    status: 'Quote ready',
  },
  {
    asset: 'WBNB',
    sold: amount(1_250_000_000n, USDC_DECIMALS, 'USDC'),
    bought: amount(1_378_000_000_000_000_000n, TOKEN_DECIMALS, 'WBNB'),
    boughtIsEstimate: true,
    status: 'Quote ready',
  },
  {
    asset: 'AAVE',
    sold: amount(950_000_000n, USDC_DECIMALS, 'USDC'),
    bought: amount(6_785_700_000_000_000_000n, TOKEN_DECIMALS, 'AAVE'),
    boughtIsEstimate: true,
    status: 'Quote ready',
  },
  {
    asset: 'RSR',
    sold: amount(796_860_000n, USDC_DECIMALS, 'USDC'),
    bought: amount(118_934_300_000_000_000_000_000n, TOKEN_DECIMALS, 'RSR'),
    boughtIsEstimate: true,
    status: 'Quote ready',
  },
]

const existingCollateralOrders: AutomatedMintOrderFixture[] = [
  {
    asset: 'WBTC',
    sold: amount(2_605_600_000n, USDC_DECIMALS, 'USDC'),
    bought: amount(4_018_000n, WBTC_DECIMALS, 'WBTC'),
    boughtIsEstimate: true,
    status: 'Quote ready',
  },
  {
    asset: 'WETH',
    sold: amount(2_111_200_000n, USDC_DECIMALS, 'USDC'),
    bought: amount(624_000_000_000_000_000n, WETH_DECIMALS, 'WETH'),
    boughtIsEstimate: true,
    status: 'Quote ready',
  },
  {
    asset: 'WBNB',
    sold: amount(1_250_000_000n, USDC_DECIMALS, 'USDC'),
    bought: amount(1_378_000_000_000_000_000n, TOKEN_DECIMALS, 'WBNB'),
    boughtIsEstimate: true,
    status: 'Quote ready',
  },
  {
    asset: 'AAVE',
    sold: amount(950_000_000n, USDC_DECIMALS, 'USDC'),
    bought: amount(6_785_700_000_000_000_000n, TOKEN_DECIMALS, 'AAVE'),
    boughtIsEstimate: true,
    status: 'Quote ready',
  },
  {
    asset: 'RSR',
    sold: amount(796_860_000n, USDC_DECIMALS, 'USDC'),
    bought: amount(118_934_300_000_000_000_000_000n, TOKEN_DECIMALS, 'RSR'),
    boughtIsEstimate: true,
    status: 'Quote ready',
  },
]

const redeemOrders: AutomatedMintOrderFixture[] = [
  {
    asset: 'WBTC',
    sold: amount(5_418_000n, WBTC_DECIMALS, 'WBTC'),
    bought: amount(3_509_200_000n, USDC_DECIMALS, 'USDC'),
    boughtIsEstimate: true,
    status: 'Quote ready',
  },
  {
    asset: 'WETH',
    sold: amount(1_024_000_000_000_000_000n, WETH_DECIMALS, 'WETH'),
    bought: amount(3_480_100_000n, USDC_DECIMALS, 'USDC'),
    boughtIsEstimate: true,
    status: 'Quote ready',
  },
  {
    asset: 'WBNB',
    sold: amount(1_378_000_000_000_000_000n, TOKEN_DECIMALS, 'WBNB'),
    bought: amount(1_241_000_000n, USDC_DECIMALS, 'USDC'),
    boughtIsEstimate: true,
    status: 'Quote ready',
  },
  {
    asset: 'AAVE',
    sold: amount(6_785_700_000_000_000_000n, TOKEN_DECIMALS, 'AAVE'),
    bought: amount(943_250_000n, USDC_DECIMALS, 'USDC'),
    boughtIsEstimate: true,
    status: 'Quote ready',
  },
  {
    asset: 'RSR',
    sold: amount(118_934_300_000_000_000_000_000n, TOKEN_DECIMALS, 'RSR'),
    bought: amount(793_800_000n, USDC_DECIMALS, 'USDC'),
    boughtIsEstimate: true,
    status: 'Quote ready',
  },
]

const redeemExistingCollateralAdditions: AutomatedMintOrderFixture[] = [
  {
    ...redeemOrders[0],
    sold: amount(1_400_000n, WBTC_DECIMALS, 'WBTC'),
    bought: amount(907_200_000n, USDC_DECIMALS, 'USDC'),
  },
  {
    ...redeemOrders[1],
    sold: amount(400_000_000_000_000_000n, WETH_DECIMALS, 'WETH'),
    bought: amount(1_376_000_000n, USDC_DECIMALS, 'USDC'),
  },
  ...redeemOrders.slice(2).map((order) => ({
    ...order,
    sold: { ...order.sold, value: 0n },
    bought: { ...order.bought, value: 0n },
  })),
]

const existingCollateralOrderReductions = inputOnlyOrders.map(
  (order, index) => ({
    bought: {
      ...order.bought,
      value: order.bought.value - existingCollateralOrders[index].bought.value,
    },
    sold: {
      ...order.sold,
      value: order.sold.value - existingCollateralOrders[index].sold.value,
    },
  })
)

export const EXISTING_COLLATERAL = [
  {
    amount: amount(1_400_000n, WBTC_DECIMALS, 'WBTC'),
    usdValue: 907_200_000_000_000_000_000n,
  },
  {
    amount: amount(400_000_000_000_000_000n, WETH_DECIMALS, 'WETH'),
    usdValue: 1_376_000_000_000_000_000_000n,
  },
]

export const INPUT_AMOUNT = amount(10_000_000_000n, USDC_DECIMALS, 'USDC')
export const BSC_INPUT_AMOUNT = amount(
  10_000_000_000_000_000_000_000n,
  USDT_DECIMALS,
  'USDT'
)
export const REDEEM_INPUT_AMOUNT = amount(
  100_000_000_000_000_000_000n,
  TOKEN_DECIMALS,
  'CMC20'
)

export const AUTOMATED_MINT_QUOTED_PRICE_IMPACT = '-0.18%'
export const AUTOMATED_MINT_ACTUAL_PRICE_IMPACT = '-0.16%'
export const AUTOMATED_MINT_MAX_SLIPPAGE = '0.50%'

export const INPUT_BALANCE = amount(14_802_630_000n, USDC_DECIMALS, 'USDC')
export const BSC_INPUT_BALANCE = amount(
  14_802_630_000_000_000_000_000n,
  USDT_DECIMALS,
  'USDT'
)
export const REDEEM_INPUT_BALANCE = amount(
  164_325_000_000_000_000_000n,
  TOKEN_DECIMALS,
  'CMC20'
)

export const DEFAULT_INPUT: AutomatedMintInputFixture = {
  amount: INPUT_AMOUNT,
  display: '10,000',
  usdDisplay: '$10,000.00',
}

export const DEFAULT_BSC_INPUT: AutomatedMintInputFixture = {
  amount: BSC_INPUT_AMOUNT,
  display: '10,000',
  usdDisplay: '$10,000.00',
}

export const EMPTY_INPUT: AutomatedMintInputFixture = {
  display: '',
  usdDisplay: ZERO_USD_DISPLAY,
}

export const EMPTY_BSC_INPUT: AutomatedMintInputFixture = {
  display: '',
  usdDisplay: ZERO_USD_DISPLAY,
}

export const MAX_INPUT: AutomatedMintInputFixture = {
  amount: INPUT_BALANCE,
  display: '14,802.63',
  usdDisplay: '$14,802.63',
}

export const MAX_BSC_INPUT: AutomatedMintInputFixture = {
  amount: BSC_INPUT_BALANCE,
  display: '14,802.63',
  usdDisplay: '$14,802.63',
}

export const DEFAULT_REDEEM_INPUT: AutomatedMintInputFixture = {
  amount: REDEEM_INPUT_AMOUNT,
  display: '100',
  usdDisplay: '$10,000.00',
}

export const EMPTY_REDEEM_INPUT: AutomatedMintInputFixture = {
  display: '',
  usdDisplay: ZERO_USD_DISPLAY,
}

export const MAX_REDEEM_INPUT: AutomatedMintInputFixture = {
  amount: REDEEM_INPUT_BALANCE,
  display: '164.325',
  usdDisplay: '$16,432.50',
}

export const defaultInputFor = (
  operation: AutomatedIssuanceOperation,
  chain: AutomatedIssuanceChain = ChainId.Base
) =>
  operation === 'mint'
    ? chain === ChainId.BSC
      ? DEFAULT_BSC_INPUT
      : DEFAULT_INPUT
    : DEFAULT_REDEEM_INPUT

export const emptyInputFor = (
  operation: AutomatedIssuanceOperation,
  chain: AutomatedIssuanceChain = ChainId.Base
) =>
  operation === 'mint' && chain === ChainId.BSC
    ? EMPTY_BSC_INPUT
    : operation === 'mint'
      ? EMPTY_INPUT
      : EMPTY_REDEEM_INPUT

export const inputBalanceFor = (
  operation: AutomatedIssuanceOperation,
  chain: AutomatedIssuanceChain = ChainId.Base
) =>
  operation === 'mint'
    ? chain === ChainId.BSC
      ? BSC_INPUT_BALANCE
      : INPUT_BALANCE
    : REDEEM_INPUT_BALANCE

export const maxInputFor = (
  operation: AutomatedIssuanceOperation,
  chain: AutomatedIssuanceChain = ChainId.Base
) =>
  operation === 'mint'
    ? chain === ChainId.BSC
      ? MAX_BSC_INPUT
      : MAX_INPUT
    : MAX_REDEEM_INPUT

export const inputFixtureFromDisplay = (
  display: string,
  operation: AutomatedIssuanceOperation = 'mint',
  chain: AutomatedIssuanceChain = ChainId.Base
): AutomatedMintInputFixture => {
  const normalized = display.replaceAll(',', '').trim()
  const quoteToken = quoteTokenForChain(chain)
  const decimals = operation === 'mint' ? quoteToken.decimals : TOKEN_DECIMALS
  const decimalPattern = new RegExp(`^\\d+(?:\\.\\d{0,${decimals}})?$`)

  if (!decimalPattern.test(normalized)) {
    return {
      display,
      usdDisplay: normalized
        ? `Enter a valid ${operation === 'mint' ? quoteToken.symbol : 'CMC20'} amount`
        : emptyInputFor(operation, chain).usdDisplay,
    }
  }

  const [whole, fraction = ''] = normalized.split('.')
  const value =
    BigInt(whole) * 10n ** BigInt(decimals) +
    BigInt(fraction.padEnd(decimals, '0'))

  if (value === 0n) {
    return {
      display,
      usdDisplay: 'Enter an amount greater than zero',
    }
  }

  return {
    amount: amount(
      value,
      decimals,
      operation === 'mint' ? quoteToken.symbol : 'CMC20'
    ),
    display,
    exceedsBalance: value > inputBalanceFor(operation, chain).value,
    usdDisplay: formatUsdFixture(
      operation === 'mint' ? value * 10n ** BigInt(18 - decimals) : value * 100n
    ),
  }
}

export const MINTED_AMOUNT = amount(99_820_000_000_000_000_000n, 18, 'CMC20')

export const UNUSED_AMOUNT = amount(3_140_000n, USDC_DECIMALS, 'USDC')

export const EXISTING_COLLATERAL_INPUT_EQUIVALENT = amount(
  2_283_200_000n,
  USDC_DECIMALS,
  'USDC'
)

export const OUTPUT_USD_VALUE = 9_982_000_000_000_000_000_000n

export const DUST_USD_VALUE = 420_000_000_000_000_000n
export const REDEEM_DUST_USD_VALUE = 1_240_000_000_000_000_000n

export const REDEEM_COLLATERAL_ONLY_INPUT: AutomatedMintInputFixture = {
  amount: amount(0n, TOKEN_DECIMALS, 'CMC20'),
  display: '0',
  usdDisplay: 'No CMC20 shares',
}

export const FINAL_MINT_TRANSACTION =
  '0x4b9956225163659ad723853515456526280c1e9cc5b842c3df1b9c7443bb01ae'

export const FINAL_REDEEM_TRANSACTION =
  '0x7195cb5535dd308cf1c32decb8f787974ff52d9c8a13f70d2e80dad366a4ef2d'

const mintExistingReductionFor = (
  index: number,
  scaledBought: FixtureAmount,
  scaledSold: FixtureAmount
) => {
  const available = existingCollateralOrderReductions[index]
  const soldValue =
    scaledSold.value < available.sold.value
      ? scaledSold.value
      : available.sold.value

  return {
    bought: {
      ...available.bought,
      value:
        soldValue === scaledSold.value
          ? scaledBought.value
          : available.sold.value > 0n
            ? (available.bought.value * soldValue) / available.sold.value
            : 0n,
    },
    sold: { ...available.sold, value: soldValue },
  }
}

export const appliedExistingCollateralFor = (
  inputAmount: FixtureAmount,
  chain: AutomatedIssuanceChain = ChainId.Base
) => {
  const normalizedInput = normalizeInputForFixtures(inputAmount, 'mint', chain)

  return inputOnlyOrders.reduce((total, order, index) => {
    const scaledBought = scaleFixtureAmount(order.bought, normalizedInput)
    const scaledSold = scaleFixtureAmount(order.sold, normalizedInput)
    return (
      total +
      mintExistingReductionFor(index, scaledBought, scaledSold).sold.value
    )
  }, 0n)
}

export const quoteInputForOperation = (
  inputAmount: FixtureAmount,
  operation: AutomatedIssuanceOperation
) =>
  operation === 'redeem' && inputAmount.value > REDEEM_INPUT_BALANCE.value
    ? { ...inputAmount, value: REDEEM_INPUT_BALANCE.value }
    : inputAmount

export const ordersForState = (
  state: AutomatedMintReviewState,
  useExistingCollateral = false,
  inputAmount = INPUT_AMOUNT,
  operation: AutomatedIssuanceOperation = 'mint',
  chain: AutomatedIssuanceChain = ChainId.Base
): AutomatedMintOrderFixture[] => {
  const normalizedInput = normalizeInputForFixtures(
    inputAmount,
    operation,
    chain
  )
  const quoteInput = quoteInputForOperation(normalizedInput, operation)
  const baseSource = (
    operation === 'mint'
      ? inputOnlyOrders.map((order, index) => {
          const scaledBought = scaleFixtureAmount(order.bought, quoteInput)
          const scaledSold = scaleFixtureAmount(order.sold, quoteInput)
          const reduction = useExistingCollateral
            ? mintExistingReductionFor(index, scaledBought, scaledSold)
            : undefined

          return {
            ...order,
            bought: subtractFixtureAmount(scaledBought, reduction?.bought),
            sold: subtractFixtureAmount(scaledSold, reduction?.sold),
          }
        })
      : redeemOrders.map((order, index) => ({
          ...order,
          bought: addFixtureAmount(
            scaleFixtureAmountForOperation(order.bought, quoteInput, operation),
            useExistingCollateral
              ? redeemExistingCollateralAdditions[index].bought
              : undefined
          ),
          sold: addFixtureAmount(
            scaleFixtureAmountForOperation(order.sold, quoteInput, operation),
            useExistingCollateral
              ? redeemExistingCollateralAdditions[index].sold
              : undefined
          ),
        }))
  ).filter((order) => order.sold.value > 0n || order.bought.value > 0n)
  const expandedSource =
    state === 'Split order quotes'
      ? splitFirstOrder(baseSource)
      : state === 'No swaps needed'
        ? []
        : baseSource
  const source = expandedSource.map((order) =>
    convertOrderQuoteToken(order, operation, chain)
  )

  if (state === 'Per-order quote failure') {
    return source.map((order, index) => ({
      ...order,
      status: index === 1 ? 'Quote unavailable' : 'Quote ready',
    }))
  }

  if (state === 'Authorizing orders') {
    return source.map((order, index) => ({
      ...order,
      orderId: ORDER_IDS[index],
      status: 'Prepared',
    }))
  }

  if (state === 'Orders filling') {
    return source.map((order, index) => ({
      ...order,
      orderId: ORDER_IDS[index],
      status: index === 1 ? 'Pending' : 'Filled',
    }))
  }

  if (state === 'Recoverable failure') {
    return source.map((order, index) => ({
      ...order,
      orderId: ORDER_IDS[index],
      status: index === 1 ? 'Expired' : 'Filled',
    }))
  }

  if (state === 'Cancelled order') {
    return source.map((order, index) => ({
      ...order,
      orderId: ORDER_IDS[index],
      status: index === 1 ? 'Cancelled' : 'Filled',
    }))
  }

  if (state === 'Transaction failed') {
    return source.map((order, index) => ({
      ...order,
      orderId: ORDER_IDS[index],
      status: index === 1 ? 'Pending' : 'Filled',
    }))
  }

  if (
    state === 'Collateral ready' ||
    state === 'Final mint signing' ||
    state === 'Mint complete' ||
    state === 'Redeem complete'
  ) {
    return source.map((order, index) => ({
      ...order,
      orderId: ORDER_IDS[index],
      status: 'Filled',
    }))
  }

  return source
}

export const scaleFixtureValue = (value: bigint, inputAmount: FixtureAmount) =>
  (value * inputAmount.value) / INPUT_AMOUNT.value

export const scaleFixtureAmount = (
  fixture: FixtureAmount,
  inputAmount: FixtureAmount
): FixtureAmount => ({
  ...fixture,
  value: scaleFixtureValue(fixture.value, inputAmount),
})

export const scaleFixtureAmountForOperation = (
  fixture: FixtureAmount,
  inputAmount: FixtureAmount,
  operation: AutomatedIssuanceOperation
): FixtureAmount => ({
  ...fixture,
  value:
    (fixture.value * inputAmount.value) /
    (operation === 'mint' ? INPUT_AMOUNT.value : REDEEM_INPUT_AMOUNT.value),
})

const subtractFixtureAmount = (
  fixture: FixtureAmount,
  reduction?: FixtureAmount
): FixtureAmount => ({
  ...fixture,
  value:
    reduction && fixture.value > reduction.value
      ? fixture.value - reduction.value
      : reduction
        ? 0n
        : fixture.value,
})

const addFixtureAmount = (
  fixture: FixtureAmount,
  addition?: FixtureAmount
): FixtureAmount => ({
  ...fixture,
  value: fixture.value + (addition?.value ?? 0n),
})

export const redeemOutcomeFor = (
  inputAmount: FixtureAmount,
  useExistingCollateral: boolean,
  chain: AutomatedIssuanceChain = ChainId.Base
) => {
  const quoteInput = quoteInputForOperation(inputAmount, 'redeem')
  const orders = ordersForState(
    'Redeem complete',
    useExistingCollateral,
    inputAmount,
    'redeem',
    chain
  )
  const received = orders.reduce(
    (total, order) => total + order.bought.value,
    0n
  )

  return {
    received: amount(
      received,
      quoteTokenForChain(chain).decimals,
      quoteTokenForChain(chain).symbol
    ),
    redeemed: quoteInput,
  }
}

export const outcomeFundingFor = (
  inputAmount: FixtureAmount,
  useExistingCollateral: boolean,
  chain: AutomatedIssuanceChain = ChainId.Base
) => {
  const normalizedInput = normalizeInputForFixtures(inputAmount, 'mint', chain)
  const unused = scaleFixtureAmount(UNUSED_AMOUNT, normalizedInput)
  const collateral = useExistingCollateral
    ? amount(
        appliedExistingCollateralFor(inputAmount, chain),
        USDC_DECIMALS,
        'USDC'
      )
    : amount(0n, USDC_DECIMALS, 'USDC')
  const spentValue = normalizedInput.value - collateral.value - unused.value

  return {
    collateral: convertQuoteTokenAmount(collateral, chain),
    spent: convertQuoteTokenAmount(
      amount(spentValue > 0n ? spentValue : 0n, USDC_DECIMALS, 'USDC'),
      chain
    ),
    unused: convertQuoteTokenAmount(unused, chain),
  }
}

export const normalizeInputForFixtures = (
  inputAmount: FixtureAmount,
  operation: AutomatedIssuanceOperation,
  chain: AutomatedIssuanceChain
) =>
  operation === 'mint' && chain === ChainId.BSC
    ? amount(
        inputAmount.value / 10n ** BigInt(USDT_DECIMALS - USDC_DECIMALS),
        USDC_DECIMALS,
        'USDC'
      )
    : inputAmount

const convertQuoteTokenAmount = (
  fixture: FixtureAmount,
  chain: AutomatedIssuanceChain
) =>
  chain === ChainId.BSC && fixture.symbol === 'USDC'
    ? amount(
        fixture.value * 10n ** BigInt(USDT_DECIMALS - USDC_DECIMALS),
        USDT_DECIMALS,
        'USDT'
      )
    : fixture

const convertOrderQuoteToken = (
  order: AutomatedMintOrderFixture,
  operation: AutomatedIssuanceOperation,
  chain: AutomatedIssuanceChain
) => ({
  ...order,
  bought:
    operation === 'redeem'
      ? convertQuoteTokenAmount(order.bought, chain)
      : order.bought,
  sold:
    operation === 'mint'
      ? convertQuoteTokenAmount(order.sold, chain)
      : order.sold,
})

const splitFirstOrder = (orders: AutomatedMintOrderFixture[]) => {
  const [first, ...remaining] = orders
  if (!first) return orders

  const firstBoughtValue = first.bought.value / 2n
  const firstSoldValue = first.sold.value / 2n

  return [
    {
      ...first,
      bought: { ...first.bought, value: firstBoughtValue },
      sold: { ...first.sold, value: firstSoldValue },
    },
    {
      ...first,
      bought: {
        ...first.bought,
        value: first.bought.value - firstBoughtValue,
      },
      sold: { ...first.sold, value: first.sold.value - firstSoldValue },
    },
    ...remaining,
  ]
}

export const formatFixtureAmount = (
  fixture: FixtureAmount,
  maximumFractionDigits = 4
) => {
  const scale = 10n ** BigInt(fixture.decimals)
  const integer = fixture.value / scale
  const fraction = fixture.value % scale
  const groupedInteger = integer
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  const fractionText = fraction
    .toString()
    .padStart(fixture.decimals, '0')
    .slice(0, maximumFractionDigits)
    .replace(/0+$/, '')
  const value = fractionText
    ? `${groupedInteger}.${fractionText}`
    : groupedInteger

  return `${value} ${fixture.symbol}`
}

export const formatUsdFixture = (value: bigint) => {
  const cents = value / 10n ** 16n
  const whole = cents / 100n
  const fraction = (cents % 100n).toString().padStart(2, '0')
  const groupedWhole = whole.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  return `$${groupedWhole}.${fraction}`
}
