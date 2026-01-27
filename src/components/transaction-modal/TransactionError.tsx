import { Button } from '@/components/ui/button'

const TransactionError = ({
  onClose,
  title,
  subtitle,
}: {
  onClose(): void
  title?: string
  subtitle?: string
}) => (
  <>
    {/* Overlay */}
    <div className="absolute inset-0 bg-background/95 z-[9999] rounded-2xl" />
    {/* Content */}
    <div className="absolute inset-0 z-[99999] flex flex-col items-center justify-center rounded-2xl">
      <p className="text-xl font-medium mb-2">{title}</p>
      <div className="relative text-xs break-words p-6">
        <code className="text-muted-foreground mb-4 block">{subtitle}</code>
      </div>
      <Button onClick={onClose} className="px-6">
        Dismiss
      </Button>
    </div>
  </>
)

export default TransactionError
