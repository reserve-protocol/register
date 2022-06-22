import { useWeb3React } from '@web3-react/core'
import { useAtom } from 'jotai'
import { useEffect } from 'react'
import { walletAtom } from 'state/atoms'

const WalletUpdater = () => {
  const { account } = useWeb3React()
  const [connectedAccount, setConnected] = useAtom(walletAtom)

  // TODO: Perfect place to program wallet popups
  useEffect(() => {
    if (connectedAccount !== account) {
      setConnected(account ?? '')
    }
  }, [account])

  return null
}

export default WalletUpdater
