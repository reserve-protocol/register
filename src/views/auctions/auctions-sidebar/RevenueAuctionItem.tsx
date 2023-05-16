import { t } from '@lingui/macro'
import { Info } from 'components/info-box'
import { useState } from 'react'
import { AlertTriangle, ChevronDown, ChevronUp } from 'react-feather'
import { Box, Checkbox, Divider, Image } from 'theme-ui'
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
        <Box ml="auto">
          {!data.canStart ? (
            <label>
              <Checkbox onChange={onSelect} sx={{ cursor: 'pointer' }} />
            </label>
          ) : (
            <Box>
              <AlertTriangle color="#FF7A00" />
            </Box>
          )}
        </Box>
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </Box>
      {isOpen && (
        <>
          <Divider my={3} mx={-4} sx={{ borderColor: 'darkBorder' }} />
          {data.canStart && (
            <Info
              icon={<Image src="/svgs/asterisk.svg" />}
              title={t`Tokens to match trade`}
              subtitle={`≈${formatCurrency(data.output)} ${data.buy.symbol}`}
              mb={3}
            />
          )}
          <Info
            icon={<Image src="/svgs/asterisk.svg" />}
            title={t`Minimum trade size`}
            subtitle={`${formatCurrency(+data.minAmount)} ${data.sell.symbol}`}
          />
        </>
      )}
    </Box>
  )
}

export default RevenueAuctionItem
