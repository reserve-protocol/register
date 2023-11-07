import styled from '@emotion/styled'
import useIsSidebarVisible from 'hooks/useIsSidebarVisible'
import { ReactNode, useEffect, useState } from 'react'
import { Box, Card, Close, Flex, Link, Text } from 'theme-ui'
import Header from './header'
import MobileNav from './navigation/MobileNav'
import TokenMenu from './token-menu'
import useRToken from 'hooks/useRToken'
import { Trans } from '@lingui/macro'

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

interface IssueInfo {
  title: ReactNode
  content: ReactNode
  link: string | null
}

export const issues: Record<string, IssueInfo> = {
  '0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F': {
    title: <Trans>Temporary zapper issue</Trans>,
    content: (
      <Trans>
        Aave has temporarily paused certain markets, so the collateral plugin
        for Morpho Aave does not work with the Zap temporarily. The Zap will
        resume working once Aave has reenabled the paused markets.
      </Trans>
    ),
    link: 'https://governance.aave.com/t/aave-v2-v3-security-incident-04-11-2023/15335',
  },
  '0xaCdf0DBA4B9839b96221a8487e9ca660a48212be': {
    title: <Trans>Temporary zapper issue</Trans>,
    content: (
      <Trans>
        Aave has temporarily paused certain markets, so the collateral plugin
        for Morpho Aave does not work with the Zap temporarily. The Zap will
        resume working once Aave has reenabled the paused markets.
      </Trans>
    ),
    link: 'https://governance.aave.com/t/aave-v2-v3-security-incident-04-11-2023/15335',
  },
}
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
    <Card p={3} m={3}>
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
    <Wrapper>
      <TopSpacer />
      <Box>
        <Banner />
        {children}
      </Box>
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
