import { MouseoverTooltip } from 'components/tooltip'
import { useAtomValue } from 'jotai'
import { Bookmark } from 'react-feather'
import { walletClientAtom } from 'state/atoms'
import { IconButton } from 'theme-ui'
import { Token } from 'types'

const TrackAsset = ({ token }: { token: Token }) => {
  const client = useAtomValue(walletClientAtom)

  const handleWatch = async () => {
    try {
      if (client) {
        await client.watchAsset({
          type: 'ERC20',
          options: {
            address: token.address,
            symbol: token.symbol,
            decimals: token.decimals,
          },
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
