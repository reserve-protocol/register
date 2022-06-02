import styled from '@emotion/styled'
import { Box, Flex, Text } from 'theme-ui'
import { NavLink } from 'react-router-dom'
import Logo, { SmallLogo } from 'components/icons/Logo'
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

const Container = styled(Box)`
  padding-top: 0;
  flex-grow: 1;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--theme-ui-colors-border);
`

// Sidebar header
const Header = () => (
  <>
    <Box
      sx={{
        width: '100%',
        display: ['none', 'none', 'flex'],
        alignItems: 'center',
      }}
      mt={3}
      ml={4}
    >
      <Logo />
    </Box>
    <Box
      sx={{
        display: ['inherit', 'inherit', 'none'],
        alignItems: 'center',
        justifyContent: 'center',
      }}
      mt={3}
    >
      <SmallLogo />
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

    PAGES[1].title = `${currentToken.symbol} Overview`

    if (currentToken.isRSV) {
      return [...PAGES.slice(0, 3)]
    }

    return PAGES
  }, [currentToken])

  return (
    <Box mt={3}>
      {pages.map((item) => (
        <NavLink
          key={item.path}
          style={({ isActive }) => ({
            paddingLeft: isActive ? '0' : '5px',
            borderLeft: isActive ? '5px solid black' : '',
            textDecoration: 'none',
            color: 'inherit',
            lineHeight: '32px',
            // margin: '16px 0',
            display: 'flex',
          })}
          to={item.path}
        >
          <Box
            sx={{
              display: 'flex',
              flexGrow: 1,
              alignItems: 'center',
              paddingLeft: [0, 0, 27],
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
  const RToken = useAtomValue(rTokenAtom)

  return (
    <Container sx={{ flexBasis: [64, 72, 264] }}>
      <Header />
      <Navigation currentToken={RToken} />
      <Box my="auto" />
      <Footer />
    </Container>
  )
}

export default Sidebar
