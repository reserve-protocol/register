import { useWeb3React } from '@web3-react/core'
import { useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { walletAtom } from 'state/atoms'
import { getAccount } from '@wagmi/core'

const WalletUpdater = () => {
  const { address } = getAccount()
  const setConnected = useSetAtom(walletAtom)

  // TODO: Perfect place to program wallet popups
  useEffect(() => {
    setConnected(address ?? '')
  }, [address])

  return null
}

export default WalletUpdater
