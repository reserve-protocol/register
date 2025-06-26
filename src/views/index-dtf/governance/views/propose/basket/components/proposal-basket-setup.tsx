import TokenLogo from '@/components/token-logo'
import TokenSelectorDrawer, {
  TokenDrawerTrigger,
} from '@/components/token-selector-drawer'
import { Button } from '@/components/ui/button'
import { NumericalInput } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { chainIdAtom } from '@/state/chain/atoms/chainAtoms'
import { Token } from '@/types'
import { formatPercentage, shortenAddress } from '@/utils'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  PaintBucket,
  Settings,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Address, formatUnits } from 'viem'
import {
  derivedProposedSharesAtom,
  IndexAssetShares,
  isProposalConfirmedAtom,
  isProposedBasketValidAtom,
  isUnitBasketAtom,
  proposedIndexBasketAtom,
  proposedIndexBasketStateAtom,
  proposedSharesAtom,
  proposedUnitsAtom,
  stepAtom,
  advancedControlsAtom,
} from '../atoms'
import DecimalDisplay from '@/components/decimal-display'
import BasketCsvSetup from './basket-csv-setup'

const assetsAtom = atom((get) => {
  const proposedBasket = get(proposedIndexBasketAtom)

  if (!proposedBasket) return { isLoading: true, assets: [] }

  return { isLoading: false, assets: Object.values(proposedBasket) }
})

const NewSharesCell = ({ asset }: { asset: string }) => {
  const [newShares, setNewShares] = useAtom(proposedSharesAtom)

  return (
    <TableCell className="bg-primary/10 w-10">
      <NumericalInput
        placeholder="0%"
        className="w-24 text-center"
        value={newShares[asset]}
        onChange={(value) => setNewShares({ ...newShares, [asset]: value })}
      />
    </TableCell>
  )
}

const DeltaSharesCell = ({ asset }: { asset: string }) => {
  const currentShares = useAtomValue(proposedIndexBasketAtom)
  const newShares = useAtomValue(proposedSharesAtom)

  const deltaShares =
    Number(newShares[asset] ?? 0) -
    Number(currentShares?.[asset]?.currentShares ?? 0)

  return (
    <TableCell
      className={cn('text-center', {
        'text-green-500': deltaShares > 0,
        'text-red-500': deltaShares < 0,
        'text-gray-500': deltaShares === 0,
      })}
    >
      {deltaShares > 0 && '+'}
      {formatPercentage(deltaShares)}
    </TableCell>
  )
}

const AssetCellInfo = ({ asset }: { asset: IndexAssetShares }) => {
  const chainId = useAtomValue(chainIdAtom)
  const state = useAtomValue(proposedIndexBasketStateAtom)
  const [targetShares, setTargetShares] = useAtom(proposedSharesAtom)
  const isUnitBasket = useAtomValue(isUnitBasketAtom)

  const canFill =
    !isUnitBasket &&
    state.remainingAllocation !== 0 &&
    !state.isValid &&
    Number(targetShares[asset.token.address]) + state.remainingAllocation >= 0
  const negativeAllocation = state.remainingAllocation < 0

  const handleFill = () => {
    setTargetShares({
      ...targetShares,
      [asset.token.address]: (
        Number(targetShares[asset.token.address]) + state.remainingAllocation
      ).toFixed(2),
    })
  }

  return (
    <TableCell className="border-r">
      <div className="flex items-center gap-2 cursor-pointer group">
        <TokenLogo
          size="xl"
          symbol={asset.token.symbol}
          address={asset.token.address}
          chain={chainId}
        />
        <div className="mr-auto">
          <h4 className="font-bold mb-1">{asset.token.symbol}</h4>
          <Link
            to={getExplorerLink(
              asset.token.address,
              chainId,
              ExplorerDataType.TOKEN
            )}
            tabIndex={-1}
            target="_blank"
            className="text-sm text-legend hover:underline hover:text-primary"
          >
            {shortenAddress(asset.token.address)}{' '}
            <ArrowUpRight size={14} className="inline" />
          </Link>
        </div>

        {canFill && (
          <Button variant="outline" size="icon-rounded" onClick={handleFill}>
            <PaintBucket className={negativeAllocation ? 'scale-x-[-1]' : ''} />
          </Button>
        )}
      </div>
    </TableCell>
  )
}

const CurrentSharesCell = ({ asset }: { asset: IndexAssetShares }) => {
  const [targetShares, setTargetShares] = useAtom(proposedSharesAtom)

  const handleClick = () => {
    setTargetShares({
      ...targetShares,
      [asset.token.address]: asset.currentShares,
    })
  }

  return (
    <TableCell
      className="text-center cursor-pointer hover:text-primary"
      onClick={handleClick}
    >
      {formatPercentage(Number(asset.currentShares))}
    </TableCell>
  )
}

