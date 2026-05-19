import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useSetAtom } from 'jotai'
import { Bell } from 'lucide-react'
import { useState } from 'react'
import { contactModalOpenAtom } from './atoms'
import { useContactCriteria } from './use-criteria'

const ContactBellButton = () => {
  const { criteriaMet } = useContactCriteria()
  const setModalOpen = useSetAtom(contactModalOpenAtom)
  const [popoverOpen, setPopoverOpen] = useState(false)

  if (!criteriaMet) return null

  const handleViewDetails = () => {
    setModalOpen(true)
    setPopoverOpen(false)
  }

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Available opportunity"
          className="relative inline-flex items-center justify-center h-8 w-8 rounded-md cursor-pointer hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Bell size={16} strokeWidth={1.5} />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-red-500 ring-2 ring-background" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-60 space-y-2">
        <p className="font-semibold">Available opportunity!</p>
        <p className="text-sm text-legend">
          Schedule a call to earn 100,000 RSR.
        </p>
        <Button size="sm" className="w-full" onClick={handleViewDetails}>
          View details
        </Button>
      </PopoverContent>
    </Popover>
  )
}

export default ContactBellButton
