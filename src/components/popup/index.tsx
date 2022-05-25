import { Box } from 'theme-ui'
import styled from '@emotion/styled'
import Popover, { PopoverProps } from 'components/popover'

const Container = styled(Box)`
  background-color: ${({ theme }: { theme: any }) =>
    theme.colors.contentBackground};
  border: 2px solid var(--theme-ui-colors-border);
  border-radius: 10px;
`

const Popup = ({ content, ...props }: PopoverProps) => {
  return <Popover {...props} content={<Container>{content}</Container>} />
}

export default Popup
