import { Box } from 'theme-ui'
import styled from '@emotion/styled'

/**
 * Wraps the page content
 *
 * @param {ReactNode} children
 * @returns
 */
const Container = styled(Box)`
  box-sizing: border-box;
  padding-left: 32px;
  padding-right: 32px;
`

export default Container
