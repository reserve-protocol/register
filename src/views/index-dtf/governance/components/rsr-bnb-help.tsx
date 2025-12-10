import StackTokenLogo from '@/components/token-logo/stack-token-logo'
import { Button } from '@/components/ui/button'
import { Link } from '@/components/ui/link'
import { cn } from '@/lib/utils'
import { chainIdAtom } from '@/state/atoms'
import { ChainId } from '@/utils/chains'
import { useAtomValue } from 'jotai'
import { ArrowUpRightIcon } from 'lucide-react'

const RSRBNBHelp = ({ className }: { className?: string }) => {
  const chainId = useAtomValue(chainIdAtom)

  if (chainId !== ChainId.BSC) return null

  return (
    <Link
      className={cn(
        'flex flex-col justify-start items-start gap-2 w-full',
        className
      )}
      target="_blank"
      href="https://x.com/reserveprotocol/status/1991311026974036379?s=46&t=PSRhUIOkR4MrrAAJE14IIw"
    >
      <StackTokenLogo
        outsource={true}
        tokens={[
          {
            symbol: 'RSR',
            address: '0x8762db106b2c2a0bccb3a80d1ed41273552616e8',
            chain: ChainId.Mainnet,
          },
          {
            symbol: 'wbnb',
            address: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
            chain: ChainId.BSC,
          },
        ]}
      />
      <div className="flex items-center gap-2 text-sm w-full">
        <div className="flex flex-col gap-1 mr-auto">
          <h2 className="font-semibold text-sm">Need to bridge your RSR?</h2>
          <p className="text-xs text-legend">
            CMC20 is a BNB DTF and you need to bridge your RSR using Wormhole to
            participate in governance.
          </p>
        </div>
        <Button variant="muted" size="icon-rounded">
          <ArrowUpRightIcon size={16} />
        </Button>
      </div>
    </Link>
  )
}

export default RSRBNBHelp
