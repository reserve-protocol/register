import { useWeb3React } from '@web3-react/core'
import { Connector } from '@web3-react/types'
import { metaMask, network } from 'components/wallets/connectors'
import { useAtom } from 'jotai'
import { useEffect } from 'react'
import { walletAtom } from 'state/atoms'

const connect = async (connector: Connector) => {
  try {
    if (connector.connectEagerly) {
      await connector.connectEagerly()
    } else {
      await connector.activate()
    }
  } catch (error) {
    console.debug(`web3-react eager connection error: ${error}`)
  }
}

const WalletUpdater = () => {
  const { account, chainId } = useWeb3React()
  const [connectedAccount, setConnected] = useAtom(walletAtom)

  // TODO: Perfect place to program wallet popups
  useEffect(() => {
    if (connectedAccount !== account) {
      setConnected(account ?? '')
    }
  }, [account])

  useEffect(() => {
    connect(network)
    connect(metaMask)
  }, [])

  return null
}

export default WalletUpdater
