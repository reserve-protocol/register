import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Sparkles, X } from 'lucide-react'
import { useAtom } from 'jotai'
import { contactModalOpenAtom } from './atoms'
import { useContactDismissal } from './use-contact-dismissal'
import { useContactCriteria } from './use-criteria'

const CALENDLY_URL =
  'https://calendly.com/d/cycf-7kz-xjv/reserve-customer-discovery?from=slack'

const ContactModal = () => {
  const [open, setOpen] = useAtom(contactModalOpenAtom)
  const { wallet } = useContactCriteria()
  const { dismiss } = useContactDismissal(wallet)

  const handleOpenChange = (next: boolean) => {
    if (!next) dismiss()
    setOpen(next)
  }

  const handleSchedule = () => {
    dismiss()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showClose={false}
        className="w-[400px] max-w-[400px] p-0 gap-0 overflow-hidden rounded-lg border border-[#f8edda] shadow-[4px_5px_35px_4px_rgba(0,0,0,0.1)] bg-white"
      >
        <DialogTitle className="sr-only">Earn 100,000 RSR</DialogTitle>
        <DialogDescription className="sr-only">
          Schedule a call with our team and tell us what you think about DTFs
          to earn 100,000 RSR.
        </DialogDescription>
        <div className="relative h-[187px] w-full bg-[#0151af] overflow-hidden">
          <img
            src="/imgs/contact-hero.webp"
            alt=""
            className="absolute left-1/2 top-[calc(50%+132.5px)] -translate-x-1/2 -translate-y-1/2 w-[412px] h-[504px] max-w-none"
          />
          <div className="absolute inset-x-4 top-4 flex items-center justify-between">
            <span className="flex items-center gap-1 bg-white rounded-full h-8 px-2 text-sm font-medium text-[#0151af]">
              <Sparkles size={16} strokeWidth={1.5} />
              Bounty
            </span>
            <DialogClose className="flex items-center justify-center h-8 w-8 bg-white border border-border rounded-xl cursor-pointer">
              <X size={16} strokeWidth={1.5} className="text-foreground" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </div>
        </div>
        <div className="flex flex-col gap-6 px-4 pb-4 pt-6">
          <div className="flex flex-col gap-1.5">
            <h3 className="text-[20px] leading-[23px] font-bold text-[#0151af]">
              Earn 100,000 RSR
            </h3>
            <p className="text-base leading-[1.39] text-foreground">
              We want to talk to you! Schedule a call with our team and tell us
              what you think about DTFs. That's it!
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Button
              asChild
              variant="none"
              className="h-[50px] w-full rounded-xl border border-border bg-[rgba(1,81,175,0.1)] text-[#0151af] text-sm font-medium shadow-[0_4px_33px_rgba(66,61,43,0.03)]"
            >
              <a
                href={CALENDLY_URL}
                target="_blank"
                rel="noreferrer"
                onClick={handleSchedule}
              >
                Schedule a meeting
              </a>
            </Button>
            <p className="text-xs leading-[18px] text-legend">
              We will only use your information to schedule a call for feedback.
              We will not send you any promotional materials.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ContactModal
