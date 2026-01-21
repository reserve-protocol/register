import TokenLogo from 'components/icons/TokenLogo'
import Arbitrum from 'components/icons/logos/Arbitrum'
import Base from 'components/icons/logos/Base'
import Ethereum from 'components/icons/logos/Ethereum'
import { ChainId } from 'utils/chains'
import BSC from '../icons/logos/BSC'

interface Props {
  symbol: string
  logo?: string
  width?: number
  chainId?: number | null
  className?: string
  sx?: Record<string, unknown>
}

const TokenItem = ({ symbol, logo, width = 24, chainId, className, sx }: Props) => (
  <div className="flex items-center w-full justify-between">
    <div className="flex items-center">
      <TokenLogo width={width} className="mr-1.5" symbol={symbol} src={logo} />
      <span className={className}>{symbol}</span>
    </div>
    <div>
      {chainId === ChainId.Mainnet && <Ethereum />}
      {chainId === ChainId.Base && <Base />}
      {chainId === ChainId.Arbitrum && <Arbitrum />}
      {chainId === ChainId.BSC && <BSC />}
    </div>
  </div>
)

export default TokenItem
