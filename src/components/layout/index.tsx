import styled from '@emotion/styled'
import { ReactNode, Suspense } from 'react'
import { Box, Flex } from 'theme-ui'
import Header from './header'
import MobileNav from './navigation/MobileNav'
import Sidebar from './sidebar'

const Container = styled(Flex)`
  flex-wrap: wrap;
  height: 100%;
  max-width: 95em;
  margin: auto;
`

const Wrapper = styled(Flex)`
  flex-grow: 99999;
  flex-basis: 0;
  height: 100%;
  overflow: hidden;
  position: relative;
  flex-direction: column;
`

const ContentContainer = styled(Box)`
  overflow: auto;
  flex-grow: 99999;
  position: 'relative';
`

/**
 * Application Layout
 *
 * @param children - required
 * @returns {JSX.Element}
 */
const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <Container>
      <Sidebar />
      <Wrapper>
        <Header />
        <Suspense>
          <ContentContainer id="app-container">{children}</ContentContainer>
        </Suspense>
        <MobileNav />
      </Wrapper>
    </Container>
  )
}
export default Layout
