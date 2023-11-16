import DutchTradeAbi from 'abis/DutchTrade'
import ERC20 from 'abis/ERC20'
import { ExecuteButton } from 'components/button/TransactionButton'
import useHasAllowance from 'hooks/useHasAllowance'
import { useCallback, useMemo, useState } from 'react'
import { Box, Grid, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { Address, Hex, formatEther } from 'viem'
import { DutchTrade } from '../atoms'
import AuctionTimeIndicators from './AuctionTimeIndicators'
import { useBalance } from 'wagmi'
import { useAtomValue } from 'jotai'
import { chainIdAtom, walletAtom } from 'state/atoms'

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

  const approveCall = useMemo(
    () => ({
      abi: ERC20,
      address: data.buying as Hex,
      functionName: 'approve',
      args: [data.id as Hex, currentPrice],
    }),
    [currentPrice, data.id]
  )

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
    <Grid columns={[1, 1, 1, 'auto auto']}>
      <Box variant="layout.verticalAlign" sx={{ flexWrap: 'wrap' }}>
        {!hasBalance || currentPrice === 0n ? (
          <Text ml={3} variant="legend">
            No enough balance to bid
          </Text>
        ) : (
          <>
            {!hasAllowance && (
              <>
                <ExecuteButton
                  text={`Approve ${data.buyingTokenSymbol}`}
                  call={approveCall}
                  variant="accentAction"
                  successLabel="Waiting allowance..."
                  small
                />
                <Text variant="legend" sx={{ fontSize: 1 }} ml={2}>
                  Prepare for bidding by approving {data.buyingTokenSymbol}
                </Text>
              </>
            )}
            {hasAllowance && (
              <>
                <ExecuteButton
                  text={`Bid ${formatCurrency(+formatEther(currentPrice))} ${
                    data.buyingTokenSymbol
                  }`}
                  call={bidCall}
                  variant="accentAction"
                  successLabel="Auction bidded"
                  txLabel="Auction bid"
                  small
                  onSuccess={handleBid}
                />
                <Text variant="legend" sx={{ fontSize: 1 }} ml={2}>
                  1 {data.sellingTokenSymbol} ={' '}
                  {formatCurrency(
                    Number(formatEther(currentPrice)) / data.amount,
                    5
                  )}{' '}
                  {data.buyingTokenSymbol}
                </Text>
              </>
            )}
          </>
        )}
      </Box>
      {!bidded && (
        <AuctionTimeIndicators start={+data.startBlock} end={+data.endBlock} />
      )}
    </Grid>
  )
}

export default AuctionActions
