import { Box } from 'theme-ui'
import styled from '@emotion/styled'

/**
 * Wraps the page content
 *
 * @param {ReactNode} children
 * @returns
 */
const Container = styled(Box)`
  height: calc(100vh - 108px);
  overflow: auto;
  box-sizing: border-box;
  padding-left: 30px;
  padding-right: 30px;
`

export default Container
