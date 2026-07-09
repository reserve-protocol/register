import { Trans } from "@lingui/react/macro"
import { Rocket } from "lucide-react"

const OptimisticBadge = () => (
  <div className='flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-primary text-xs'>
    <Rocket size={16} /> <span className='hidden sm:block'><Trans>Fast</Trans></span>
  </div>
)

export default OptimisticBadge