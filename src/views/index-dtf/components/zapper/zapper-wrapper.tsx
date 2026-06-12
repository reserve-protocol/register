import { useConnectModal } from '@rainbow-me/rainbowkit'
import {
  Zapper,
  ZapperProps,
  PROVIDER_ENABLED,
} from '@reserve-protocol/react-zapper'
import { bsc } from 'viem/chains'
import { useAccount } from 'wagmi'
import LargeMintPrompt from './large-mint-prompt'

const bscProviders = PROVIDER_ENABLED[bsc.id]
if (bscProviders) {
  bscProviders.odos = false
}

type ZapperWrapperProps = ZapperProps & {
  // Hide the large-order "Automated Mint" suggestion (shown by default).
  hideLargeMintPrompt?: boolean
}

const ZapperWithConnect = (props: ZapperProps) => {
  const { openConnectModal } = useConnectModal()
  return <Zapper {...props} connectWallet={openConnectModal} />
}

const ZapperWrapper = ({
  hideLargeMintPrompt,
  ...props
}: ZapperWrapperProps) => {
  const { isConnected } = useAccount()

  // The inline prompt is positioned `absolute` and anchors to the consumer's
  // nearest positioned ancestor (the issuance page wraps the zapper card in a
  // `relative` div whose right edge is the card's outer edge), so we don't add
  // our own relative wrapper here — that would anchor it inside the card padding
  // and overlap the card.
  return (
    <>
      {!isConnected ? <ZapperWithConnect {...props} /> : <Zapper {...props} />}
      {!hideLargeMintPrompt && (
        <LargeMintPrompt
          mode={props.mode ?? 'modal'}
          dtfAddress={props.dtfAddress}
          chain={props.chain}
        />
      )}
    </>
  )
}

export default ZapperWrapper
