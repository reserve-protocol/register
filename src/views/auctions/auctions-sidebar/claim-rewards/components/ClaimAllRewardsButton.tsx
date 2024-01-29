import { t } from '@lingui/macro'
import FacadeAct from 'abis/FacadeAct'
import TransactionButton from 'components/button/TransactionButton'
import useContractWrite from 'hooks/useContractWrite'
import useWatchTransaction from 'hooks/useWatchTransaction'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { chainIdAtom, rTokenAtom } from 'state/atoms'
import { FACADE_ACT_ADDRESS } from 'utils/addresses'
import { Address } from 'viem'
import { auctionSessionAtom } from '../../../atoms'

const claimAllRewardsTxAtom = atom((get) => {
  const chainId = get(chainIdAtom)
  const rToken = get(rTokenAtom)

  if (!rToken) {
    return undefined
  }

  return {
    abi: FacadeAct,
    functionName: 'claimRewards' as 'claimRewards',
    address: FACADE_ACT_ADDRESS[chainId],
    args: [rToken.address] as [Address],
  }
})

const ClaimAllRewardsButton = () => {
  const call = useAtomValue(claimAllRewardsTxAtom)
  const { isReady, write, hash, gas, isLoading } = useContractWrite(call)
  const { status } = useWatchTransaction({ hash, label: 'Claim rewards' })
  const setSession = useSetAtom(auctionSessionAtom)

  useEffect(() => {
    if (status === 'success') {
      setSession(Math.random())
    }
  }, [status])

  return (
    <TransactionButton
      text={t`Claim rewards across all traders`}
      fullWidth
      disabled={!isReady}
      gas={gas}
      loading={isLoading || status === 'loading'}
      onClick={write}
    />
  )
}

export default ClaimAllRewardsButton
