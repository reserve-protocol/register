import InactiveBadge from '@/components/inactive-badge'
import { useDeprecatedAddresses } from '@/hooks/use-dtf-status'
import { cn } from '@/lib/utils'

const InactiveTag = ({
  address,
  className,
}: {
  address?: string
  className?: string
}) => {
  const inactive = useDeprecatedAddresses()

  if (!address || !inactive.has(address.toLowerCase())) return null

  return (
    <InactiveBadge className={cn('shrink-0 whitespace-nowrap', className)} />
  )
}

export default InactiveTag
