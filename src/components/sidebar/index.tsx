import { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Box, BoxProps } from 'theme-ui'

interface Props extends BoxProps {
  onClose(): void
  width?: string
}

const Sidebar = ({
  onClose,
  width = '600',
  children,
  sx = {},
  ...props
}: Props) =>
  createPortal(
    <>
      <Box
        onClick={onClose}
        sx={(theme) => ({
          position: 'fixed',
          left: 0,
          top: 0,
          zIndex: 100000,
          opacity: '50%',
          width: '100vw',
          height: '100%',
          backgroundColor: theme.colors?.modalOverlay,
        })}
        {...props}
      />
      <Box
        sx={(theme) => ({
          flexDirection: 'column',
          zIndex: 100001,
          display: 'flex',
          position: 'absolute',
          maxWidth: ['100vw', '100vw', '840px'],
          width: ['100vw', '100vw', width],
          backgroundColor: 'background',
          right: 0,
          borderLeft: `solid 3px ${theme.colors?.border}`,
          boxShadow: '-32px 0px 64px rgba(0, 0, 0, 0.15)',
          top: 0,
          height: '100%',
          overflow: 'hidden',
          ...sx,
        })}
      >
        {children}
      </Box>
    </>,
    document.body
  )

export default Sidebar
