import styled from '@emotion/styled'
import { t, Trans } from '@lingui/macro'
import AuctionsIcon from 'components/icons/AuctionsIcon'
import CalculatorIcon from 'components/icons/CalculatorIcon'
import DiscussionsIcon from 'components/icons/DiscussionsIcon'
import GovernanceIcon from 'components/icons/GovernanceIcon'
import IssuanceIcon from 'components/icons/IssuanceIcon'
import ManagerIcon from 'components/icons/ManagerIcon'
import OverviewIcon from 'components/icons/OverviewIcon'
import StakeIcon from 'components/icons/StakeIcon'
import SyncedBlock from 'components/synced-block'
import { useAtomValue } from 'jotai/utils'
import { useMemo } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { isManagerAtom, rTokenAtom, selectedRTokenAtom } from 'state/atoms'
import { Box, Flex, Text } from 'theme-ui'
import { ReserveToken } from 'types'
import { isContentOnlyView, ROUTES } from 'utils/constants'
import Brand from '../Brand'

const Container = styled(Box)`
  padding-top: 0;
  flex-grow: 1;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--theme-ui-colors-border);
`

interface Item {
  path: string
  title: string
  Icon: React.ElementType
}

interface NavItemProps extends Item {
  rTokenAddress: string
}

const NavItem = ({ path, title, Icon, rTokenAddress }: NavItemProps) => (
  <NavLink
    key={path}
    style={({ isActive }) => ({
      paddingLeft: '5px',
      textDecoration: 'none',
      color: 'inherit',
      lineHeight: '32px',
      boxShadow: isActive
        ? 'inset 0 12px 0px var(--theme-ui-colors-background), inset 0 -12px 0px var(--theme-ui-colors-background), inset 4px 0px 0px currentColor'
        : 'none',
      display: 'flex',
    })}
    to={`${path}?token=${rTokenAddress}`}
  >
    <Box
      sx={{
        display: 'flex',
        flexGrow: 1,
        alignItems: 'center',
        paddingLeft: [0, 0, 4],
        justifyContent: ['center', 'center', 'inherit'],
      }}
      my={[10, 10, 10]}
    >
      <Icon />
      <Text sx={{ display: ['none', 'none', 'inherit'] }} ml={2}>
        {title}
      </Text>
    </Box>
  </NavLink>
)

// Sidebar Navigation
const Navigation = ({
  currentToken,
}: {
  currentToken?: ReserveToken | null
}) => {
  const isManager = useAtomValue(isManagerAtom)
  const PAGES = useMemo(() => {
    const items = [
      { path: ROUTES.OVERVIEW, title: t`Overview`, Icon: OverviewIcon },
      { path: ROUTES.ISSUANCE, title: t`Mint + Redeem`, Icon: IssuanceIcon },
      { path: ROUTES.INSURANCE, title: t`Stake + Unstake`, Icon: StakeIcon },
      {
        path: ROUTES.STAKING_CALCULATOR,
        title: t`Staking calculator`,
        Icon: CalculatorIcon,
      },
      { path: ROUTES.AUCTIONS, title: t`Auctions`, Icon: AuctionsIcon },
    ]

    if (isManager) {
      items.push({
        path: ROUTES.MANAGEMENT,
        title: t`Manager`,
        Icon: ManagerIcon,
      })
    }

    return items
  }, [isManager])

  const externalPages = useMemo(
    () => [
      {
        // TODO: get from token
        path: '/todo/1',
        title: t`Governance Discussions`,
        Icon: DiscussionsIcon,
      },
      {
        // TODO: get from token
        path: '/todo/2',
        title: t`Governance Voting`,
        Icon: GovernanceIcon,
      },
    ],
    []
  )

  const pages = useMemo(() => {
    PAGES[0].title = `${currentToken?.symbol ?? ''} Overview`

    if (currentToken?.isRSV) {
      return [...PAGES.slice(0, 2)]
    }

    return PAGES
  }, [currentToken])

  // TODO: Dont display external links for non whitelisted rTokens
  return (
    <Box mt={5}>
      {pages.map((item) => (
        <NavItem {...item} rTokenAddress={currentToken?.address ?? ''} />
      ))}

      {currentToken && !currentToken.isRSV && (
        <>
          <Text
            variant="legend"
            pl={5}
            mt={3}
            mb={2}
            sx={{ fontSize: 1, display: 'block' }}
          >
            <Trans>External Links</Trans>
          </Text>
          {externalPages.map((item) => (
            <NavItem {...item} rTokenAddress={currentToken.address} />
          ))}
        </>
      )}
    </Box>
  )
}

// Sidebar footer
const Footer = () => (
  <Box m={4}>
    <Flex sx={{ alignItems: 'center', display: ['none', 'none', 'flex'] }}>
      <Text
        sx={{
          fontSize: 0,
        }}
        variant="legend"
      >
        Made by LC Labs
      </Text>
      <Box mx="auto" />
      <SyncedBlock />
    </Flex>
  </Box>
)

/**
 * Application sidebar
 */
const Sidebar = () => {
  const rToken = useAtomValue(rTokenAtom)
  const selectedToken = useAtomValue(selectedRTokenAtom)
  const { pathname } = useLocation()

  if (isContentOnlyView(pathname) || !selectedToken) {
    return null
  }

  return (
    <Container sx={{ flexBasis: [64, 72, 264] }}>
      <Brand ml={[0, 0, 4]} mt={3} />
      <Navigation currentToken={rToken} />
      <Box my="auto" />
      <Footer />
    </Container>
  )
}

export default Sidebar
