import { EUSD_ADDRESS } from '@/utils/addresses'
import { ChainId } from '@/utils/chains'
import { RESERVE_API } from '@/utils/constants'
import { z } from 'zod'

const UNDERLYING_FEES_RTOKENS: Record<number, string[]> = {
  [ChainId.Mainnet]: [EUSD_ADDRESS[ChainId.Mainnet]],
}

export const isUnderlyingFeesEnabled = (chainId: number, address: string) =>
  !!UNDERLYING_FEES_RTOKENS[chainId]?.some(
    (enabled) => enabled.toLowerCase() === address.toLowerCase()
  )

const feeCategorySchema = z.enum(['management', 'performance', 'protocol'])

const feeAmountsSchema = z.object({
  management: z.number(),
  performance: z.number(),
  protocol: z.number(),
  total: z.number(),
})

const feeRateSchema = z.object({
  category: feeCategorySchema,
  basis: z.enum(['aum', 'interest']),
  rate: z.number(),
  layer: z.object({
    kind: z.string(),
    address: z.string(),
    label: z.string(),
  }),
  weight: z.number(),
  source: z.enum(['onchain', 'estimated']),
})

const feeCollateralSchema = z.object({
  address: z.string(),
  symbol: z.string(),
  label: z.string(),
  positionUsd: z.number(),
  status: z.enum(['onchain', 'estimated', 'unavailable']),
  rates: z.array(feeRateSchema),
  accrued: feeAmountsSchema,
})

const underlyingFeesSchema = z.object({
  rToken: z.string(),
  chainId: z.number(),
  period: z.object({ from: z.number().nullable(), to: z.number().nullable() }),
  trackingSince: z.number().nullable(),
  lastSnapshotAt: z.number().nullable(),
  annualizedDragBps: z.number(),
  totals: feeAmountsSchema,
  collaterals: z.array(feeCollateralSchema),
})

export type FeeCategory = z.infer<typeof feeCategorySchema>
export type FeeRate = z.infer<typeof feeRateSchema>
export type FeeCollateral = z.infer<typeof feeCollateralSchema>
export type UnderlyingFees = z.infer<typeof underlyingFeesSchema>
export type UnderlyingFeesPeriod = '30d' | 'ytd' | '1y'

export class UnderlyingFeesRequestError extends Error {
  constructor(readonly status: number) {
    super(`Underlying fees request failed: ${status}`)
  }
}

export const fetchUnderlyingFees = async (
  chainId: number,
  address: string,
  period: UnderlyingFeesPeriod
): Promise<UnderlyingFees> => {
  const response = await fetch(
    `${RESERVE_API}yield-dtf/underlying-fees?chainId=${chainId}&address=${address}&period=${period}`
  )

  if (!response.ok) {
    throw new UnderlyingFeesRequestError(response.status)
  }

  return underlyingFeesSchema.parse(await response.json())
}
