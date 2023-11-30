import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'react-feather'
import { Box, BoxProps, Button, Divider, Flex, Text } from 'theme-ui'

export interface ModalProps extends BoxProps {
  title?: string
  onClose?(): void // unclosable modal if this is not defined
  width?: string | number
}

const Overlay = (props: BoxProps) => (
  <Box
    {...props}
    sx={{
      position: 'fixed',
      right: 0,
      left: 0,
      bottom: 0,
      top: 0,
      overflow: 'auto',
      background: 'modalOverlay',
    }}
  />
)

const Dialog = ({ width = '420px', sx = {}, ...props }: ModalProps) => (
  <Box
    {...props}
    aria-label="Modal"
    sx={{
      backgroundColor: 'background',
      padding: 4,
      borderRadius: [0, '12px'],
      boxShadow: ['none', 'rgba(0, 0, 0, 0.2) 0px 24px 48px'],
      border: '2px solid',
      borderColor: 'darkBorder',
      position: 'absolute',
      left: [0, '50%'],
      top: [0, '50%'],
      right: [0, 'auto'],
      bottom: [0, 'auto'],
      overflow: 'hidden',
      transform: ['none', 'translate(-50%, -50%)'],
      width: ['auto', width],
      ...sx,
    }}
  />
)

const Header = ({ title, onClose }: ModalProps) => {
  if (!title && !onClose) {
    return null
  }

  return (
    <>
      <Flex
        mb={4}
        sx={{
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <Text variant="title">{title && title}</Text>
        {!!onClose && (
          <Button
            sx={{ position: 'absolute', right: 0 }}
            variant="circle"
            onClick={onClose}
          >
            <X />
          </Button>
        )}
      </Flex>
      {!!title && <Divider mx={-4} mb={4} sx={{ borderColor: 'darkBorder' }} />}
    </>
  )
}

const Modal = ({ children, ...props }: ModalProps) => {
  useEffect(() => {
    const keyDownHandler = (event: any) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        props.onClose?.()
      }
    }

    document.addEventListener('keydown', keyDownHandler)
    return () => {
      document.removeEventListener('keydown', keyDownHandler)
    }
  }, [])

  return createPortal(
    <Overlay>
      <Dialog {...props}>
        <Header {...props} />
        {children}
      </Dialog>
    </Overlay>,
    document.body
  )
}

export default Modal
