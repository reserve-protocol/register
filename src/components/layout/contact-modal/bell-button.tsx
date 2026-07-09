import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  CALENDLY_URL,
  isCallScheduled,
  markCallScheduled,
} from '@/utils/schedule-call'
import { Trans, useLingui } from '@lingui/react/macro'
import { Bell } from 'lucide-react'
import mixpanel from 'mixpanel-browser/src/loaders/loader-module-core'
import { useState } from 'react'
import { useContactCriteria } from './use-criteria'

const ContactBellButton = () => {
  const { wallet, criteriaMet } = useContactCriteria()
  const [popoverOpen, setPopoverOpen] = useState(false)
  const { t } = useLingui()

  if (!criteriaMet || isCallScheduled(wallet)) return null

  const handleSchedule = () => {
    mixpanel.track('contact_us_modal_click', {
      action: 'scheduled',
      source: 'bell',
      wallet,
    })
    markCallScheduled(wallet)
    setPopoverOpen(false)
  }

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={t`Talk to the Reserve team`}
          className="relative inline-flex items-center justify-center h-9 w-9 border rounded-full cursor-pointer hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Bell size={16} strokeWidth={1.5} />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-red-500 ring-2 ring-background" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 space-y-2">
        <p className="font-semibold">
          <Trans>Talk to the team</Trans>
        </p>
        <p className="text-sm text-legend">
          <Trans>
            As a larger holder you get a direct line to the team behind Reserve.
            Schedule an intro call.
          </Trans>
        </p>
        <Button asChild size="sm" className="w-full">
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noreferrer"
            onClick={handleSchedule}
          >
            <Trans>Schedule a meeting</Trans>
          </a>
        </Button>
      </PopoverContent>
    </Popover>
  )
}

export default ContactBellButton
