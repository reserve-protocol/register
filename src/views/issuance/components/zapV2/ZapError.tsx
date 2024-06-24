import { ReactNode } from 'react'
import { Box, Text } from 'theme-ui'

export type ZapErrorType = {
  title: string
  message: ReactNode
  color: string
  secondaryColor: string
  submitButtonTitle?: string
  disableSubmit?: boolean
}

const ZapError = ({ error }: { error?: ZapErrorType }) => {
  if (!error) return null

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        borderRadius: 8,
        border: '1px solid',
        borderColor: error.secondaryColor,
        width: '100%',
        p: 3,
      }}
    >
      <Text
        color={error.color}
        sx={{ fontWeight: 700 }}
        data-testid="zap-error"
      >
        {error.title}
      </Text>
      <Text sx={{ fontSize: 14 }}>{error.message}</Text>
    </Box>
  )
}

export default ZapError
