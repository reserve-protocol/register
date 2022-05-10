import styled from '@emotion/styled'
import { Box, Text } from 'theme-ui'
import { NavLink } from 'react-router-dom'
import Logo from 'components/icons/Logo'
import ROUTES from 'constants/routes'
import SyncedBlock from 'components/synced-block'
import ThemeColorMode from 'components/dark-mode-toggle/ThemeColorMode'
import { useMemo } from 'react'
import { ReserveToken } from 'types'
import { rTokenAtom } from 'state/atoms'
import { useAtomValue } from 'jotai/utils'

export const PAGES = [
  { path: ROUTES.HOME, title: 'Home' },
  { path: ROUTES.OVERVIEW, title: 'Overview' },
  { path: ROUTES.ISSUANCE, title: 'Mint + Redeem' },
  { path: ROUTES.INSURANCE, title: 'Stake + Unstake' },
  { path: ROUTES.EXCHANGE, title: 'Buy + Sell' },
]

const Container = styled.div`
  padding-top: 0;
  flex-grow: 1;
  flex-basis: 256px;
  box-sizing: border-box;
  background-color: var(--theme-ui-colors-sidebar);
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
        padding: 3,
        justifyContent: 'center',
      }}
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

    if (currentToken.isRSV) {
      return [...PAGES.slice(0, 3), PAGES[4]]
    }

    return PAGES
  }, [currentToken])

  return (
    <Box mt={2}>
      {pages.map((item) => (
        <NavLink
          key={item.path}
          style={({ isActive }) => ({
            fontSize: 18,
            textDecoration: 'none',
            color: 'inherit',
            display: 'block',
            padding: '0 32px',
            margin: '16px 0',
            lineHeight: '32px',
            paddingLeft: isActive ? '27px' : '32px',
            borderLeft: isActive ? '5px solid black' : '',
          })}
          to={item.path}
        >
          <Text>{item.title}</Text>
        </NavLink>
      ))}
    </Box>
  )
}

// Sidebar footer
const Footer = () => (
  <Box m={4}>
    <ThemeColorMode mb={4} />
    <SyncedBlock mb={2} />
    <Text
      sx={{
        color: '#77838F',
        fontSize: 1,
        position: 'relative',
      }}
    >
      Made by LC Labs
    </Text>
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
