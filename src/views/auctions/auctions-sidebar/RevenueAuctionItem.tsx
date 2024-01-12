import { Trans, t } from '@lingui/macro'
import CollapsableBox from 'components/boxes/CollapsableBox'
import SelectableBox from 'components/boxes/SelectableBox'
import GaugeIcon from 'components/icons/GaugeIcon'
import TokenLogo from 'components/icons/TokenLogo'
import { Info } from 'components/info-box'
import useRToken from 'hooks/useRToken'
import { useState } from 'react'
import { Box, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { Auction } from '../atoms'
import SwapIcon from './SwapIcon'

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
    <CollapsableBox
      mt={3}
      header={
        <Box
          variant="layout.verticalAlign"
          sx={{ cursor: 'pointer' }}
          onClick={() => toggle(!isOpen)}
        >
          <SelectableBox
            unavailable={!data.canStart}
            onSelect={onSelect}
            unavailableComponent={
              <Text sx={{ fontSize: 0, color: 'text' }} mr={2}>
                {isBelowMinTrade ? (
                  <Trans>Surplus below minimum trade</Trans>
                ) : (
                  <Trans>Not available</Trans>
                )}
              </Text>
            }
          >
            <Info
              title="Surplus"
              icon={<SwapIcon buy={data.buy.symbol} sell={data.sell.symbol} />}
              subtitle={`${formatCurrency(+data.amount)} ${
                data.sell.symbol
              } for ${data.buy.symbol}`}
            />
          </SelectableBox>
        </Box>
      }
    >
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
    </CollapsableBox>
  )
}

export default RevenueAuctionItem
