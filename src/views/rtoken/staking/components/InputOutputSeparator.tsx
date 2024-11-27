import { ArrowDown } from 'react-feather'
import { borderRadius } from 'theme'
import { Box, Divider } from 'theme-ui'

const InputOutputSeparator = () => (
  <Box variant="layout.verticalAlign">
    <Divider sx={{ flexGrow: 1, borderColor: 'borderSecondary' }} />
    <Box
      mx={4}
      my={2}
      p="1"
      pb="0"
      sx={{
        border: '1px solid',
        borderColor: 'borderSecondary',
        borderRadius: borderRadius.inputs,
      }}
    >
      <ArrowDown size={24} color="#666666" />
    </Box>
    <Divider sx={{ flexGrow: 1, borderColor: 'borderSecondary' }} />
  </Box>
)

export default InputOutputSeparator
