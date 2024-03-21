import { Box, Text } from 'theme-ui'
import { ZapErrorType } from './context/ZapContext'

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
      <Text color={error.color} sx={{ fontWeight: 700 }}>
        {error.title}
      </Text>
      <Text sx={{ fontSize: 14 }}>{error.message}</Text>
    </Box>
  )
}

export default ZapError
