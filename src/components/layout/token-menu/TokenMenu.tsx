import styled from '@emotion/styled'
import useIsSidebarVisible from 'hooks/useIsSidebarVisible'
import { Box } from 'theme-ui'
import Navigation from '../navigation/index'

const Container = styled(Box)`
  flex-grow: 0;
  box-sizing: border-box;
  flex-direction: column;
  position: fixed;
  top: 72px;
  width: 100%;
  height: 72px;
`

/**
 * Application sidebar
 */
const TokenMenu = () => {
  if (!useIsSidebarVisible()) return null

  return (
    <Container
      sx={{
        flexShrink: 0,
        display: ['none', 'flex'],
        backgroundColor: 'background',
        borderBottom: '1px solid',
        borderColor: 'border',
      }}
    >
      <Navigation />
    </Container>
  )
}

export default TokenMenu
