import { Box } from 'theme-ui'
import styled from '@emotion/styled'
import Popover, { PopoverProps } from 'components/popover'

const Container = styled(Box)`
  background-color: ${({ theme }: { theme: any }) =>
    theme.colors.contentBackground};
  border: 1px solid var(--theme-ui-colors-invertedText);
  border-radius: 14px;
  box-shadow: 0px 10px 25px rgba(0, 0, 0, 0.2);
`

const Popup = ({ content, ...props }: PopoverProps) => {
  return <Popover {...props} content={<Container>{content}</Container>} />
}

export default Popup
