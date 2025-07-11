import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import useZapHealthcheck from '@/hooks/use-zap-healthcheck'
import { useAtomValue } from 'jotai'
import { chainIdAtom } from '@/state/atoms'
import Help from '@/components/ui/help'

const ZapHealthcheck = ({ className }: { className?: string }) => {
  const chainId = useAtomValue(chainIdAtom)
  const status = useZapHealthcheck(chainId)

  if (status) return null

  return (
    <Alert
      variant="warning"
      className={cn('bg-warning/10 border-warning/20 rounded-xl', className)}
    >
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 flex-shrink-0 text-warning" />
        <AlertDescription className="text-warning">
          Zaps are currently experiencing issues
        </AlertDescription>
        <Help
          className="ml-auto"
          content="Please try refreshing, or switch to manual minting."
        />
      </div>
    </Alert>
  )
}

export default ZapHealthcheck
