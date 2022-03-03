import { Dialog } from '@reach/dialog'
import '@reach/dialog/styles.css'
import { Flex, Box } from 'theme-ui'
import { X } from 'react-feather'
import styled from '@emotion/styled'

export interface IModal {
  open?: boolean
  title?: string
  onClose?(): void
  children: any
}

const StyledDialog = styled((props: any) => <Dialog {...props} />)`
  &[data-reach-dialog-content] {
    background-color: ${({ theme }) => theme.colors.bgCard};
    padding: ${({ theme }) => theme.space[3]}px;
  }
`

const Modal = ({ open = true, onClose, title, children }: IModal) => (
  <StyledDialog aria-label="Modal" isOpen={open} onDismiss={onClose}>
    <Flex mb={3} sx={{ alignItems: 'center' }}>
      <Box sx={{ fontSize: 2 }}>{title && title}</Box>
      {!!onClose && (
        <Box
          role="button"
          sx={{ marginLeft: 'auto', '&:hover': { cursor: 'pointer' } }}
          onClick={onClose}
        >
          <X />
        </Box>
      )}
    </Flex>
    {children}
  </StyledDialog>
)

export default Modal
