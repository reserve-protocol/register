import styled from '@emotion/styled'
import useIsSidebarVisible from 'hooks/useIsSidebarVisible'
import { ReactNode } from 'react'
import { Box, Flex } from 'theme-ui'
import Header from './header'
import MobileNav from './navigation/MobileNav'
import TokenMenu from './token-menu'

const Container = styled(Flex)`
  overflow: auto;
  height: 100%;
`

const Wrapper = styled(Box)`
  max-width: 95em;
  margin-left: auto;
  margin-right: auto;
`

const TopSpacer = () => {
  const isVisible = useIsSidebarVisible()

  return (
    <Box sx={{ overflow: 'hidden' }}>
      <Box
        sx={{
          height: isVisible ? ['72px', '144px'] : '72px',
          width: '100em',
          overflow: 'hidden',
        }}
      />
    </Box>
  )
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
  <Container id="app-container">
    <Wrapper>
      <TopSpacer />
      <Box>{children}</Box>
      <BottomSpacer />
      <MobileNav />
      <Header />
      <TokenMenu />
    </Wrapper>
  </Container>
)

// export const BaseLayout = ({ children }: { children?: ReactNode }) => (
//   <Container id="app-container">
//     <Wrapper>
//       <Header />
//       <Box sx={{ overflow: 'hidden' }}>
//         <Box
//           sx={{
//             height: '72px',
//             width: '100em',
//             overflow: 'hidden',
//           }}
//         />
//       </Box>
//       {children}
//     </Wrapper>
//     <Analytics />
//   </Container>
// )

export default Layout
