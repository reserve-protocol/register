import TokenItem from 'components/token-item'
import { useZap } from '../context/ZapContext'

const ZapTokenSelected = () => {
  const { selectedToken } = useZap()

  return (
    <TokenItem
      sx={{
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
      symbol={selectedToken?.symbol ?? 'ETH'}
      width={16}
    />
  )
}

export default ZapTokenSelected
