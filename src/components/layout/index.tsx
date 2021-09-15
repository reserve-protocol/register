import { Box, Flex, Text } from 'rebass'
import styled from 'styled-components'
import Header from './header'

const Container = styled.div`
  height: 100vh;
  box-sizing: border-box;
`

// TODO: theming
const SideBar = styled.div`
  padding-top: 0;
  flex-grow: 1;
  flex-basis: 256px;
  box-sizing: border-box;
  background-color: black;
  color: white;
  display: flex;
  flex-direction: column;
  /* justify-content: center; */
  border-right: 1px solid #f5f5f5;
`

/**
 * Application Layout
 *
 * @param children - required
 * @returns {JSX.Element}
 */
const Layout = ({ children }: { children: React.ReactNode }) => (
  <Flex
    sx={{
      flexWrap: 'wrap',
    }}
  >
    <SideBar>
      <div
        style={{
          height: 60,
          borderBottom: '1px solid #f5f5f5',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text p={2} fontSize={2} fontWeight="bold">
          Reserve Explorer
        </Text>
      </div>
      <div>RTOKEN</div>
    </SideBar>
    <Box
      sx={{
        flexGrow: 99999,
        flexBasis: 0,
        minWidth: 320,
      }}
    >
      <Header />
      {children}
    </Box>
  </Flex>
)

export default Layout
