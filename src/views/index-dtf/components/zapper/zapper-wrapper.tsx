import { useAccount } from 'wagmi'
import { Zapper, ZapperProps } from '@reserve-protocol/react-zapper'
import { useConnectModal } from '@rainbow-me/rainbowkit'

const ZapperWithConnect = (props: ZapperProps) => {
  const { openConnectModal } = useConnectModal()
  return <Zapper {...props} connectWallet={openConnectModal} />
}

const ZapperWrapper = (props: ZapperProps) => {
  const { isConnected } = useAccount()

  if (!isConnected) {
    return <ZapperWithConnect {...props} />
  }

  return <Zapper {...props} />
}

export default ZapperWrapper
