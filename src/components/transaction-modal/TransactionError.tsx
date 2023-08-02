import ModalAlert from 'components/modal/ModalAlert'
import { Box, Text } from 'theme-ui'

const TransactionError = ({
  onClose,
  title,
  subtitle,
}: {
  onClose(): void
  title?: string
  subtitle?: string
}) => (
  <ModalAlert onClose={onClose}>
    <Text mb={2} variant="title">
      {title}
    </Text>
    <Box
      sx={{ position: 'relative', fontSize: 0, wordBreak: 'break-word' }}
      p={4}
    >
      <Text mb={4} as="code" variant="legend">
        {subtitle}
      </Text>
    </Box>
  </ModalAlert>
)

export default TransactionError
