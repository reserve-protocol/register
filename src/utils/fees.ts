import { formatPercentage } from './index'

export const MIN_DAO_FEE_PERCENTAGE = 0.15

export const formatDtfFeePercentage = (
  fee: number,
  feeFloor = MIN_DAO_FEE_PERCENTAGE
) => formatPercentage(Math.max(fee * 100, feeFloor))

export const getEffectivePlatformShare = ({
  fee,
  feeFloor = MIN_DAO_FEE_PERCENTAGE,
  platformShare,
}: {
  fee: number
  feeFloor?: number
  platformShare: number
}) => {
  const displayedFee = Math.max(fee * 100, feeFloor)
  const floorShare = displayedFee ? (feeFloor / displayedFee) * 100 : 100

  return Math.min(100, Math.max(platformShare, floorShare))
}
