import { Box, Checkbox, Text } from 'theme-ui'
import { useZap } from '../context/ZapContext'

const ZapSettingsOnlyMint = () => {
  const { onlyMint, setOnlyMint } = useZap()

  return (
    <Box
      sx={{
        borderRadius: '8px',
        border: '1px solid',
        borderColor: 'borderFocused',
        backgroundColor: 'focusedBackground',
      }}
    >
      <label
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '12px',
          cursor: 'pointer',
        }}
      >
        <Box variant="layout.verticalAlign" sx={{ gap: '6px' }}>
          <Text>Force minting RTokens</Text>
        </Box>
        <Checkbox
          title="Force minting RTokens"
          onChange={() => setOnlyMint(!onlyMint)}
          checked={onlyMint}
        />
      </label>
    </Box>
  )
}

export default ZapSettingsOnlyMint
