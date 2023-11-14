import { Trans, t } from '@lingui/macro'
import { Button } from 'components'
import MeltIcon from 'components/icons/MeltIcon'
import Sidebar from 'components/sidebar'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useState } from 'react'
import { ChevronDown, ChevronUp, Circle, X } from 'react-feather'
import { Box, BoxProps, Card, Divider, Flex, Text } from 'theme-ui'
import { auctionSidebarAtom, auctionsOverviewAtom } from '../atoms'
import { formatCurrency } from 'utils'
import Help from 'components/help'

interface RevenueOverviewHeader extends BoxProps {
  text: string
  help: string
  amount: number
  muted?: boolean
}

const RevenueOverviewHeader = ({
  text,
  amount,
  help,
  muted,
  ...props
}: RevenueOverviewHeader) => {
  return (
    <Box variant="layout.verticalAlign" mx={3} mb={3} {...props}>
      <Circle
        size={8}
        fill={!muted ? '#11BB8D' : '#FF0000'}
        stroke={undefined}
      />
      <Text ml="2">{text}</Text>
      <Text variant="strong" ml="auto" mr="2">
        ${formatCurrency(amount)}
      </Text>
      <Help content={help} />
    </Box>
  )
}

const Header = () => {
  const close = useSetAtom(auctionSidebarAtom)

  return (
    <Flex
      sx={{
        alignItems: 'center',
        flexShrink: 0,
      }}
      px={[3, 5]}
      pt={3}
    >
      <Text variant="sectionTitle" mr={1}>
        <Trans>Auctions</Trans>
      </Text>
      <Button variant="circle" ml="auto" onClick={close}>
        <X />
      </Button>
    </Flex>
  )
}

interface RevenueContainer extends BoxProps {
  icon: React.ReactNode
  title: string
  subtitle: string
  btnLabel: string
  muted?: boolean
  defaultOpen?: boolean
}

const RevenueContainer = ({
  icon,
  title,
  subtitle,
  btnLabel,
  muted,
  children,
  defaultOpen,
  ...props
}: RevenueContainer) => {
  const [expanded, setExpanded] = useState(!!defaultOpen)

  return (
    <Card
      p={0}
      sx={{ border: '1px dashed', backgroundColor: 'white' }}
      {...props}
    >
      <Box p={3} variant="layout.verticalAlign">
        <Box mr={3} sx={{ color: !muted ? 'text' : 'muted' }}>
          {icon}
        </Box>
        <Box>
          <Box variant="layout.verticalAlign">
            <Text variant="title">{title}</Text>
          </Box>
          <Text>{subtitle}</Text>
        </Box>
        <Button
          ml="auto"
          small
          sx={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: !muted ? 'primary' : 'muted',
            color: !muted ? 'white' : 'text',
          }}
          onClick={() => setExpanded(!expanded)}
        >
          <Text mr={2}>{btnLabel}</Text>
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </Button>
      </Box>
      {expanded && (
        <>
          <Divider sx={{ borderColor: 'darkBorder' }} m={0} />
          <Box p={3}>{children}</Box>
        </>
      )}
    </Card>
  )
}

const Revenue = () => {
  const data = useAtomValue(auctionsOverviewAtom)

  return (
    <Box p={4}>
      <RevenueOverviewHeader
        text={t`Actionable accumulated revenue`}
        amount={0}
        help="text"
      />
      <RevenueContainer
        title="Melting"
        icon={<MeltIcon />}
        subtitle="other"
        btnLabel="expand"
      >
        tadasdasdasdasodnasd
      </RevenueContainer>
    </Box>
  )
}

const AuctionsSidebar = () => {
  const [isOpen, toggleSidebar] = useAtom(auctionSidebarAtom)

  if (!isOpen) {
    return null
  }

  return (
    <Sidebar
      onClose={toggleSidebar}
      width="600px"
      sx={{ backgroundColor: 'contentBackground' }}
    >
      <Header />
      <Revenue />
      {/* <Divider my={4} /> */}
      {/* <RecollaterizationAlert /> */}
      {/* <Box px={4} sx={{ flexGrow: 1, overflow: 'auto' }}>
        <SettleableAuctions />
        <RevenueAuctionList />
      </Box>
      <ConfirmAuction /> */}
    </Sidebar>
  )
}

export default AuctionsSidebar
