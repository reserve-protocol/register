import styled from '@emotion/styled'
import { Box, Flex, Text } from 'theme-ui'
import { Link, NavLink, useLocation } from 'react-router-dom'
import Logo, { SmallLogo } from 'components/icons/Logo'
import SyncedBlock from 'components/synced-block'
import ThemeColorMode from 'components/dark-mode-toggle/ThemeColorMode'
import { useMemo } from 'react'
import { ReserveToken } from 'types'
import { rTokenAtom, selectedRTokenAtom } from 'state/atoms'
import { useAtomValue } from 'jotai/utils'
import { isContentOnlyView, ROUTES } from 'utils/constants'
import StakeIcon from 'components/icons/StakeIcon'
import IssuanceIcon from 'components/icons/IssuanceIcon'
import OverviewIcon from 'components/icons/OverviewIcon'
import { t } from '@lingui/macro'
import CalculatorIcon from 'components/icons/CalculatorIcon'
import AuctionsIcon from 'components/icons/AuctionsIcon'
import GovernanceIcon from 'components/icons/GovernanceIcon'
import DiscussionsIcon from 'components/icons/DiscussionsIcon'
import Brand from '../Brand'

const Container = styled(Box)`
  padding-top: 0;
  flex-grow: 1;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--theme-ui-colors-border);
`

// Sidebar Navigation
const Navigation = ({
  currentToken,
}: {
  currentToken?: ReserveToken | null
}) => {
  const PAGES = useMemo(
    () => [
      { path: ROUTES.OVERVIEW, title: t`Overview`, icon: OverviewIcon },
      { path: ROUTES.ISSUANCE, title: t`Mint + Redeem`, icon: IssuanceIcon },
      { path: ROUTES.INSURANCE, title: t`Stake + Unstake`, icon: StakeIcon },
      {
        path: ROUTES.STAKING_CALCULATOR,
        title: t`Staking calculator`,
        icon: CalculatorIcon,
      },
      { path: ROUTES.AUCTIONS, title: t`Auctions`, icon: AuctionsIcon },
      {
        // TODO: get from token
        path: '/todo/1',
        title: t`Governance Discussions`,
        icon: DiscussionsIcon,
      },
      {
        // TODO: get from token
        path: '/todo/2',
        title: t`Governance Voting`,
        icon: GovernanceIcon,
      },
    ],
    []
  )
  const pages = useMemo(() => {
    PAGES[0].title = `${currentToken?.symbol} Overview`

    if (currentToken?.isRSV) {
      return [...PAGES.slice(0, 2)]
    }

    return PAGES
  }, [currentToken])

  return (
    <Box mt={5}>
      {pages.map((item) => (
        <NavLink
          key={item.path}
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
          to={item.path + '?token=' + currentToken?.address}
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
            <item.icon />
            <Text sx={{ display: ['none', 'none', 'inherit'] }} ml={2}>
              {item.title}
            </Text>
          </Box>
        </NavLink>
      ))}
    </Box>
  )
}

// Sidebar footer
const Footer = () => (
  <Box m={4}>
    <ThemeColorMode mb={3} ml={[-1, 0]} />
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
