import { forwardRef, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { Box, BoxProps, Button, Divider, Flex, Text } from 'theme-ui'

export interface ModalProps extends BoxProps {
  title?: string
  onClose?(): void // unclosable modal if this is not defined
  width?: string | number
  closeOnClickAway?: boolean
  titleProps?: any
  hideCloseButton?: boolean
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
      zIndex: 1,
      overflow: 'auto',
      background: 'modalOverlay',
    }}
  />
)

const Dialog = forwardRef<HTMLDivElement, ModalProps>(
  ({ width = '420px', sx = {}, ...props }, ref) => (
    <Box
      ref={ref}
      {...props}
      aria-label="Modal"
      sx={{
        backgroundColor: 'backgroundNested',
        padding: 4,
        borderRadius: [0, '12px'],
        boxShadow: ['none', 'rgba(0, 0, 0, 0.2) 0px 24px 48px'],
        border: '3px solid',
        borderColor: 'borderFocused',
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
)

const Header = ({
  title,
  onClose,
  titleProps = {},
  hideCloseButton,
}: ModalProps) => {
  if ((!title && !onClose) || hideCloseButton) {
    return null
  }

  return (
    <>
      <Flex
        mb={!!title ? 4 : 0}
        sx={{
          alignItems: 'center',
          position: 'relative',
        }}
      >
        <Text variant="title" sx={{ fontWeight: 700 }} {...titleProps}>
          {title && title}
        </Text>
        {!!onClose && (
          <Button
            sx={{ position: 'absolute', right: 0, top: 0 }}
            variant="circle"
            onClick={onClose}
          >
            <X />
          </Button>
        )}
      </Flex>
    </>
  )
}

const Modal = ({
  children,
  closeOnClickAway = false,
  hideCloseButton = false,
  ...props
}: ModalProps) => {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const keyDownHandler = (event: any) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        props.onClose?.()
      }
    }

    const handleClickOutside = (event: any) => {
      if (
        closeOnClickAway &&
        dialogRef.current &&
        !dialogRef.current.contains(event.target)
      ) {
        props.onClose?.()
      }
    }

    document.addEventListener('keydown', keyDownHandler)
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('keydown', keyDownHandler)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [closeOnClickAway])

  return createPortal(
    <Overlay>
      <Dialog {...props} ref={dialogRef}>
        <Header {...props} hideCloseButton={hideCloseButton} />
        {children}
      </Dialog>
    </Overlay>,
    document.body
  )
}

export default Modal
