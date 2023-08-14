import { Trans } from '@lingui/macro'
import DutchTradeAbi from 'abis/DutchTrade'
import ERC20 from 'abis/ERC20'
import { ExecuteButton } from 'components/button/TransactionButton'
import AuctionsIcon from 'components/icons/AuctionsIcon'
import CalculatorIcon from 'components/icons/CalculatorIcon'
import TokenLogo from 'components/icons/TokenLogo'
import { MouseoverTooltip } from 'components/tooltip'
import useHasAllowance from 'hooks/useHasAllowance'
import { useAtomValue } from 'jotai'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowRight, ChevronDown } from 'react-feather'
import { blockAtom, chainIdAtom } from 'state/atoms'
import { Box, Card, Divider, Grid, Spinner, Text } from 'theme-ui'
import { formatCurrency, parseDuration } from 'utils'
import { blockDuration } from 'utils/constants'
import { Hex, formatEther, parseEther } from 'viem'
import { useContractRead } from 'wagmi'
import { DutchTrade } from '../atoms'

interface Props {
  data: DutchTrade
}

const AuctionItem = ({
  title,
  icon,
  symbol,
  forSymbol,
  amount,
  price,
}: {
  title: string
  icon: any
  amount: number
  symbol: string
  forSymbol?: string
  price?: number
}) => (
  <Box variant="layout.verticalAlign">
    {icon}
    <Box ml={2}>
      <Text sx={{ fontSize: 1, display: 'block' }} mb={1} variant="legend">
        {title}
      </Text>
      <Text>
        {formatCurrency(amount)} {symbol}
      </Text>
    </Box>
    {!!price && !!forSymbol && (
      <MouseoverTooltip
        text={`1 ${forSymbol} = ${formatCurrency(price, 5)} ${symbol}`}
      >
        <Box ml={3} variant="layout.verticalAlign" sx={{ cursor: 'pointer' }}>
          <CalculatorIcon />
          <ChevronDown size={14} style={{ marginTop: -3 }} />
        </Box>
      </MouseoverTooltip>
    )}
  </Box>
)

const DutchAuction = ({ data }: Props) => {
  const currentBlock = useAtomValue(blockAtom) ?? 0
  const chainId = useAtomValue(chainIdAtom)
  const [currentPrice, setCurrentPrice] = useState(0)
  const [nextPrice, setNextPrice] = useState(0)
  const [bidded, setBidded] = useState(false)

  const blocksLeft = Number(data.endBlock) - currentBlock
  const auctionLength = Number(data.endBlock) - Number(data.startBlock)
  const bufferBlocks = Math.round(auctionLength * 0.2)
  const finalPriceBlock =
    Number(data.startBlock) + (auctionLength - bufferBlocks)
  const isEnding = currentBlock >= finalPriceBlock
  const isWarmupPeriod = currentBlock < Number(data.startBlock) + bufferBlocks

  const { data: priceResult } = useContractRead({
    abi: DutchTradeAbi,
    address: data.id as Hex,
    functionName: 'bidAmount',
    args: [BigInt(currentBlock ?? 0)],
    enabled: !!currentBlock,
  })
  const { data: nextPriceResult } = useContractRead({
    abi: DutchTradeAbi,
    address: data.id as Hex,
    functionName: 'bidAmount',
    args: [BigInt((currentBlock ?? 0) + 1)],
    enabled: !!currentBlock,
  })

  const bidAmount = parseEther(
    (data.amount * (currentPrice || data.worstCasePrice)).toString()
  )

  const hasAllowance = useHasAllowance([
    {
      token: data.buying as Hex,
      spender: data.id as Hex,
      amount: bidAmount,
    },
  ])

  const approveCall = useMemo(
    () => ({
      abi: ERC20,
      address: data.buying as Hex,
      functionName: 'approve',
      args: [data.id as Hex, bidAmount],
    }),
    [bidAmount, data.id]
  )

  const bidCall = useMemo(
    () => ({
      abi: DutchTradeAbi,
      address: data.id as Hex,
      functionName: 'bid',
    }),
    []
  )

  useEffect(() => {
    if (priceResult) {
      setCurrentPrice(Number(formatEther(priceResult)))
    }
  }, [priceResult])

  useEffect(() => {
    if (nextPriceResult) {
      setNextPrice(Number(formatEther(nextPriceResult)))
    }
  }, [nextPriceResult])

  const handleBid = useCallback(() => {
    setBidded(true)
  }, [])

  return (
    <Card p={2} sx={{ display: 'flex', alignItems: 'center' }} mb={3}>
      <Box sx={{ flexGrow: 1 }}>
        <Grid sx={{ flexGrow: 1 }} columns={[2, 4]}>
          <AuctionItem
            title="Selling"
            icon={<TokenLogo width={16} symbol={data.sellingTokenSymbol} />}
            symbol={data.sellingTokenSymbol}
            amount={data.amount}
          />
          <AuctionItem
            title="Buying (current price)"
            icon={<TokenLogo width={16} symbol={data.buyingTokenSymbol} />}
            symbol={data.buyingTokenSymbol}
            forSymbol={data.sellingTokenSymbol}
            amount={data.amount * currentPrice}
            price={currentPrice}
          />
          <AuctionItem
            title="Next block bid amount"
            icon={<ArrowRight size={16} />}
            symbol={data.buyingTokenSymbol}
            forSymbol={data.sellingTokenSymbol}
            amount={data.amount * nextPrice}
            price={nextPrice}
          />
          <AuctionItem
            title="Final price"
            icon={<ArrowRight size={16} />}
            symbol={data.buyingTokenSymbol}
            forSymbol={data.sellingTokenSymbol}
            amount={data.amount * data.worstCasePrice}
            price={data.worstCasePrice}
          />
        </Grid>
        <Divider my={2} sx={{ fontSize: 1 }} />
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
                />
                <Text variant="legend" sx={{ fontSize: 1 }} ml={2}>
                  Prepare for bidding by approving {data.buyingTokenSymbol}
                </Text>
              </>
            )}
            {hasAllowance && (
              <>
                <ExecuteButton
                  text={`Bid ${formatCurrency(+formatEther(bidAmount))} ${
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
                  {formatCurrency(currentPrice, 5)} {data.buyingTokenSymbol}
                </Text>
              </>
            )}
          </Box>
          {!bidded && (
            <Box
              variant="layout.verticalAlign"
              ml={[0, 0, 0, 'auto']}
              mt={[1, 1, 1, 0]}
              pr={3}
              sx={{ flexWrap: 'wrap' }}
            >
              <Spinner color={isEnding ? 'warning' : 'primary'} size={16} />
              {!isEnding && (
                <>
                  <Text variant="legend" ml={2} mr={1}>
                    <Trans>Final price in:</Trans>
                  </Text>
                  <Text variant="strong" mr={3}>
                    {finalPriceBlock - currentBlock} blocks
                  </Text>
                </>
              )}
              {!isEnding && <AuctionsIcon />}
              <Text ml={2} mr={1}>
                Auction ends in:
              </Text>
              <Text
                variant="strong"
                sx={{ color: isEnding ? 'warning' : 'text' }}
              >
                {Math.max(blocksLeft, 0)} blocks
              </Text>
              <Text ml={1} sx={{ display: ['none', 'block'] }}>
                (
                {parseDuration(blocksLeft * (blockDuration[chainId] ?? 12), {
                  units: ['m'],
                  round: true,
                })}
                )
              </Text>
            </Box>
          )}
        </Grid>
      </Box>
    </Card>
  )
}

export default DutchAuction
