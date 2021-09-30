import { Dialog, DialogOverlay, DialogContent } from '@reach/dialog'
// import styled from '@emotion/styled'
import { Button } from 'theme-ui'
import '@reach/dialog/styles.css'

export interface IModal {
  open?: boolean
  title?: string
  onClose(): void
  children: any
}

const Modal = ({ open = true, onClose, title, children }: IModal) => {
  console.log('modal')
  return (
    <Dialog isOpen={open} onDismiss={onClose}>
      <Button onClick={onClose}>
        <span aria-hidden>×</span>
      </Button>
      {title && { title }}
      {children}
    </Dialog>
  )
}

export default Modal
