import { AlertTriangle } from 'lucide-react'
import { useContext } from 'react'
import { CowbotContext } from './cowbot-widget'

const CowbotWarningBanner = () => {
  const context = useContext(CowbotContext)

  if (!context) return null

  const isActive =
    context.status === 'running' || context.status === 'initializing'

  if (!isActive) return null

  return (
    <div className="bg-destructive text-destructive-foreground px-4 py-2.5 flex items-center justify-center gap-2 text-sm font-medium rounded-2xl mt-4">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      Do not close this tab while an auction is in progress
    </div>
  )
}

export default CowbotWarningBanner
