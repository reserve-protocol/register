import { Trans } from '@lingui/macro'
import Sidebar from 'components/sidebar'
import { useAtomValue } from 'jotai'
import { X } from 'react-feather'
import { Text, Flex, Button, Box, Divider } from 'theme-ui'
import { accumulatedRevenueAtom } from './atoms'
import { formatCurrency } from 'utils'

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

const AuctionsSidebar = ({ onClose }: { onClose(): void }) => {
  return (
    <Sidebar onClose={onClose} width="40vw">
      <Header onClose={onClose} />
      <RevenueOverview />
      <Divider my={4} />
      <Box px={4} sx={{ flexGrow: 1, overflow: 'auto' }}>
        <Box
          variant="layout.borderBox"
          sx={{ backgroundColor: 'contentBackground', height: 300 }}
          mb={4}
        >
          dsads
        </Box>
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
