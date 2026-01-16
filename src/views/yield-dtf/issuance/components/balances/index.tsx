import { Trans } from '@lingui/macro'
import TokenBalance from 'components/token-balance'
import TrackAsset from 'components/track-asset'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import { rTokenBalanceAtom } from 'state/atoms'
import { Card } from '@/components/ui/card'
import Spinner from '@/components/ui/spinner'
import CollateralBalance from './CollateralBalance'

const CollateralBalances = () => {
  const rToken = useRToken()

  return (
    <div>
      <h3 className="font-semibold mb-3 p-4 pb-0">
        <Trans>Available collateral</Trans>
      </h3>
      <div className="overflow-auto max-h-[360px] p-4 pt-0">
        {!rToken?.collaterals && <Spinner size={18} />}
        {rToken?.collaterals.map((collateral) => (
          <CollateralBalance
            mb={2}
            token={collateral}
            key={collateral.address}
          />
        ))}
      </div>
    </div>
  )
}

const RTokenBalance = () => {
  const rToken = useRToken()
  const balance = useAtomValue(rTokenBalanceAtom)

  return (
    <div className="p-4">
      <h3 className="font-semibold mb-3">
        <Trans>RToken in Wallet</Trans>
      </h3>
      <div className="flex">
        <TokenBalance
          symbol={rToken?.symbol}
          balance={+balance.balance}
          mr={2}
        />
        {!!rToken && <TrackAsset token={rToken} />}
      </div>
    </div>
  )
}

/**
 * Display collateral tokens balances
 */
const Balances = () => {
  return (
    <Card className="p-0 border-2 border-secondary">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
        <CollateralBalances />
        <div className="border-t sm:border-t-0 sm:border-l border-border">
          <RTokenBalance />
        </div>
      </div>
    </Card>
  )
}

export default Balances
