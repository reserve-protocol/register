import { Trans } from '@lingui/macro'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import Sidebar from 'components/sidebar'
import { useAtom, useSetAtom } from 'jotai'
import { X } from 'lucide-react'
import { auctionSidebarAtom } from '../atoms'
import Revenue from './Revenue'

const Header = () => {
  const close = useSetAtom(auctionSidebarAtom)

  return (
    <div className="flex items-center shrink-0 px-4 sm:px-8 pt-4">
      <span className="text-xl font-bold mr-1">
        <Trans>Auctions</Trans>
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="ml-auto rounded-full"
        onClick={close}
      >
        <X />
      </Button>
    </div>
  )
}

const AuctionsSidebar = () => {
  const [isOpen, toggleSidebar] = useAtom(auctionSidebarAtom)

  if (!isOpen) {
    return null
  }

  return (
    <Sidebar onClose={toggleSidebar} width="600px" className="bg-background">
      <Header />
      <Separator className="mt-4 mb-0 -mx-6" />
      <Revenue />
    </Sidebar>
  )
}

export default AuctionsSidebar
