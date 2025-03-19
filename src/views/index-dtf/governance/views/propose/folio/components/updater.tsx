import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { useAtomValue } from 'jotai'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { GovernanceInputs, dtfGovernanceDefaultValues } from '../schema'

// Helper function to calculate fee shares from fee recipients
const calculateFeeShares = (
  feeRecipients: Array<{ address: string; percentage: string }>,
  deployerAddress: string,
  governanceAddress?: string
) => {
  const PERCENT_ADJUST = 100 / 50 // Adjust for fixed platform fee of 50%
  let governanceShare = 0
  let deployerShare = 0
  const additionalRevenueRecipients: Array<{
    address: `0x${string}`
    share: number
  }> = []

  for (const recipient of feeRecipients) {
    const adjustedPercentage = Number(recipient.percentage) / PERCENT_ADJUST

    if (recipient.address.toLowerCase() === deployerAddress.toLowerCase()) {
      deployerShare = adjustedPercentage
    } else if (
      governanceAddress &&
      recipient.address.toLowerCase() === governanceAddress.toLowerCase()
    ) {
      governanceShare = adjustedPercentage
    } else {
      additionalRevenueRecipients.push({
        address: recipient.address as `0x${string}`,
        share: adjustedPercentage,
      })
    }
  }

  return {
    governanceShare,
    deployerShare,
    additionalRevenueRecipients,
    fixedPlatformFee: 50, // Fixed platform fee is always 50%
  }
}

// Convert seconds to minutes
const secondsToMinutes = (seconds: number) => Math.round(seconds / 60)

// Convert seconds to hours
const secondsToHours = (seconds: number) => Math.round(seconds / 3600)

const Updater = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const { reset } = useFormContext<GovernanceInputs>()

  // Handle the case when indexDTF loads after component mount
  useEffect(() => {
    if (!indexDTF) return

    // Reset form with current DTF values when they become available
    reset({
      ...dtfGovernanceDefaultValues,
      mandate: indexDTF.mandate || '',
      folioFee: indexDTF.annualizedTvlFee * 100, // Convert from decimal to percentage
      mintFee: indexDTF.mintingFee * 100, // Convert from decimal to percentage
      auctionLength: secondsToMinutes(indexDTF.auctionLength), // Convert from seconds to minutes
      auctionDelay: secondsToHours(indexDTF.auctionDelay), // Convert from seconds to hours
      brandManagers: indexDTF.brandManagers || [],
      auctionLaunchers: indexDTF.auctionLaunchers || [],
      // Calculate governance and deployer shares from fee recipients
      ...calculateFeeShares(
        indexDTF.feeRecipients,
        indexDTF.deployer,
        indexDTF.stToken?.id
      ),
    })
  }, [indexDTF]) // Only re-run when indexDTF changes

  return null
}

export default Updater
