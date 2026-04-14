import DutchTradeAbi from 'abis/DutchTrade'
import ERC20 from 'abis/ERC20'
import { ExecuteButton } from '@/components/ui/transaction-button'
import useHasAllowance from 'hooks/useHasAllowance'
import { useAtomValue } from 'jotai'
import { useCallback, useMemo, useState } from 'react'
import { chainIdAtom, walletAtom } from 'state/atoms'
import { formatCurrency } from 'utils'
import { BIGINT_MAX } from 'utils/constants'
import { Address, Hex, formatUnits } from 'viem'
import { useBalance } from 'wagmi'
import { DutchTrade } from '../atoms'
import AuctionTimeIndicators from './AuctionTimeIndicators'

const AuctionActions = ({
  data,
  currentPrice,
}: {
  data: DutchTrade
  currentPrice: bigint
}) => {
  const chainId = useAtomValue(chainIdAtom)
  const wallet = useAtomValue(walletAtom)
  const [bidded, setBidded] = useState(false)
  const bidBalance = useBalance({
    address: wallet ?? undefined,
    token: data.buying as Address,
    chainId,
  })

  const hasBalance = (bidBalance?.data?.value ?? 0n) >= currentPrice

  const [hasAllowance] = useHasAllowance([
    {
      token: data.buying as Hex,
      spender: data.id as Hex,
      amount: currentPrice,
    },
  ])

  const approveCall = useMemo(() => {
    let amount = currentPrice

    if (
      ['wcusdcv3', 'wcusdtv3'].includes(data?.buyingTokenSymbol.toLowerCase())
    ) {
      amount = BIGINT_MAX
    }

    return {
      abi: ERC20,
      address: data.buying as Hex,
      functionName: 'approve',
      args: [data.id as Hex, amount],
    }
  }, [currentPrice !== 0n, data.id])

  const bidCall = useMemo(
    () => ({
      abi: DutchTradeAbi,
      address: data.id as Hex,
      functionName: 'bid',
    }),
    []
  )

  const handleBid = useCallback(() => {
    setBidded(true)
  }, [])

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[auto_auto]">
      <div className="flex items-center flex-wrap">
        {!hasAllowance && (
          <>
            <ExecuteButton
              text={`Approve ${data.buyingTokenSymbol}`}
              call={approveCall}
              variant="accent"
              successLabel="Waiting allowance..."
              size="sm"
              className="ml-4"
            />
            <span className="text-legend text-xs ml-2">
              Prepare for bidding by approving {data.buyingTokenSymbol}
            </span>
          </>
        )}
        {hasAllowance && currentPrice !== 0n && (
          <>
            <ExecuteButton
              text={`Bid ${formatCurrency(
                +formatUnits(currentPrice, data.buyingTokenDecimals)
              )} ${data.buyingTokenSymbol}`}
              className="ml-4"
              call={hasBalance ? bidCall : undefined}
              variant="accent"
              successLabel="Auction bidded"
              txLabel={hasBalance ? 'Auction bid' : 'Not enough balance to bid'}
              disabled={!hasBalance}
              size="sm"
              onSuccess={handleBid}
            />
            <span className="text-legend text-xs ml-2">
              1 {data.sellingTokenSymbol} ={' '}
              {formatCurrency(
                Number(formatUnits(currentPrice, data.buyingTokenDecimals)) /
                  data.amount,
                5
              )}{' '}
              {data.buyingTokenSymbol}
            </span>
          </>
        )}
      </div>
      {!bidded && (
        <AuctionTimeIndicators start={+data.startedAt} end={+data.endAt} />
      )}
    </div>
  )
}

export default AuctionActions
