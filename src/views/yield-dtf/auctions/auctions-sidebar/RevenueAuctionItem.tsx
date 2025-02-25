import { Trans, t } from '@lingui/macro'
import CollapsableBox from '@/components/old/boxes/CollapsableBox'
import SelectableBox from '@/components/old/boxes/SelectableBox'
import GaugeIcon from 'components/icons/GaugeIcon'
import TokenLogo from 'components/icons/TokenLogo'
import { Info } from '@/components/old/info-box'
import useRToken from 'hooks/useRToken'
import { Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { Auction } from '../atoms'
import SwapIcon from './SwapIcon'

const UnavailablePlaceholder = ({
  isBelowMinTrade,
}: {
  isBelowMinTrade: boolean
}) => (
  <Text sx={{ fontSize: 0, color: 'text', display: ['none', 'block'] }} mr={2}>
    {isBelowMinTrade ? (
      <Trans>Surplus below minimum trade</Trans>
    ) : (
      <Trans>Not available</Trans>
    )}
  </Text>
)

const RevenueAuctionItem = ({
  data,
  onSelect,
}: {
  data: Auction
  onSelect(): void
}) => {
  const isBelowMinTrade = +data.minAmount > +data.amount
  const rToken = useRToken()

  return (
    <CollapsableBox
      mt={3}
      header={
        <SelectableBox
          unavailable={!Number(data.amount)}
          onSelect={onSelect}
          unavailableComponent={
            <UnavailablePlaceholder isBelowMinTrade={isBelowMinTrade} />
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
