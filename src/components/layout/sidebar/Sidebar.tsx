import styled from '@emotion/styled'
import useIsSidebarVisible from 'hooks/useIsSidebarVisible'
import { Box } from 'theme-ui'
import Navigation from '../navigation'
import Footer from './Footer'

const Container = styled(Box)`
  padding-top: 0;
  flex-grow: 0;
  box-sizing: border-box;
  flex-direction: column;
  border-right: 1px solid var(--theme-ui-colors-darkBorder);
`

/**
 * Application sidebar
 */
const Sidebar = () => {
  const isVisible = useIsSidebarVisible()

  if (!isVisible) {
    return null
  }

  return (
    <Container
      sx={{
        flexBasis: [64, 72, 264],
        flexShrink: 0,
        display: ['none', 'flex'],
      }}
    >
      <Navigation />
      <Footer mt="auto" sx={{ display: ['none', 'none', 'block'] }} />
    </Container>
  )
}

export default Sidebar
