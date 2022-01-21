import styled from '@emotion/styled'
import { Box, Text } from '@theme-ui/components'
import { NavLink } from 'react-router-dom'
import Logo from 'components/icons/Logo'
import ROUTES from 'constants/routes'
import SyncedBlock from 'components/synced-block'
import ThemeColorMode from 'components/dark-mode-toggle/ThemeColorMode'
import { useAppSelector } from 'state/hooks'
import { selectCurrentRToken } from 'state/reserve-tokens/reducer'
import { useMemo } from 'react'

export const PAGES = [
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
const Navigation = ({ isRSV }: { isRSV: boolean }) => {
  const pages = useMemo(() => {
    if (isRSV) {
      return [...PAGES.slice(0, 2), PAGES[3]]
    }

    return PAGES
  }, [isRSV])

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
            borderLeft: isActive ? '5px solid #00FFBF' : '',
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
    <SyncedBlock />
  </Box>
)

/**
 * Application sidebar
 */
const Sidebar = () => {
  const RToken = useAppSelector(selectCurrentRToken)

  return (
    <Container>
      <Header />
      <Navigation isRSV={RToken?.isRSV ?? false} />
      <Box my="auto" />
      <Footer />
    </Container>
  )
}

export default Sidebar
