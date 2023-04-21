import { useWeb3React } from '@web3-react/core'
import { MouseoverTooltip } from 'components/tooltip'
import { Bookmark } from 'react-feather'
import { IconButton } from 'theme-ui'
import { Token } from 'types'

const TrackAsset = ({ token }: { token: Token }) => {
  const { connector } = useWeb3React()

  const handleWatch = async () => {
    try {
      if (connector?.watchAsset) {
        await connector.watchAsset({
          address: token.address,
          symbol: token.symbol,
          decimals: token.decimals,
          image: '',
        })
      }
    } catch (e) {
      console.log('Error watching asset')
    }
  }

  return (
    <IconButton
      m={0}
      p={0}
      mt={'5px'}
      sx={{ cursor: 'pointer', height: 'fit-content', width: 'auto' }}
      onClick={handleWatch}
    >
      <MouseoverTooltip text={'Track token in your wallet'}>
        <Bookmark size={12} />
      </MouseoverTooltip>
    </IconButton>
  )
}

export default TrackAsset
