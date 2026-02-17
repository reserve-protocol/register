import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { NumericalInput } from '@/components/ui/input'
import TokenLogo from '@/components/token-logo'
import { chainIdAtom } from '@/state/atoms'
import {
  DEFAULT_MAX_AUCTION_SIZE_USD,
  maxAuctionSizesAtom,
} from '@/state/max-auction-sizes'
import { Token } from '@/types'
import { formatCurrency } from '@/utils'
import { useAtom, useAtomValue } from 'jotai'
import { ChevronsUpDown, DollarSign } from 'lucide-react'
import { useState } from 'react'

interface MaxAuctionSizeEditorProps {
  tokens: Token[]
}

const TokenRow = ({ token }: { token: Token }) => {
  const chainId = useAtomValue(chainIdAtom)
  const [maxAuctionSizes, setMaxAuctionSizes] = useAtom(maxAuctionSizesAtom)

  const currentValue = maxAuctionSizes[token.address.toLowerCase()]
  const displayValue = currentValue !== undefined ? currentValue.toString() : ''

  const handleChange = (value: string) => {
    const address = token.address.toLowerCase()
    if (value === '') {
      // Remove the entry when empty (will use default)
      const { [address]: _, ...rest } = maxAuctionSizes
      setMaxAuctionSizes(rest)
    } else {
      setMaxAuctionSizes({
        ...maxAuctionSizes,
        [address]: Number(value),
      })
    }
  }

  return (
    <div className="flex items-center gap-3 py-2">
      <TokenLogo
        size="lg"
        symbol={token.symbol}
        address={token.address}
        chain={chainId}
      />
      <span className="font-medium text-primary min-w-16">{token.symbol}</span>
      <div className="flex-grow">
        <NumericalInput
          className="h-10 rounded-lg"
          startAdornment={<DollarSign size={14} />}
          placeholder={formatCurrency(DEFAULT_MAX_AUCTION_SIZE_USD, 0)}
          value={displayValue}
          onChange={handleChange}
        />
      </div>
    </div>
  )
}

const MaxAuctionSizeEditor = ({ tokens }: MaxAuctionSizeEditorProps) => {
  const [isOpen, setIsOpen] = useState(false)

  if (!tokens.length) return null

  return (
    <div className="flex flex-col justify-center gap-3 rounded-xl bg-foreground/5 p-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full">
          <div>
            <h4 className="font-semibold text-primary text-base text-left">
              Max Auction Size per Token
            </h4>
            <p className="text-sm text-muted-foreground text-left">
              Set the maximum auction size in USD for each token. Default:{' '}
              {formatCurrency(DEFAULT_MAX_AUCTION_SIZE_USD, 0)}
            </p>
          </div>
          <ChevronsUpDown className="h-4 w-4 text-primary flex-shrink-0 ml-2" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="flex flex-col gap-1 mt-4">
            {tokens.map((token) => (
              <TokenRow key={token.address} token={token} />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

export default MaxAuctionSizeEditor
