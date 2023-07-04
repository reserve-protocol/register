import { useWeb3React } from '@web3-react/core'
import { useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { walletAtom } from 'state/atoms'

const WalletUpdater = () => {
  const { account } = useWeb3React()
  const setConnected = useSetAtom(walletAtom)

  // TODO: Perfect place to program wallet popups
  useEffect(() => {
    setConnected(account ?? '')
  }, [account])

  return null
}

export default WalletUpdater
