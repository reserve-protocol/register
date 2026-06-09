import { useAccount } from 'wagmi'
import {
  Zapper,
  ZapperProps,
  PROVIDER_ENABLED,
} from '@reserve-protocol/react-zapper'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { bsc } from 'viem/chains'
import { wagmiConfig } from '@/state/chain'

const bscProviders = PROVIDER_ENABLED[bsc.id]
if (bscProviders) {
  bscProviders.odos = false
}

type ZapperWrapperProps = Omit<ZapperProps, 'wagmiConfig'> & {
  wagmiConfig?: ZapperProps['wagmiConfig']
}

const ZapperWithConnect = (props: ZapperProps) => {
  const { openConnectModal } = useConnectModal()
  return <Zapper {...props} connectWallet={openConnectModal} />
}

const ZapperWrapper = ({
  wagmiConfig: config,
  ...props
}: ZapperWrapperProps) => {
  const { isConnected } = useAccount()
  const zapperProps = { ...props, wagmiConfig: config ?? wagmiConfig }

  if (!isConnected) {
    return <ZapperWithConnect {...zapperProps} />
  }

  return <Zapper {...zapperProps} />
}

export default ZapperWrapper
