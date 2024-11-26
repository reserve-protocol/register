import { Box, Checkbox, Text } from 'theme-ui'
import { useZap } from '../context/ZapContext'

const ZapSettingsCollectDust = () => {
  const { collectDust, setCollectDust } = useZap()

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
          <Text>Send dust back to wallet</Text>
        </Box>
        <Checkbox
          title="Collect dust"
          onChange={() => setCollectDust(!collectDust)}
          checked={collectDust}
          disabled // We will always send dust back to wallet
          sx={{
            fill: 'muted',
          }}
        />
      </label>
    </Box>
  )
}

export default ZapSettingsCollectDust
