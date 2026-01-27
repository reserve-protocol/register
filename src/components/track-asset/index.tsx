import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Bookmark } from 'lucide-react'
import { Token } from 'types'
import { useWalletClient } from 'wagmi'

const TrackAsset = ({ token }: { token: Token }) => {
  const { data: client } = useWalletClient()

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
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="mt-[5px] cursor-pointer h-fit w-auto p-0"
          onClick={handleWatch}
        >
          <Bookmark size={12} />
        </button>
      </TooltipTrigger>
      <TooltipContent>Track token in your wallet</TooltipContent>
    </Tooltip>
  )
}

export default TrackAsset
