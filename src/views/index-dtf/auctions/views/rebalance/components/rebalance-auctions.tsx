import { useAtomValue } from 'jotai'
import { rebalanceAuctionsAtom } from '../atoms'

const RebalanceAuctions = () => {
  const auctions = useAtomValue(rebalanceAuctionsAtom)

  console.log(auctions)

  return (
    <div className="bg-background p-4 rounded-3xl">
      <div className="flex ">
        <div>
          <h1 className="text-2xl">Auctions</h1>
        </div>
      </div>
      <div className="flex flex-col gap-4 mt-4">
        {auctions.length === 0 ? (
          <div className="text-center py-8 text-legend">
            No auctions available
          </div>
        ) : (
          auctions.map((auction) => (
            <div
              key={auction.id}
              className="bg-secondary/50 p-4 rounded-2xl border border-border/50"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium">
                  Auction #{auction.id.slice(0, 8)}...
                </h3>
                <div className="text-sm text-legend">
                  {new Date(
                    parseInt(auction.timestamp) * 1000
                  ).toLocaleDateString()}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <span className="text-sm text-legend">Start Time</span>
                  <div className="text-sm">
                    {new Date(
                      parseInt(auction.startTime) * 1000
                    ).toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-legend">End Time</span>
                  <div className="text-sm">
                    {new Date(
                      parseInt(auction.endTime) * 1000
                    ).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <span className="text-sm text-legend">Tokens</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {auction.tokens.map((token, index) => (
                    <div
                      key={token.address}
                      className="bg-background px-2 py-1 rounded-lg text-sm"
                    >
                      {token.symbol}
                    </div>
                  ))}
                </div>
              </div>

              {auction.bids.length > 0 && (
                <div>
                  <span className="text-sm text-legend">
                    Bids ({auction.bids.length})
                  </span>
                  <div className="mt-2 space-y-2">
                    {auction.bids.slice(0, 3).map((bid) => (
                      <div
                        key={bid.id}
                        className="bg-background p-2 rounded-lg text-sm"
                      >
                        <div className="flex justify-between items-center">
                          <span>
                            {bid.sellToken.symbol} → {bid.buyToken.symbol}
                          </span>
                          <span className="text-legend">
                            {bid.bidder.slice(0, 6)}...{bid.bidder.slice(-4)}
                          </span>
                        </div>
                      </div>
                    ))}
                    {auction.bids.length > 3 && (
                      <div className="text-center text-sm text-legend">
                        +{auction.bids.length - 3} more bids
                      </div>
                    )}
                  </div>
                </div>
              )}

              <details className="mt-3">
                <summary className="text-sm text-legend cursor-pointer hover:text-foreground transition-colors">
                  Raw Data
                </summary>
                <pre className="mt-2 p-3 bg-background rounded-lg text-xs overflow-auto max-h-64 text-foreground">
                  {JSON.stringify(auction, null, 2)}
                </pre>
              </details>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default RebalanceAuctions
