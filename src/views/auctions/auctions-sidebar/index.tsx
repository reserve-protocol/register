import { Trans, t } from '@lingui/macro'
import { InfoBox } from 'components'
import TokenLogo from 'components/icons/TokenLogo'
import { Info } from 'components/info-box'
import Sidebar from 'components/sidebar'
import { useAtomValue } from 'jotai'
import { useState } from 'react'
import { AlertTriangle, ChevronDown, ChevronUp, X } from 'react-feather'
import {
  Box,
  Button,
  Checkbox,
  Divider,
  Image,
  Flex,
  Spinner,
  Text,
} from 'theme-ui'
import { formatCurrency } from 'utils'
import { Auction, accumulatedRevenueAtom, auctionsOverviewAtom } from '../atoms'

const Header = ({ onClose }: { onClose(): void }) => {
  return (
    <Flex
      sx={{
        alignItems: 'center',
        height: '56px',
        flexShrink: 0,
      }}
      px={[3, 5]}
    >
      <Text variant="sectionTitle" sx={{ fontSize: 3 }} mr={1}>
        <Trans>Auctions</Trans>
      </Text>
      <Button variant="circle" ml="auto" onClick={onClose}>
        <X />
      </Button>
    </Flex>
  )
}

const RevenueOverview = () => {
  const revenue = useAtomValue(accumulatedRevenueAtom)

  return (
    <Box variant="layout.borderBox" p={3} m={4} mb={0}>
      <Box variant="layout.verticalAlign">
        <Text>Current accumulated revenue</Text>
        <Text ml="auto">${formatCurrency(revenue || 0)}</Text>
      </Box>
    </Box>
  )
}

const SwapIcon = ({ buy, sell }: { buy: string; sell: string }) => {
  return (
    <Box sx={{ position: 'relative' }}>
      <TokenLogo
        symbol={buy}
        sx={{ position: 'absolute', zIndex: 1, backgroundColor: 'white' }}
      />
      <TokenLogo symbol={sell} sx={{ position: 'absolute', top: '-6px' }} />
    </Box>
  )
}

const AuctionItem = ({ data }: { data: Auction }) => {
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
              <Checkbox sx={{ cursor: 'pointer' }} />
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

const AvailableAuctions = () => {
  const data = useAtomValue(auctionsOverviewAtom)

  return (
    <Box
      variant="layout.borderBox"
      p={4}
      sx={{ backgroundColor: 'contentBackground' }}
      mb={4}
    >
      <Text variant="subtitle" mb={4}>
        <Trans>Revenue auctions</Trans>
      </Text>
      {!!data &&
        data.revenue.map((auction, index) => (
          <>
            {!!index && (
              <Divider mx={-4} mt={3} sx={{ borderColor: 'darkBorder' }} />
            )}
            <AuctionItem key={index} data={auction} />
          </>
        ))}
      {!data && <Spinner />}
    </Box>
  )
}

const AuctionsSidebar = ({ onClose }: { onClose(): void }) => {
  return (
    <Sidebar onClose={onClose} width="40vw">
      <Header onClose={onClose} />
      <RevenueOverview />
      <Divider my={4} />
      <Box px={4} sx={{ flexGrow: 1, overflow: 'auto' }}>
        <AvailableAuctions />
      </Box>
      <Box p={4} sx={{ borderTop: '1px solid', borderColor: 'text' }}>
        <Button disabled sx={{ width: '100%' }}>
          No auctions selected...
        </Button>
      </Box>
    </Sidebar>
  )
}

export default AuctionsSidebar
