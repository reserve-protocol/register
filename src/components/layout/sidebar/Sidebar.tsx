import styled from '@emotion/styled'
import useIsSidebarVisible from 'hooks/useIsSidebarVisible'
import { atom, useAtom } from 'jotai'
import { Box, Divider } from 'theme-ui'
import Navigation from '../navigation/index'
import Footer from './Footer'

const Container = styled(Box)`
  padding-top: 0;
  flex-grow: 0;
  box-sizing: border-box;
  flex-direction: column;
  margin-bottom: 0;
`

export const sidebarToggleAtom = atom(false)

/**
 * Application sidebar
 */
const Sidebar = () => {
  const [isSidebarCollapsed, toggleSidebar] = useAtom(sidebarToggleAtom)
  const isVisible = useIsSidebarVisible()

  if (!isVisible) {
    return null
  }

  const handleToggle = () => {
    toggleSidebar(!isSidebarCollapsed)
  }

  return (
    <Container
      px={3}
      sx={{
        flexShrink: 0,
        display: ['none', 'flex'],
      }}
    >
      <Navigation collapsed={isSidebarCollapsed} />
      <Divider my={0} mx={-3} />
    </Container>
  )
}

export default Sidebar
