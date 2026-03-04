import { Trans } from '@lingui/macro'
import { Button } from '@/components/ui/button'
import HiperlinkIcon from 'components/icons/HiperlinkIcon'
import LayersIcon from 'components/icons/LayersIcon'
import { atom, useAtomValue } from 'jotai'
import Skeleton from 'react-loading-skeleton'
import { collateralsMetadataAtom } from 'state/cms/atoms'
import { rTokenCollateralDetailedAtom } from 'state/rtoken/atoms/rTokenBackingDistributionAtom'

interface PlatformDetails {
  name: string
  distribution: number
  website?: string
  description: string
  logo?: string
}

const dataAtom = atom((get) => {
  const metadata = get(collateralsMetadataAtom)
  const collaterals = get(rTokenCollateralDetailedAtom)

  if (!collaterals || !metadata) {
    return null
  }

  const platformDetails: Record<string, PlatformDetails> = {}

  for (const collateral of collaterals) {
    const meta = metadata[collateral.symbol.toLowerCase().replace('-vault', '')]

    if (meta?.protocol) {
      if (platformDetails[meta.protocol.name]) {
        platformDetails[meta.protocol.name].distribution +=
          collateral.distribution
      } else {
        platformDetails[meta.protocol.name] = {
          name: meta.protocol.name,
          distribution: collateral.distribution,
          website: meta.protocol.website,
          description: meta.protocol.description,
          logo: meta.protocol.logo,
        }
      }
    }
  }

  return Object.values(platformDetails)
})

const PlatformExposure = () => {
  const exposure = useAtomValue(dataAtom)

  return (
    <div className="bg-card rounded-3xl">
      <div className="flex items-center p-3 sm:p-4 border-b border-border">
        <LayersIcon color="currentColor" />
        <span className="ml-2 mr-auto  text-xl">
          <Trans>Underlying Platform Exposure</Trans>
        </span>
      </div>
      {!exposure && <Skeleton count={3} height={80} />}
      {exposure?.map((data) => (
        <div
          key={data.name}
          className="p-3 sm:p-4  border-b border-border last:border-b-0"
        >
          <div className="flex items-center">
            <img src={data.logo} className="w-6 h-auto" alt={data.name} />
            <span className="ml-2 text-primary font-semibold">
              {data.distribution.toFixed(2)}%
            </span>
            <span className="ml-1 font-semibold">{data.name}</span>
          </div>
          <p className="mt-3 text-legend">{data.description}</p>
          <div className="mt-3 flex items-center flex-wrap">
            <Button
              size="sm"
              variant="outline"
              className="border-2"
              onClick={() => window.open(data.website, '_blank')}
            >
              <div className="flex items-center">
                <HiperlinkIcon />
                <span className="ml-2">Website</span>
              </div>
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default PlatformExposure
