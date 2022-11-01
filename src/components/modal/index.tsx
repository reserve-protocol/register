import { Dialog, DialogOverlay } from '@reach/dialog'
import '@reach/dialog/styles.css'
import { Flex, Text, ButtonProps, Button, Divider } from 'theme-ui'
import { X } from 'react-feather'
import styled from '@emotion/styled'

export interface ModalProps {
  open?: boolean
  title?: string
  onClose?(): void
  children: any
  style?: any
}

const StyledDialog = styled((props: any) => <Dialog {...props} />)`
  &[data-reach-dialog-content] {
    width: 'auto';
    background-color: ${({ theme }) => theme.colors.contentBackground};
    padding: ${({ theme }) => theme.space[4]}px;
    position: relative;
    border-radius: 12px;
    box-shadow: ${({ theme }) => theme.strongBoxShadow};
  }
`
const Overlay = styled((props: any) => <DialogOverlay {...props} />)`
  && {
    background-color: ${({ theme }) => theme.colors.modalOverlay};
  }
`

const CloseButton = (props: ButtonProps) => (
  <Button {...props}>
    <X />
  </Button>
)

const Modal = ({
  open = true,
  onClose,
  title,
  children,
  style = {},
}: ModalProps) => (
  <Overlay>
    <StyledDialog
      aria-label="Modal"
      isOpen={open}
      onDismiss={onClose}
      style={style}
    >
      {(onClose || title) && (
        <>
          <Flex
            mb={4}
            sx={{
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <Text variant="sectionTitle">{title && title}</Text>
            {!!onClose && (
              <CloseButton
                sx={{ position: 'absolute', right: 0 }}
                variant="circle"
                onClick={onClose}
              />
            )}
          </Flex>
          {!!title && <Divider mx={-4} mb={4} />}
        </>
      )}
      {children}
    </StyledDialog>
  </Overlay>
)

export default Modal
