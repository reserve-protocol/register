import styled from '@emotion/styled'
import { Box, Divider } from 'theme-ui'
import Navigation from '../navigation/index'
import useRToken from 'hooks/useRToken'
import useIsSidebarVisible from 'hooks/useIsSidebarVisible'

const Container = styled(Box)`
  flex-grow: 0;
  box-sizing: border-box;
  flex-direction: column;
  position: fixed;
  top: 72px;
  width: 100%;
  max-width: 95em;
  /* z-index: 10; */
  height: 72px;
`

/**
 * Application sidebar
 */
const TokenMenu = () => {
  const isVisible = useIsSidebarVisible()

  if (!isVisible) return null

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
