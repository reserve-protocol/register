import { Box, Button, Flex } from 'theme-ui'

const ModalAlert = ({
  onClose,
  children,
}: {
  children: any
  onClose?(): void
  title?: string
  subtitle?: string
}) => {
  return (
    <>
      <Box
        sx={{
          opacity: '95%',
          backgroundColor: 'background',
          position: 'absolute',
          height: '100%',
          width: '100%',
          top: 0,
          left: 0,
          zIndex: 9999,
          borderRadius: 16,
        }}
      />
      <Flex
        sx={{
          position: 'absolute',
          height: '100%',
          width: '100%',
          top: 0,
          left: 0,
          zIndex: 99999,
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          borderRadius: 16,
        }}
      >
        {children}
        {!!onClose && (
          <Button px={4} onClick={onClose}>
            Dismiss
          </Button>
        )}
      </Flex>
    </>
  )
}

export default ModalAlert
