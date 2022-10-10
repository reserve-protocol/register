import styled from '@emotion/styled'
import { ReactNode, Suspense } from 'react'
import { Box, Flex } from 'theme-ui'
import Header from './header'
import MobileNav from './MobileNav'
import Sidebar from './sidebar'

const Container = styled(Flex)`
  flex-grow: 99999;
  flex-basis: 0;
  height: 100%;
  overflow: hidden;
  position: relative;
  flex-direction: column;
`

/**
 * Application Layout
 *
 * @param children - required
 * @returns {JSX.Element}
 */
const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <Flex
      sx={{
        flexWrap: 'wrap',
        height: '100%',
        maxWidth: '120em',
        margin: 'auto',
      }}
    >
      <Sidebar />
      <Container>
        <Header />
        <Suspense>
          <Box
            id="app-container"
            sx={{ overflow: 'auto', flexGrow: 99999, position: 'relative' }}
          >
            {children}
          </Box>
        </Suspense>
        <MobileNav />
      </Container>
    </Flex>
  )
}
export default Layout
