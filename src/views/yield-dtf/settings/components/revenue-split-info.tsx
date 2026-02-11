import { t } from '@lingui/macro'
import GoTo from '@/components/go-to'
import { useAtomValue } from 'jotai'
import { chainIdAtom, rTokenRevenueSplitAtom } from '@/state/atoms'
import { shortenAddress } from '@/utils'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { InfoCard, InfoCardItem } from './settings-info-card'

const RevenueSplitInfo = () => {
  const distribution = useAtomValue(rTokenRevenueSplitAtom)
  const chainId = useAtomValue(chainIdAtom)

  return (
    <InfoCard title={t`Revenue Distribution`}>
      <InfoCardItem
        label="% to"
        value={t`RToken holders`}
        right={<span className="font-semibold">{distribution?.holders || 0}%</span>}
        border={false}
      />
      <InfoCardItem
        label="% to"
        value={t`RSR Stakers`}
        right={<span className="font-semibold">{distribution?.stakers || 0}%</span>}
      />
      {!!distribution &&
        distribution.external.map((dist) => (
          <div key={dist.address}>
            <InfoCardItem
              label={t`% to external address`}
              value={
                <div className="flex items-center">
                  <span className="mr-2">{shortenAddress(dist.address)}</span>
                  <GoTo
                    href={getExplorerLink(
                      dist.address,
                      chainId,
                      ExplorerDataType.ADDRESS
                    )}
                  />
                </div>
              }
              right={<span className="font-semibold">{dist.total}%</span>}
            />
            <div className="ml-4 pb-4 px-4">
              <span className="text-legend">RToken/RSR split:</span>{' '}
              <span>
                {dist.holders}/{dist.stakers}
              </span>
            </div>
          </div>
        ))}
    </InfoCard>
  )
}

export default RevenueSplitInfo
