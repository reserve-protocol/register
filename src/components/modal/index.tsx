import { Dialog } from '@reach/dialog'
import '@reach/dialog/styles.css'
import { Flex, Box } from 'theme-ui'
import { X } from 'react-feather'

// import styled from '@emotion/styled'

export interface IModal {
  open?: boolean
  title?: string
  onClose(): void
  children: any
}

const Modal = ({ open = true, onClose, title, children }: IModal) => (
  <Dialog aria-label="Modal" isOpen={open} onDismiss={onClose}>
    <Flex mb={4}>
      <Box sx={{ fontSize: 3 }}>{title && title}</Box>
      <Box
        role="button"
        sx={{ marginLeft: 'auto', '&:hover': { cursor: 'pointer' } }}
        onClick={onClose}
      >
        <X />
      </Box>
    </Flex>
    {children}
  </Dialog>
)

export default Modal
