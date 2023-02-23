import styled from '@emotion/styled'
import useIsSidebarVisible from 'hooks/useIsSidebarVisible'
import { atom, useAtom } from 'jotai'
import { Box } from 'theme-ui'
import Navigation from '../navigation/index'
import Footer from './Footer'

const Container = styled(Box)`
  padding-top: 0;
  flex-grow: 0;
  box-sizing: border-box;
  flex-direction: column;
  border-right: 1px solid var(--theme-ui-colors-border);
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
      sx={{
        flexBasis: isSidebarCollapsed ? 76 : [64, 72, 264],
        flexShrink: 0,
        display: ['none', 'flex'],
      }}
    >
      <Navigation collapsed={isSidebarCollapsed} />
      {!isSidebarCollapsed && (
        <Footer mt="auto" sx={{ display: ['none', 'none', 'block'] }} />
      )}
    </Container>
  )
}

export default Sidebar
