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
        <AlertDescription>
          {rToken?.symbol} uses Stargate collateral and has pending STG rewards.
          As of January 5, 2026 the STG asset will no longer be functional, as
          Chainlink is deprecating the STG-USD oracle. The Stargate collateral
          will still function, but STG rewards will no longer be processed,
          causing a drop in real {rToken?.symbol} yield.
        </AlertDescription>
      </Alert>
    </div>
  )
}

export default StargateWarning
