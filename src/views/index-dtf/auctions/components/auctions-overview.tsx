import SubmitAuctionsButton from './submit-auctions-button'

const AuctionOverview = () => {
  return (
    <div className="flex flex-col gap-2 p-2 bg-secondary rounded-3xl h-fit">
      <div className="bg-card p-2 rounded-xl">
        <SubmitAuctionsButton />
      </div>

      <p className="text-sm text-muted-foreground">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
      </p>
    </div>
  )
}

export default AuctionOverview
