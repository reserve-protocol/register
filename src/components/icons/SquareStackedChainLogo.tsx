import { cn } from '@/lib/utils'
import ChainLogo from './ChainLogo'

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  chains: number[]
}

const SquareStackedChainLogo = ({ chains, className, ...props }: Props) => (
  <div
    className={cn(
      'flex items-center -space-x-2.5 [&_svg]:!h-[18px] [&_svg]:!w-[18px]',
      className
    )}
    {...props}
  >
    {chains.map((chain, index) => (
      <ChainLogo
        key={chain}
        chain={chain}
        className="relative h-[18px] w-[18px] rounded-md border-2 border-card bg-card"
        style={{ zIndex: chains.length - index }}
      />
    ))}
  </div>
)

export default SquareStackedChainLogo
