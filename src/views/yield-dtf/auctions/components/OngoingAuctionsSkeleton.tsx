import useRToken from 'hooks/useRToken'
import { useSetAtom } from 'jotai'
import { auctionSidebarAtom } from '../atoms'

const OngoingAuctionsSkeleton = () => {
  const rToken = useRToken()
  const setSidebar = useSetAtom(auctionSidebarAtom)

  return (
    <div className="border border-dashed border-border text-center rounded-2xl p-6">
      <span className="text-legend">
        No ongoing {rToken?.symbol ?? 'rtoken'}-related auctions. Check for
        available auctions/unrealized revenue{' '}
        <button
          onClick={() => setSidebar()}
          className="underline text-foreground hover:text-primary"
        >
          here
        </button>{' '}
        if you want to poke the protocol to start the next auction.
      </span>
    </div>
  )
}

export default OngoingAuctionsSkeleton
