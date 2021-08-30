import { Box } from 'rebass'
import styled from 'styled-components'

/**
 * Wraps the page content
 *
 * @param {ReactNode} children
 * @returns
 */
export default styled(Box)`
  max-width: 1024px;
  margin-left: auto !important;
  margin-right: auto !important;
  padding: 0 30px;
`
