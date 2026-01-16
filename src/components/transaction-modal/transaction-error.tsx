import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle, X } from 'lucide-react'

const TransactionError = ({
  onClose,
  title,
  subtitle,
}: {
  onClose(): void
  title?: string
  subtitle?: string
}) => (
  <Alert variant="destructive" className="relative">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>{title}</AlertTitle>
    <AlertDescription className="text-xs break-words max-h-24 overflow-auto">
      <code>{subtitle}</code>
    </AlertDescription>
    <Button
      variant="ghost"
      size="icon"
      className="absolute right-2 top-2 h-6 w-6"
      onClick={onClose}
    >
      <X className="h-4 w-4" />
    </Button>
  </Alert>
)

export default TransactionError
