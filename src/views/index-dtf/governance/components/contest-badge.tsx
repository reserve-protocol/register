import { Trans } from "@lingui/react/macro"
import { HandFist } from "lucide-react"

const ContestedBadge = () => (
  <div className='flex items-center gap-1 rounded-full bg-[#F08E35]/10 px-2 py-1 text-[#F08E35] text-xs'>
    <HandFist size={16} /> <span className='hidden sm:block'><Trans>Contested</Trans></span>
  </div>
)

export default ContestedBadge