import TokenLogo from '@/components/token-logo'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { chainIdAtom } from '@/state/atoms'
import { useAtomValue } from 'jotai'
import {
  dtfTradesByProposalAtom,
  expectedBasketAtom,
  proposedBasketAtom,
  selectedProposalAtom,
} from '../atoms'
import { indexDTFBasketAtom } from '@/state/dtf/atoms'

const TableContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <Table className="[&_td]:text-center [&_th]:text-center  [&_th:first-child]:rounded-tl-3xl [&_th:last-child]:rounded-tr-3xl [&_tr:last-child_td:first-child]:rounded-bl-3xl [&_tr:last-child_td:last-child]:rounded-br-3xl">
      <TableHeader>
        <TableRow>
          <TableHead className="border-r"></TableHead>
          <TableHead>Current</TableHead>
          <TableHead className="bg-primary/10">Expected</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>{children}</TableBody>
    </Table>
  )
}

const TableSkeleton = () => {
  return (
    <TableContainer>
      {Array.from({ length: 4 }).map((_, index) => (
        <TableRow key={index}>
          <TableCell className="border-r">
            <div className="h-6 w-6 rounded-full bg-foreground" />
          </TableCell>
          <TableCell>
            <Skeleton className="w-full h-6" />
          </TableCell>
          <TableCell className="bg-primary/10">
            <Skeleton className="w-full h-6 bg-primary" />
          </TableCell>
        </TableRow>
      ))}
    </TableContainer>
  )
}

const ProposalBasketTable = () => {
  const chainId = useAtomValue(chainIdAtom)
  const selectedProposal = useAtomValue(selectedProposalAtom)
  const proposedBasket = useAtomValue(proposedBasketAtom)
  const expectedBasket = useAtomValue(expectedBasketAtom)
  const currentBasket = useAtomValue(indexDTFBasketAtom)

  if (!currentBasket) {
    return <TableSkeleton />
  }

  if (!selectedProposal) {
    return (
      <TableContainer>
        {currentBasket.map((token) => {
          return (
            <TableRow key={token.address}>
              <TableCell className="border-r">
                <TokenLogo
                  symbol={token.symbol}
                  src={token.logoURI}
                  address={token.address}
                  chain={chainId}
                  size="xl"
                />
              </TableCell>
              <TableCell>-</TableCell>
              <TableCell className="bg-primary/10 text-primary font-semibold">
                -
              </TableCell>
            </TableRow>
          )
        })}
      </TableContainer>
    )
  }

  if (!proposedBasket || !expectedBasket) {
    return <TableSkeleton />
  }

  const uniqueTokenList = [
    ...new Set([
      ...Object.keys(proposedBasket.basket),
      ...Object.keys(expectedBasket.basket),
    ]),
  ]

  return (
    <Table className="[&_td]:text-center [&_th]:text-center  [&_th:first-child]:rounded-tl-3xl [&_th:last-child]:rounded-tr-3xl [&_tr:last-child_td:first-child]:rounded-bl-3xl [&_tr:last-child_td:last-child]:rounded-br-3xl">
      <TableHeader>
        <TableRow>
          <TableHead className="border-r"></TableHead>
          <TableHead>Proposed</TableHead>
          <TableHead className="bg-primary/10 text-primary font-semibold">
            Expected
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {uniqueTokenList.map((token) => {
          const tokenData = (
            proposedBasket.basket[token] || expectedBasket.basket[token]
          ).token

          return (
            <TableRow key={tokenData.address}>
              <TableCell className="border-r">
                <TokenLogo
                  symbol={tokenData.symbol}
                  src={tokenData.logoURI}
                  address={tokenData.address}
                  chain={chainId}
                  size="xl"
                />
              </TableCell>
              <TableCell>
                {proposedBasket.basket[token].targetShares || '0'}%
              </TableCell>
              <TableCell className="bg-primary/10 text-primary font-semibold">
                {expectedBasket.basket[token].targetShares || '0'}%
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

const AuctionProposedBasket = () => {
  return (
    <>
      <div className="p-1 bg-secondary rounded-3xl h-fit">
        <div className="rounded-3xl bg-background">
          <div className="p-4">
            <span className="font-bold text-primary">Simulated Basket</span>
          </div>
          <div className="bg-card p-1 rounded-3xl">
            <ProposalBasketTable />
          </div>
        </div>
      </div>
    </>
  )
}

export default AuctionProposedBasket
