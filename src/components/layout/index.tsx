import styled from '@emotion/styled'
import useIsSidebarVisible from 'hooks/useIsSidebarVisible'
import { ReactNode, useEffect, useState } from 'react'
import { Box, Card, Close, Flex, Link, Text } from 'theme-ui'
import Header from './header'
import MobileNav from './navigation/MobileNav'
import TokenMenu from './token-menu'
import useRToken from 'hooks/useRToken'
import { Trans } from '@lingui/macro'

const Container = styled(Box)`
  overflow: auto;
  height: 100%;
`

export const Wrapper = styled(Box)`
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

interface IssueInfo {
  title: ReactNode
  content: ReactNode
  link: string | null
}

export const issues: Record<string, IssueInfo> = {}

const Banner = () => {
  const rtoken = useRToken()
  const [hidden, setHide] = useState(false)
  useEffect(() => {
    setHide(false)
  }, [rtoken])
  if (hidden || rtoken == null || issues[rtoken.address] == null) {
    return null
  }

  return (
    <Card
      sx={{
        backgroundColor: 'rBlueLight',
        border: '1px solid',
        borderColor: 'rBlue',
        borderRadius: '8px',
        flexWrap: 'wrap',
      }}
      p={3}
      m={3}
    >
      <Flex>
        <div>
          <Text variant="strong" mb={1}>
            {issues[rtoken.address].title}
          </Text>
          <Text>{issues[rtoken.address].content}</Text>
          {issues[rtoken.address].link && (
            <Text variant="strong">
              <Link variant="a" href={issues[rtoken.address].link!}>
                <Trans>Read more</Trans>
              </Link>
            </Text>
          )}
        </div>
        <Close onClick={() => setHide(true)} sx={{ cursor: 'pointer' }} />
      </Flex>
    </Card>
  )
}

/**
 * Application Layout
 *
 * @param children - required
 * @returns {JSX.Element}
 */
const Layout = ({ children }: { children: ReactNode }) => (
  <Container id="app-container">
    <TopSpacer />
    <Box>
      <Banner />
      {children}
    </Box>
    <BottomSpacer />
    <MobileNav />
    <TokenMenu />
    <Header />
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
