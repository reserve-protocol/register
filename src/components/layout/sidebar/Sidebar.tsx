import styled from '@emotion/styled'
import { Box, Text, useColorMode } from 'theme-ui'
import { NavLink } from 'react-router-dom'
import Logo from 'components/icons/Logo'
import ROUTES from 'constants/routes'
import DarkModeToggle from 'components/dark-mode-toggle'
import SyncedBlock from 'components/synced-block'
import ThemeColorMode from 'components/dark-mode-toggle/ThemeColorMode'

export const PAGES = [
  { path: ROUTES.OVERVIEW, title: 'Overview' },
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
  /* justify-content: center; */
  border-right: 1px solid #77838f;
`

const Sidebar = () => (
  <Container>
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
    <Box mt={3}>
      {PAGES.map((item) => (
        <NavLink
          key={item.path}
          style={{
            fontSize: 18,
            textDecoration: 'none',
            color: 'inherit',
            display: 'block',
            padding: '0 32px',
            margin: '16px 0',
            lineHeight: '32px',
          }}
          to={item.path}
          activeStyle={{
            borderLeft: '5px solid #00FFBF',
            paddingLeft: '26px',
          }}
        >
          <Text>{item.title}</Text>
        </NavLink>
      ))}
    </Box>
    <Box my="auto" />
    <Box m={4}>
      <ThemeColorMode mb={4} />
      <SyncedBlock />
    </Box>
  </Container>
)

export default Sidebar
