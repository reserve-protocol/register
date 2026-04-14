import { devModeAtom } from '@/state/atoms'
import { cn } from '@/lib/utils'
import ChainLogo from 'components/icons/ChainLogo'
import StackedChainLogo from 'components/icons/StackedChainLogo'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import {
  CHAIN_TO_NETWORK,
  NETWORKS,
  capitalize,
  supportedChainList,
} from 'utils/constants'
import MultiselectDropdrown from 'views/explorer/components/MultiselectDropdown'

type ChainFilterProps = {
  chains: string[]
  onChange: (selected: string[]) => void
  height?: number
  rounded?: boolean
  className?: string
}

const ChainFilter = ({
  chains,
  onChange,
  height,
  rounded,
  className,
}: ChainFilterProps) => {
  const isDevMode = useAtomValue(devModeAtom)
  const networks = Object.keys(NETWORKS).filter((n) => isDevMode || n !== 'bsc')

  const options = useMemo(
    () =>
      networks.map((chain) => ({
        label: capitalize(chain),
        value: NETWORKS[chain].toString(),
        icon: <ChainLogo chain={NETWORKS[chain]} />,
      })),
    [networks]
  )

  const chainsLogos = useMemo(
    () =>
      options
        .filter(({ value }) => chains.includes(value))
        .map(({ value }) => Number(value)),
    [options, chains]
  )

  return (
    <div className="min-w-[162px]">
      <MultiselectDropdrown
        options={options}
        selected={chains}
        onChange={onChange}
        className={cn(
          'border border-border px-5 py-1.5',
          rounded ? 'rounded-2xl' : 'rounded-lg',
          className
        )}
      >
        {Boolean(chainsLogos.length) && (
          <StackedChainLogo chains={chainsLogos} />
        )}
        {chains.length === 0 && <span className="text-legend">Select a chain</span>}
        {chains.length == 1 && (
          <span className="text-legend">
            {capitalize(CHAIN_TO_NETWORK[Number(chains[0])])}
          </span>
        )}
        {chains.length > 1 && chains.length !== supportedChainList.length && (
          <span className="text-legend">{chains.length} chains</span>
        )}
        {chains.length === supportedChainList.length && (
          <span className="text-legend">All Chains</span>
        )}
      </MultiselectDropdrown>
    </div>
  )
}

export default ChainFilter
