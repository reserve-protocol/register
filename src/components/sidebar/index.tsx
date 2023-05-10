import Portal from '@reach/portal'
import { ReactNode } from 'react'
import { Box } from 'theme-ui'

const Sidebar = ({
  onClose,
  width = '60vw',
  children,
}: {
  onClose(): void
  children: ReactNode
  width?: string
}) => (
  <Portal>
    <Box
      onClick={onClose}
      sx={(theme: any) => ({
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 100000,
        opacity: '50%',
        width: '100vw',
        height: '100%',
        backgroundColor: theme.colors.modalOverlay,
      })}
    />
    <Box
      sx={(theme: any) => ({
        flexDirection: 'column',
        zIndex: 100001,
        display: 'flex',
        position: 'absolute',
        maxWidth: ['100vw', '840px'],
        width: ['100vw', '100vw', width],
        backgroundColor: 'background',
        right: 0,
        borderLeft: `solid 3px ${theme.colors.border}`,
        boxShadow: '-32px 0px 64px rgba(0, 0, 0, 0.15)',
        top: 0,
        height: '100%',
      })}
    >
      {children}
    </Box>
  </Portal>
)

export default Sidebar
