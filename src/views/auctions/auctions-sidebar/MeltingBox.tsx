import { t } from '@lingui/macro'
import FacadeAct from 'abis/FacadeAct'
import { ExecuteButton } from 'components/button/TransactionButton'
import MeltIcon from 'components/icons/MeltIcon'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { chainIdAtom, rTokenContractsAtom } from 'state/atoms'
import { formatCurrency } from 'utils'
import { FACADE_ACT_ADDRESS } from 'utils/addresses'
import { auctionsOverviewAtom } from '../atoms'
import RevenueBoxContainer from './RevenueBoxContainer'

const MeltingBox = () => {
  const revenueData = useAtomValue(auctionsOverviewAtom)
  const rToken = useRToken()
  const contracts = useAtomValue(rTokenContractsAtom)
  const chainId = useAtomValue(chainIdAtom)
  const call = useMemo(() => {
    if (contracts) {
      return {
        abi: FacadeAct,
        functionName: 'runRevenueAuctions',
        address: FACADE_ACT_ADDRESS[chainId],
        args: [
          contracts.rTokenTrader.address,
          [],
          [contracts.token.address],
          0,
        ],
      }
    }

    return undefined
  }, [contracts])

  return (
    <RevenueBoxContainer
      title={t`Melting`}
      icon={<MeltIcon />}
      loading={!revenueData}
      subtitle={t`${formatCurrency(revenueData?.pendingToMelt ?? 0)} of ${
        rToken?.symbol ?? 'rToken'
      }`}
      mb={3}
      muted={!revenueData?.pendingToMelt || revenueData?.pendingToMelt < 0.1}
      right={
        <ExecuteButton
          text={t`Trigger melt`}
          small
          ml="auto"
          successLabel="Success!"
          call={call}
        />
      }
    />
  )
}

export default MeltingBox
