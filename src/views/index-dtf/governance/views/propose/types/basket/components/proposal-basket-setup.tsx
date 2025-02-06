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
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { ArrowRightCircle } from 'lucide-react'
import { Address } from 'viem'
import {
  IndexAssetShares,
  isProposedBasketValidAtom,
  priceMapAtom,
  proposedIndexBasketAtom,
  proposedIndexBasketStateAtom,
  proposedSharesAtom,
  stepAtom,
} from '../atoms'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { Link } from 'react-router-dom'
import { useEffect } from 'react'

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
  const canFill =
    state.remainingAllocation !== 0 &&
    !state.isValid &&
    Number(targetShares[asset.token.address]) + state.remainingAllocation >= 0

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
        <Link
          target="_blank"
          to={getExplorerLink(
            asset.token.address,
            chainId,
            ExplorerDataType.TOKEN
          )}
          className="mr-auto"
        >
          <h4 className="font-bold mb-1">{asset.token.symbol}</h4>
          <p className="text-sm text-legend">
            {shortenAddress(asset.token.address)}
          </p>
        </Link>

        {canFill && (
          <Button variant="ghost" size="icon-rounded" onClick={handleFill}>
            <ArrowRightCircle />
          </Button>
        )}
      </div>
    </TableCell>
  )
}

const AssetRow = ({ asset }: { asset: IndexAssetShares }) => (
  <TableRow>
    <AssetCellInfo asset={asset} />
    <TableCell className="text-center">
      {formatPercentage(Number(asset.currentShares))}
    </TableCell>
    <NewSharesCell asset={asset.token.address} />
    <DeltaSharesCell asset={asset.token.address} />
  </TableRow>
)

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
        {formatPercentage(Math.abs(remainingAllocation))}
      </span>
    </div>
  )
}

// TODO: Handle with address checksum vs lowercase format
const setNewBasketAtom = atom(null, (get, set, _tokens: Token[]) => {
  const proposedShareMap = get(proposedSharesAtom)
  const proposedIndexBasket = get(proposedIndexBasketAtom) || {}
  const newProposedIndexBasket: Record<string, IndexAssetShares> = {}
  const newProposedShares: Record<string, string> = {}
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

    // Keep all assets on the basket, removed assets just adjust proposed shares
    newProposedIndexBasket[tokenAddress] = {
      token,
      currentShares,
    }

    // If asset was removed, set proposed shares to 0
    newProposedShares[tokenAddress] = tokenMap[tokenAddress]
      ? (proposedShareMap[tokenAddress] ?? '0')
      : '0'
  }

  set(proposedIndexBasketAtom, newProposedIndexBasket)
  set(proposedSharesAtom, newProposedShares)
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
      <TokenDrawerTrigger className="mr-auto" />
    </TokenSelectorDrawer>
  )
}

const ProposalBasketTable = () => {
  const { assets, isLoading } = useAtomValue(assetsAtom)

  if (isLoading) {
    return <Skeleton className="h-[200px]" />
  }

  return (
    <div className="border rounded-xl overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="border-r min-w-48">Token</TableHead>
            <TableHead className="w-24 text-center">Current</TableHead>
            <TableHead className="bg-primary/10 text-primary text-center font-bold">
              New
            </TableHead>
            <TableHead className="w-24 text-center">Delta</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.map((asset) => (
            <AssetRow key={asset.token.address} asset={asset} />
          ))}
          <TableRow className="hover:bg-card">
            <TableCell colSpan={4}>
              <div className="flex items-center">
                <TokenSelector />
                <Allocation />
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}

const NextButton = () => {
  const isValid = useAtomValue(isProposedBasketValidAtom)
  const prices = useAtomValue(priceMapAtom)
  const proposedBasket = useAtomValue(proposedIndexBasketAtom)

  // TODO: Debugging
  const basketWithPrices = Object.values(proposedBasket || {}).map((asset) => ({
    ...asset,
    price: prices[asset.token.address.toLowerCase()],
  }))

  console.log('basketWithPrices', basketWithPrices)

  const setStep = useSetAtom(stepAtom)
  const handleNext = () => {
    setStep('prices')
  }

  return (
    <Button
      disabled={!isValid}
      onClick={handleNext}
      className="w-full my-2"
      size="lg"
    >
      Next | Set price range(s)
    </Button>
  )
}

const ProposalBasketSetup = () => {
  return (
    <>
      <p className="text-sm sm:text-base mx-4 sm:mx-6 mb-6">
        Enter the updated weights for the tokens in the basket. Remember, the
        weights represent the proportion of each token relative to the total USD
        value of basket at the time of the proposal. We will calculate the
        required auctions needed to adopt the new basket if the proposal passes
        governance.
      </p>
      <div className="flex flex-col gap-2 mx-2">
        <ProposalBasketTable />
        <NextButton />
      </div>
    </>
  )
}

export default ProposalBasketSetup
