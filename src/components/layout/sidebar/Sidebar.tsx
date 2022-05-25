import styled from '@emotion/styled'
import { Box, Flex, Text } from 'theme-ui'
import { NavLink } from 'react-router-dom'
import Logo from 'components/icons/Logo'
import SyncedBlock from 'components/synced-block'
import ThemeColorMode from 'components/dark-mode-toggle/ThemeColorMode'
import { useMemo } from 'react'
import { ReserveToken } from 'types'
import { rTokenAtom } from 'state/atoms'
import { useAtomValue } from 'jotai/utils'
import { ROUTES } from 'utils/constants'
import StakeIcon from 'components/icons/StakeIcon'
import IssuanceIcon from 'components/icons/IssuanceIcon'
import OverviewIcon from 'components/icons/OverviewIcon'

export const PAGES = [
  { path: ROUTES.HOME, title: 'Home', icon: OverviewIcon },
  { path: ROUTES.OVERVIEW, title: 'Overview', icon: OverviewIcon },
  { path: ROUTES.ISSUANCE, title: 'Mint + Redeem', icon: IssuanceIcon },
  { path: ROUTES.INSURANCE, title: 'Stake + Unstake', icon: StakeIcon },
  // { path: ROUTES.EXCHANGE, title: 'Buy + Sell' },
]

const Container = styled.div`
  padding-top: 0;
  flex-grow: 1;
  flex-basis: 264px;
  box-sizing: border-box;
  /* background-color: var(--theme-ui-colors-sidebar); */
  display: flex;
  flex-direction: column;
  border-right: 1px solid #dfdfdf;
`

// Sidebar header
const Header = () => (
  <>
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
      }}
      mt={3}
      ml={4}
    >
      <Logo />
    </Box>
  </>
)

// Sidebar Navigation
const Navigation = ({
  currentToken,
}: {
  currentToken?: ReserveToken | null
}) => {
  const pages = useMemo(() => {
    if (!currentToken) {
      return []
    }

    PAGES[1].title = `${currentToken.token.symbol} Overview`

    if (currentToken.isRSV) {
      return [...PAGES.slice(0, 3)]
    }

    return PAGES
  }, [currentToken])

  return (
    <Box mt={2}>
      {pages.map((item) => (
        <NavLink
          key={item.path}
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            color: 'inherit',
            padding: '0 32px',
            margin: '16px 0',
            lineHeight: '32px',
            paddingLeft: isActive ? '20px' : '25px',
            borderLeft: isActive ? '5px solid black' : '',
          })}
          to={item.path}
        >
          <item.icon />
          <Text ml={2}>{item.title}</Text>
        </NavLink>
      ))}
    </Box>
  )
}

// Sidebar footer
const Footer = () => (
  <Box m={4}>
    <ThemeColorMode mb={3} />
    <Flex sx={{ alignItems: 'center' }}>
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
  const RToken = useAtomValue(rTokenAtom)

  return (
    <Container>
      <Header />
      <Navigation currentToken={RToken} />
      <Box my="auto" />
      <Footer />
    </Container>
  )
}

export default Sidebar
