import { Box, Text } from 'theme-ui'
import { useZap } from './context/ZapContext'

const ZapError = () => {
  const { error } = useZap()

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
      <Text variant="title" color={error.color} sx={{ fontWeight: 700 }}>
        {error.title}
      </Text>
      <Text>{error.message}</Text>
    </Box>
  )
}

export default ZapError
