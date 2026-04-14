import { cn } from '@/lib/utils'
import ChainLogo from './ChainLogo'

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  chains: number[]
}

// Shows ethereum/base stacked logos to indicate multichain
const StackedChainLogo = ({ chains, className, style, ...props }: Props) => (
  <div
    className={cn('relative h-5 w-6 pt-0.5', className)}
    style={{ marginLeft: `${(chains.length - 1) * 10}px`, ...style }}
    {...props}
  >
    {[...chains].reverse().map((chain, index) => (
      <ChainLogo
        key={chain}
        chain={chain}
        style={{ position: 'absolute', left: -(index * 10) }}
      />
    ))}
  </div>
)

export default StackedChainLogo