const Allocation = () => {
  const { remainingAllocation, isValid } = useAtomValue(
    proposedIndexBasketStateAtom
  )

  return (
    <div>
      <span className="text-legend">Remaining allocation:</span>{' '}
      <span
        className={cn(
          '',
          remainingAllocation !== 0 && !isValid && 'text-destructive'
        )}
      >
        {formatPercentage(remainingAllocation)}
      </span>
    </div>
  )
}

// TODO: Handle with address checksum vs lowercase format
const setNewBasketAtom = atom(null, (get, set, _tokens: Token[]) => {
  const proposedShareMap = get(proposedSharesAtom)
  const proposedUnitsMap = get(proposedUnitsAtom)
  const proposedIndexBasket = get(proposedIndexBasketAtom) || {}
  const newProposedIndexBasket: Record<string, IndexAssetShares> = {}
  const newProposedShares: Record<string, string> = {}
  const newProposedUnits: Record<string, string> = {}
  // Make sure addresses are lowercase
  const tokens = _tokens.map((token) => ({
    ...token,
    address: token.address.toLowerCase() as Address,
  }))

  // Create a map of tokens
  const tokenMap = tokens.reduce(
    (acc, token) => {
      acc[token.address] = token
      return acc
    },
    {} as Record<string, Token>
  )

  // Get unit string array of token addresses + proposedIndexBasket keys
  const tokenAddresses = new Set([
    ...Object.keys(proposedIndexBasket),
    ...Object.keys(tokenMap),
  ])

  for (const tokenAddress of tokenAddresses) {
    const token =
      tokenMap[tokenAddress] || proposedIndexBasket[tokenAddress].token
    const currentShares =
      proposedIndexBasket[tokenAddress]?.currentShares ?? '0'
    const currentUnits = proposedIndexBasket[tokenAddress]?.currentUnits ?? '0'

    // Keep all assets on the basket, removed assets just adjust proposed shares
    newProposedIndexBasket[tokenAddress] = {
      token,
      currentShares,
      currentUnits,
    }

    // If asset was removed, set proposed shares to 0
    newProposedShares[tokenAddress] = tokenMap[tokenAddress]
      ? (proposedShareMap[tokenAddress] ?? '0')
      : '0'
    newProposedUnits[tokenAddress] = tokenMap[tokenAddress]
      ? (proposedUnitsMap[tokenAddress] ?? '0')
      : '0'
  }

  set(proposedIndexBasketAtom, newProposedIndexBasket)
  set(proposedSharesAtom, newProposedShares)
  set(proposedUnitsAtom, newProposedUnits)
})

const currentProposedBasketTokensAtom = atom((get) => {
  const proposedIndexBasket = get(proposedIndexBasketAtom)
  return Object.values(proposedIndexBasket || {}).map((asset) => asset.token)
})

const TokenSelector = () => {
  const setNewBasket = useSetAtom(setNewBasketAtom)
  const currentProposedBasketTokens = useAtomValue(
    currentProposedBasketTokensAtom
  )

  return (
    <TokenSelectorDrawer
      selectedTokens={currentProposedBasketTokens}
      onAdd={setNewBasket}
    >
      <TokenDrawerTrigger />
    </TokenSelectorDrawer>
  )
}

const EvenDistribution = () => {
  const [proposedShares, setProposedShares] = useAtom(proposedSharesAtom)

  const handleEvenDistribution = () => {
    const numTokens = Object.keys(proposedShares).length
    const evenShare = (100 / numTokens).toFixed(2)

    // Handle rounding error to ensure total is exactly 100
    const shares = Object.keys(proposedShares).map((key, i) => {
      if (i === numTokens - 1) {
        // Last token gets remaining balance to equal 100
        const sumOthers = (numTokens - 1) * Number(evenShare)
        return [key, (100 - sumOthers).toFixed(2)]
      }
      return [key, evenShare]
    })

    setProposedShares(Object.fromEntries(shares))
  }

  return (
    <Button variant="outline" size="sm" onClick={handleEvenDistribution}>
      Even distribution
    </Button>
  )
}

const ProposalBasketByShares = ({ assets }: { assets: IndexAssetShares[] }) => (
  <TableBody>
    {assets.map((asset) => (
      <TableRow key={asset.token.address}>
        <AssetCellInfo asset={asset} />
        <CurrentSharesCell asset={asset} />
        <NewSharesCell asset={asset.token.address} />
        <DeltaSharesCell asset={asset.token.address} />
      </TableRow>
    ))}
    <TableRow className="hover:bg-card">
      <TableCell colSpan={4}>
        <div className="flex justify-between items-center">
          <TokenSelector />
          <div className="flex flex-col gap-2">
            <EvenDistribution />
            <Allocation />
          </div>
        </div>
      </TableCell>
    </TableRow>
  </TableBody>
)

