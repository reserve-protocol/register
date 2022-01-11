import styled from '@emotion/styled'
import { Box, Text } from '@theme-ui/components'
import { NavLink } from 'react-router-dom'
import Logo from 'components/icons/Logo'
import ROUTES from 'constants/routes'
import SyncedBlock from 'components/synced-block'
import ThemeColorMode from 'components/dark-mode-toggle/ThemeColorMode'

export const PAGES = [
  { path: '/', title: 'Overview' },
  { path: ROUTES.ISSUANCE, title: 'Mint + Redeem' },
  { path: ROUTES.STAKE, title: 'Stake + Unstake' },
  { path: '/test', title: 'Buy + Sell' },
]

const Container = styled.div`
  padding-top: 0;
  flex-grow: 1;
  flex-basis: 256px;
  box-sizing: border-box;
  background-color: #f6f6f7;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #77838f;
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
    <Text
      sx={{
        color: '#77838F',
        fontSize: 1,
        position: 'relative',
        top: -16,
        paddingLeft: 3,
      }}
    >
      Made by LC Labs
    </Text>
  </>
)

// Sidebar Navigation
const Navigation = () => (
  <Box mt={3}>
    {PAGES.map((item) => (
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
          borderLeft: isActive ? '5px solid #00FFBF' : '',
        })}
        to={item.path}
      >
        <Text>{item.title}</Text>
      </NavLink>
    ))}
  </Box>
)

// Sidebar footer
const Footer = () => (
  <Box m={4}>
    <ThemeColorMode mb={4} />
    <SyncedBlock />
  </Box>
)

/**
 * Application sidebar
 */
const Sidebar = () => (
  <Container>
    <Header />
    <Navigation />
    <Box my="auto" />
    <Footer />
  </Container>
)

export default Sidebar
