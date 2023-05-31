import { Trans, t } from '@lingui/macro'
import { Info } from 'components/info-box'
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import { Box, Checkbox, Divider, Image, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { Auction } from '../atoms'
import SwapIcon from './SwapIcon'
import GaugeIcon from 'components/icons/GaugeIcon'
import TokenLogo from 'components/icons/TokenLogo'
import useRToken from 'hooks/useRToken'

const RevenueAuctionItem = ({
  data,
  onSelect,
}: {
  data: Auction
  onSelect(): void
}) => {
  const [isOpen, toggle] = useState(false)
  const isBelowMinTrade = +data.minAmount > +data.amount
  const rToken = useRToken()

  return (
    <Box>
      <Box
        variant="layout.verticalAlign"
        mt={3}
        sx={{ cursor: 'pointer' }}
        onClick={() => toggle(!isOpen)}
      >
        <Info
          title="Surplus"
          icon={<SwapIcon buy={data.buy.symbol} sell={data.sell.symbol} />}
          subtitle={`${formatCurrency(+data.amount)} ${data.sell.symbol} for ${
            data.buy.symbol
          }`}
        />
        <Box ml="auto" variant="layout.verticalAlign">
          {data.canStart ? (
            <Box sx={{ position: 'relative' }}>
              <label>
                <Checkbox onChange={onSelect} sx={{ cursor: 'pointer' }} />
              </label>
            </Box>
          ) : (
            <Text sx={{ fontSize: 0, color: 'lightText' }} mr={2}>
              {isBelowMinTrade ? (
                <Trans>Surplus below minimum trade</Trans>
              ) : (
                <Trans>Not available</Trans>
              )}
            </Text>
          )}
        </Box>
        {isOpen ? (
          <ChevronUp
            size={18}
            color={!data.canStart ? 'lightText' : undefined}
          />
        ) : (
          <ChevronDown
            size={18}
            color={!data.canStart ? 'lightText' : undefined}
          />
        )}
      </Box>
      {isOpen && (
        <>
          <Divider my={3} mx={-4} sx={{ borderColor: 'darkBorder' }} />
          {data.canStart && (
            <Info
              icon={
                <TokenLogo
                  symbol={data.buy.symbol}
                  width={20}
                  src={data.buy.symbol === 'RSR' ? undefined : rToken?.logo}
                />
              }
              title={t`Tokens to match trade`}
              subtitle={`≈${formatCurrency(data.output)} ${data.buy.symbol}`}
              mb={3}
            />
          )}
          <Info
            icon={<GaugeIcon />}
            title={t`Minimum trade size`}
            subtitle={`${formatCurrency(+data.minAmount)} ${data.sell.symbol}`}
          />
        </>
      )}
    </Box>
  )
}

export default RevenueAuctionItem
