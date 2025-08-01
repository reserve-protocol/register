import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatPercentage } from '@/utils'
import { formatUnits, parseUnits } from 'viem'
import { getCurrentBasket } from '@/lib/index-rebalance/utils'
import { useMemo } from 'react'
import { IndexAssetShares } from '../atoms'
import TokenLogo from '@/components/token-logo'
import useRebalanceParams from '../hooks/use-rebalance-params'

interface FinalizeWeightsTableProps {
  assets: IndexAssetShares[]
  proposedUnits: Record<string, string>
  onUnitsChange: (address: string, value: string) => void
}

const FinalizeWeightsTable = ({ 
  assets, 
  proposedUnits, 
  onUnitsChange 
}: FinalizeWeightsTableProps) => {
  const rebalanceParams = useRebalanceParams()
  
  // Calculate derived shares from proposed units
  const derivedShares = useMemo(() => {
    if (!rebalanceParams) return {}
    
    const bals: bigint[] = []
    const decimals: bigint[] = []
    const prices: number[] = []
    
    assets.forEach(({ token }) => {
      const address = token.address.toLowerCase()
      const d = token.decimals || 18
      const units = proposedUnits[address] || '0'
      
      try {
        bals.push(parseUnits(units, d))
      } catch {
        bals.push(0n)
      }
      decimals.push(BigInt(d))
      prices.push(rebalanceParams.prices[address]?.currentPrice || 0)
    })
    
    try {
      const shares = getCurrentBasket(bals, decimals, prices)
      
      return assets.reduce((acc, { token }, index) => {
        acc[token.address.toLowerCase()] = formatUnits(shares[index], 16)
        return acc
      }, {} as Record<string, string>)
    } catch {
      return {}
    }
  }, [assets, proposedUnits, rebalanceParams])

  return (
    <div className="border rounded-xl overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="border-r min-w-48">Token</TableHead>
            <TableHead className="text-right w-36">Current units</TableHead>
            <TableHead className="bg-primary/10 text-primary text-center font-bold">
              New units
            </TableHead>
            <TableHead className="text-right w-24">% of Basket</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.map(({ token, currentUnits }) => {
            const address = token.address.toLowerCase()
            const newUnits = proposedUnits[address] || currentUnits
            const sharePercent = derivedShares[address] || '0'
            
            return (
              <TableRow key={address}>
                <TableCell className="border-r">
                  <div className="flex items-center gap-2">
                    <TokenLogo symbol={token.symbol} address={token.address} />
                    <span>{token.symbol}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {currentUnits}
                </TableCell>
                <TableCell className="bg-primary/10">
                  <Input
                    type="text"
                    value={newUnits}
                    onChange={(e) => onUnitsChange(address, e.target.value)}
                    className="text-center tabular-nums"
                    placeholder="0"
                  />
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatPercentage(Number(sharePercent))}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

export default FinalizeWeightsTable