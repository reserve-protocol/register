import DutchTradeAbi from 'abis/DutchTrade'
import ERC20 from 'abis/ERC20'
import { ExecuteButton } from 'components/button/TransactionButton'
import useHasAllowance from 'hooks/useHasAllowance'
import { useAtomValue } from 'jotai'
import { useCallback, useMemo, useState } from 'react'
import { chainIdAtom, rTokenAssetsAtom, walletAtom } from 'state/atoms'
import { Box, Grid, Text } from 'theme-ui'
import { formatCurrency, isAddress } from 'utils'
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
    <Grid columns={[1, 1, 1, 'auto auto']}>
      <Box variant="layout.verticalAlign" sx={{ flexWrap: 'wrap' }}>
        {!hasAllowance && (
          <>
            <ExecuteButton
              text={`Approve ${data.buyingTokenSymbol}`}
              call={approveCall}
              variant="accentAction"
              successLabel="Waiting allowance..."
              small
              ml={3}
            />
            <Text variant="legend" sx={{ fontSize: 1 }} ml={2}>
              Prepare for bidding by approving {data.buyingTokenSymbol}
            </Text>
          </>
        )}
        {hasAllowance && currentPrice !== 0n && (
          <>
            <ExecuteButton
              text={`Bid ${formatCurrency(
                +formatUnits(currentPrice, data.buyingTokenDecimals)
              )} ${data.buyingTokenSymbol}`}
              ml={3}
              call={hasBalance ? bidCall : undefined}
              variant="accentAction"
              successLabel="Auction bidded"
              txLabel={hasBalance ? 'Auction bid' : 'Not enough balance to bid'}
              disabled={!hasBalance}
              small
              onSuccess={handleBid}
            />
            <Text variant="legend" sx={{ fontSize: 1 }} ml={2}>
              1 {data.sellingTokenSymbol} ={' '}
              {formatCurrency(
                Number(formatUnits(currentPrice, data.buyingTokenDecimals)) /
                  data.amount,
                5
              )}{' '}
              {data.buyingTokenSymbol}
            </Text>
          </>
        )}
      </Box>
      {!bidded && (
        <AuctionTimeIndicators start={+data.startedAt} end={+data.endAt} />
      )}
    </Grid>
  )
}

export default AuctionActions
