import CopyValue from '@/components/ui/copy-value'
import GoTo from '@/components/ui/go-to'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import ChainLogo from 'components/icons/ChainLogo'
import StackedChainLogo from 'components/icons/StackedChainLogo'
import { useAtomValue } from 'jotai'
import { ChevronDown } from 'lucide-react'
import { useMemo, useState } from 'react'
import { chainIdAtom, selectedRTokenAtom } from 'state/atoms'
import { rTokenMetaAtom } from 'state/rtoken/atoms/rTokenAtom'
import { shortenAddress } from 'utils'
import { AvailableChain } from 'utils/chains'
import { BRIDGED_RTOKENS } from 'utils/constants'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { Address } from 'viem'

const BridgeTokenList = () => {
  const current = useAtomValue(selectedRTokenAtom)
  const chainId = useAtomValue(chainIdAtom)

  const tokenAddresses = useMemo(() => {
    const bridged = BRIDGED_RTOKENS[chainId]?.[current ?? '']

    if (!bridged) {
      return []
    }

    return [{ address: current as Address, chain: chainId }, ...bridged]
  }, [current, chainId])

  return (
    <div className="p-3 bg-background">
      {tokenAddresses.map((token, i) => (
        <div
          className={cn('flex items-center', i > 0 && 'mt-2')}
          key={token.address}
        >
          <ChainLogo chain={token.chain} />
          <span className="mx-2">{shortenAddress(token.address)}</span>
          <CopyValue mr={1} ml="auto" value={token.address} />
          <GoTo
            className="relative top-0.5"
            href={getExplorerLink(
              token.address,
              token.chain,
              ExplorerDataType.TOKEN
            )}
          />
        </div>
      ))}
    </div>
  )
}

const TokenAddresses = () => {
  const [isVisible, setVisible] = useState(false)
  const rToken = useAtomValue(rTokenMetaAtom)
  const chainId = useAtomValue(chainIdAtom)
  const availableChains = useMemo(() => {
    const chains = [chainId]
    const bridged = BRIDGED_RTOKENS[chainId]?.[rToken?.address ?? '']

    if (bridged) {
      for (const token of bridged) {
        chains.push(token.chain as AvailableChain)
      }
    }

    return chains
  }, [rToken?.address, chainId])
  const isBridged = availableChains.length > 1

  return (
    <Popover open={isVisible} onOpenChange={setVisible}>
      <PopoverTrigger asChild>
        <div
          className={cn(
            'flex items-center ml-1 sm:ml-0 mb-2 sm:mb-0 grow-0 select-none',
            isBridged ? 'cursor-pointer' : 'cursor-default'
          )}
          onClick={() => isBridged && setVisible(!isVisible)}
        >
          <StackedChainLogo chains={availableChains} />
          <span className="mr-2 text-legend">
            {!!rToken && shortenAddress(rToken.address)}
          </span>
          {isBridged && <ChevronDown size={16} />}
          {!isBridged && rToken && (
            <>
              <CopyValue mr={1} ml="auto" value={rToken.address} />
              <GoTo
                className="relative top-0.5"
                href={getExplorerLink(
                  rToken.address,
                  chainId,
                  ExplorerDataType.TOKEN
                )}
              />
            </>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <BridgeTokenList />
      </PopoverContent>
    </Popover>
  )
}
export default TokenAddresses
