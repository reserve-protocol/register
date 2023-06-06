import ModalAlert from 'components/modal/ModalAlert'
import { Text } from 'theme-ui'

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
    <Text mb={4} variant="legend">
      {subtitle}
    </Text>
  </ModalAlert>
)

export default TransactionError
