import { useRef } from 'react'
import { Box } from 'theme-ui'
import styled from '@emotion/styled'
import Popover, { PopoverProps } from 'components/popover'

const Container = styled(Box)`
  background-color: ${({ theme }: { theme: any }) =>
    theme.colors.contentBackground};
  border: 1px solid black;
  border-radius: 4px;
`

const Popup = ({ content, ...props }: PopoverProps) => {
  const ref = useRef()

  return <Popover {...props} content={<Container>{content}</Container>} />
}

export default Popup
