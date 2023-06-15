import styled from '@emotion/styled'
import { ReactNode, Suspense } from 'react'
import { Box, Flex } from 'theme-ui'
import Header from './header'
import MobileNav from './navigation/MobileNav'
import TokenMenu from './token-menu'
import useIsSidebarVisible from 'hooks/useIsSidebarVisible'

const Container = styled(Flex)`
  overflow: auto;
  height: 100%;
`

const Wrapper = styled(Flex)`
  flex-grow: 99999;
  flex-basis: 0;
  max-width: 95em;
  position: relative;
  flex-direction: column;
  margin: auto;
`

const ContentContainer = styled(Box)`
  position: relative;
  flex: auto;
`

const TopSpacer = () => {
  const isVisible = useIsSidebarVisible()

  return <Box sx={{ height: isVisible ? ['72px', '144px'] : '72px' }} />
}

const BottomSpacer = () => {
  const isVisible = useIsSidebarVisible()

  return <Box sx={{ height: isVisible ? ['58px', 0] : 0 }} />
}

/**
 * Application Layout
 *
 * @param children - required
 * @returns {JSX.Element}
 */
const Layout = ({ children }: { children: ReactNode }) => (
  <Container>
    <Wrapper>
      <Header />
      <TokenMenu />
      <TopSpacer />
      <Suspense>
        <ContentContainer id="app-container">{children}</ContentContainer>
      </Suspense>
      <BottomSpacer />
      <MobileNav />
    </Wrapper>
  </Container>
)

export default Layout
