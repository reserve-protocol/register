import { v1Typography as type } from '@/components/design-system-v1/typography'
import { Specimen } from './cell-specimens'
import { HOLDINGS } from './holdings-fixtures'
import {
  Allocation,
  Capitalization,
  HoldingIdentity,
  HoldingPerformance,
  type BridgeHandler,
} from './holdings-cells'

export function HoldingsSpecimens({ onBridge }: { onBridge: BridgeHandler }) {
  const asset = HOLDINGS.cmc20[0]
  return (
    <div className="space-y-4">
      <p className={`${type.supporting} text-supporting-foreground`}>
        Additional cell examples — each tile is independent. The two-source
        identity is a synthetic grouping example.
      </p>
      <div
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        data-testid="holdings-cells"
      >
        <Specimen label="Underlying asset · grouped sources">
          <HoldingIdentity
            row={{ ...asset, sources: 2 }}
            tab="exposure"
            onBridge={onBridge}
          />
        </Specimen>
        <Specimen label="Stock · exchange-qualified symbol">
          <HoldingIdentity
            row={HOLDINGS.photon[0]}
            tab="exposure"
            onBridge={onBridge}
          />
        </Specimen>
        <Specimen label="Held token · explorer and bridge">
          <HoldingIdentity row={asset} tab="collateral" onBridge={onBridge} />
        </Specimen>
        <Specimen label="Allocation · zero, small and large">
          <Allocation value={0} />
          <Allocation value={0.01} />
          <Allocation value={asset.weight} />
        </Specimen>
        <Specimen label="Performance · newly added asset">
          <HoldingPerformance row={{ ...asset, newlyAdded: true }} />
        </Specimen>
        <Specimen label="Market cap · underlying vs held token">
          <div className="flex w-full justify-between gap-6">
            <div className="space-y-1">
              <p className={`${type.supporting} text-supporting-foreground`}>
                Underlying
              </p>
              <Capitalization value={asset.exposureCap} />
            </div>
            <div className="space-y-1 text-right">
              <p className={`${type.supporting} text-supporting-foreground`}>
                Held token
              </p>
              <Capitalization value={asset.marketCap} />
            </div>
          </div>
        </Specimen>
      </div>
    </div>
  )
}
