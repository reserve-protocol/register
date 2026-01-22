import { Trans } from '@lingui/macro'
import { useAtom, useAtomValue } from 'jotai'
import { rTokenAssetsAtom } from 'state/atoms'
import { rtokenAllActiveCollateralsAtom } from 'components/rtoken-setup/atoms'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import UnregisterEdit from './UnregisterEdit'
import { unregisterAssetsAtom } from '../atoms'
import useRToken from 'hooks/useRToken'

interface UnregisterProposalProps {
  className?: string
}

const UnregisterProposal = ({ className }: UnregisterProposalProps) => {
  const rToken = useRToken()
  const registeredErc20s = useAtomValue(rTokenAssetsAtom)
  const [assetsToUnregister, setAssetsToUnregister] =
    useAtom(unregisterAssetsAtom)

  const registeredAssets = Object.values(registeredErc20s || {}).map(
    (asset) => asset.address
  )
  const usedAssets = useAtomValue(rtokenAllActiveCollateralsAtom)

  const unusedAssets = registeredAssets.filter(
    (x) => !usedAssets.includes(x) && !assetsToUnregister.includes(x)
  )

  if (!unusedAssets.length) return null
  const handleAssetRemoval = (asset: string) => {
    setAssetsToUnregister(assetsToUnregister.concat(asset))
  }

  return (
    <Card className={`p-6 ${className || ''}`}>
      <span className="text-lg font-semibold">
        <Trans>Unregister Assets</Trans>
      </span>
      <Separator className="my-6 -mx-6 w-[calc(100%+3rem)]" />
      <UnregisterEdit addresses={unusedAssets} onChange={handleAssetRemoval} />
      <Separator className="my-6 -mx-6 w-[calc(100%+3rem)] bg-border-dark" />
      <span className="text-legend text-xs mb-1 mr-2">
        <Trans>
          Ensure that the asset(s) you are unregistering do not have pending
          revenue that can be
        </Trans>{' '}
        <a
          href={`#/auctions?token=${rToken?.address}`}
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          <Trans> auctioned</Trans>
        </a>
        .
      </span>
    </Card>
  )
}

export default UnregisterProposal
