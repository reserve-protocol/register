import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import { AlertTriangle } from 'lucide-react'
import { rTokenCollateralDetailedAtom } from 'state/rtoken/atoms/rTokenBackingDistributionAtom'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

const StargateWarning = () => {
  const rToken = useRToken()
  const collaterals = useAtomValue(rTokenCollateralDetailedAtom)

  const hasStargateCollateral = collaterals?.some((c) =>
    c.symbol.toLowerCase().includes('wsg')
  )

  if (!hasStargateCollateral) return null

  return (
    <div className="px-4 md:px-6">
      <Alert variant="warning" className="rounded-xl">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Stargate Collateral Notice</AlertTitle>
        <AlertDescription>
          {rToken?.symbol} uses Stargate collateral and has pending STG rewards.
          STG will no longer be supported as Chainlink is discontinuing the STG
          oracle.
        </AlertDescription>
      </Alert>
    </div>
  )
}

export default StargateWarning
