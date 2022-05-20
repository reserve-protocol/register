import { Dialog } from '@reach/dialog'
import '@reach/dialog/styles.css'
import { Flex, Box, Text } from 'theme-ui'
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
    background-color: ${({ theme }) => theme.colors.bgCard};
    padding: ${({ theme }) => theme.space[3]}px;
    position: relative;
    border-radius: 14px;
  }
`

const Modal = ({
  open = true,
  onClose,
  title,
  children,
  style = {},
}: ModalProps) => (
  <StyledDialog
    aria-label="Modal"
    isOpen={open}
    onDismiss={onClose}
    style={style}
  >
    {(onClose || title) && (
      <Flex
        mb={3}
        sx={{
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text sx={{ fontSize: 20, fontWeight: 'bold' }}>{title && title}</Text>
        {!!onClose && (
          <Box
            role="button"
            sx={{
              position: 'absolute',
              top: 20,
              right: 20,
              '&:hover': { cursor: 'pointer' },
            }}
            onClick={onClose}
          >
            <X />
          </Box>
        )}
      </Flex>
    )}
    {children}
  </StyledDialog>
)

export default Modal
