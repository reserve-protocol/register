import { useAccount } from 'wagmi'
import {
  Zapper,
  ZapperProps,
  PROVIDER_ENABLED,
} from '@reserve-protocol/react-zapper'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { bsc } from 'viem/chains'

const bscProviders = PROVIDER_ENABLED[bsc.id]
if (bscProviders) {
  bscProviders.odos = false
}

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
