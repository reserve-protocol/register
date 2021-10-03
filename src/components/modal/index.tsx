import { Dialog } from '@reach/dialog'
import '@reach/dialog/styles.css'
import { Button } from 'theme-ui'

// import styled from '@emotion/styled'

export interface IModal {
  open?: boolean
  title?: string
  onClose(): void
  children: any
}

const Modal = ({ open = true, onClose, title, children }: IModal) => (
  <Dialog aria-label="Modal" isOpen={open} onDismiss={onClose}>
    <Button onClick={onClose} sx={{ marginLeft: 'auto' }}>
      <span aria-hidden>×</span>
    </Button>
    {/* {title && { title }} */}
    {children}
  </Dialog>
)

export default Modal