const CurrentUnitsCell = ({ asset }: { asset: IndexAssetShares }) => {
  return (
    <TableCell className="text-right">
      <DecimalDisplay value={asset.currentUnits} />
    </TableCell>
  )
}

const NewUnitsCell = ({ asset }: { asset: string }) => {
  const [newUnits, setNewUnits] = useAtom(proposedUnitsAtom)

  return (
    <TableCell className="bg-primary/10 w-10">
      <NumericalInput
        placeholder={`0`}
        className="w-32 text-center"
        value={newUnits[asset]}
        onChange={(value) => setNewUnits({ ...newUnits, [asset]: value })}
      />
    </TableCell>
  )
}

const DeltaUnitsCell = ({ asset }: { asset: string }) => {
  const derivedProposedShares = useAtomValue(derivedProposedSharesAtom)
  const currentShares = useAtomValue(proposedIndexBasketAtom)

  const currentSharesDisplay = formatPercentage(
    Number(currentShares?.[asset]?.currentShares ?? 0)
  )
  let newShareDisplay = currentSharesDisplay

  if (derivedProposedShares?.[asset] !== undefined) {
    newShareDisplay = formatPercentage(
      Number(formatUnits(derivedProposedShares?.[asset], 16))
    )
  }

  return (
    <TableCell className="text-center">
      <div className="flex items-center justify-center gap-1">
        <span className="text-legend">{currentSharesDisplay}</span>
        <ArrowRight size={14} />
        <span>{newShareDisplay}</span>
      </div>
    </TableCell>
  )
}

const ProposalBasketByUnits = ({ assets }: { assets: IndexAssetShares[] }) => (
  <TableBody>
    {assets.map((asset) => (
      <TableRow key={asset.token.address}>
        <AssetCellInfo asset={asset} />
        <CurrentUnitsCell asset={asset} />
        <NewUnitsCell asset={asset.token.address} />
        <DeltaUnitsCell asset={asset.token.address} />
      </TableRow>
    ))}
    <TableRow className="hover:bg-card">
      <TableCell colSpan={4}>
        <div className="flex justify-center items-center">
          <TokenSelector />
        </div>
      </TableCell>
    </TableRow>
  </TableBody>
)

const ProposalBasketTable = () => {
  const { assets, isLoading } = useAtomValue(assetsAtom)
  const isUnitBasket = useAtomValue(isUnitBasketAtom)

  if (isLoading) {
    return <Skeleton className="h-[200px]" />
  }

  return (
    <div className="border rounded-xl overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="border-r min-w-48">Token</TableHead>
            <TableHead
              className={cn(
                isUnitBasket ? 'text-right w-36' : 'w-16 text-center'
              )}
            >
              {isUnitBasket ? 'Old Tokens / DTF' : 'Current'}
            </TableHead>
            <TableHead className="bg-primary/10 text-primary text-center font-bold">
              {isUnitBasket ? 'New Tokens / DTF' : 'New'}
            </TableHead>
            <TableHead
              className={cn(
                isUnitBasket ? 'text-right w-24' : 'w-16 text-center'
              )}
            >
              {isUnitBasket ? '% of Basket' : 'Delta'}
            </TableHead>
          </TableRow>
        </TableHeader>
        {isUnitBasket ? (
          <ProposalBasketByUnits assets={assets} />
        ) : (
          <ProposalBasketByShares assets={assets} />
        )}
      </Table>
    </div>
  )
}

const NextButton = () => {
  const isValid = useAtomValue(isProposedBasketValidAtom)
  const setStep = useSetAtom(stepAtom)
  const setIsConfirmed = useSetAtom(isProposalConfirmedAtom)
  const [AdvancedControls, setAdvancedControls] = useAtom(advancedControlsAtom)

  const handleNext = () => {
    setStep('confirmation')

    if (isValid) {
      setIsConfirmed(true)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        onClick={() => setAdvancedControls((toggle) => !toggle)}
        className="flex gap-[6px] px-4 py-[20px]"
        size="lg"
      >
        <Settings size={16} />
        {AdvancedControls ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </Button>
      <Button
        disabled={!isValid}
        onClick={handleNext}
        className="w-full my-2"
        size="lg"
      >
        Confirm & Prepare Proposal
      </Button>
    </div>
  )
}

const ProposalBasketSetup = () => (
  <>
    <p className="text-sm sm:text-base mx-4 sm:mx-6 mb-6">
      Enter the updated weights for the tokens in the basket. Remember, the
      weights represent the proportion of each token relative to the total USD
      value of basket at the time of the proposal. We will calculate the
      required auctions needed to adopt the new basket if the proposal passes
      governance.
    </p>
    <div className="flex flex-col gap-2 mx-2">
      <BasketCsvSetup />
      <ProposalBasketTable />
      <NextButton />
    </div>
  </>
)

export default ProposalBasketSetup
