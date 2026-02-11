import { t } from '@lingui/macro'
import { useAtom } from 'jotai'
import { cn } from '@/lib/utils'
import { shortenAddress } from 'utils'
import { unregisterAssetsAtom } from '../atoms'
import { ListChangePreview } from './ItemPreview'
import PreviewBox from './PreviewBox'

interface Props {
  className?: string
}

const ProposedUnregisterPreview = ({ className }: Props) => {
  const [assetsToUnregister, setAssetsToUnregister] =
    useAtom(unregisterAssetsAtom)

  if (!assetsToUnregister.length) {
    return null
  }

  const handleRevert = (asset: string) => {
    setAssetsToUnregister(assetsToUnregister.filter((x) => x !== asset))
  }

  return (
    <PreviewBox
      className={cn('border border-border rounded-xl p-6', className)}
      count={assetsToUnregister.length}
      title={t`Unregistering assets`}
    >
      {assetsToUnregister.map((asset) => (
        <ListChangePreview
          key={asset}
          onRevert={() => handleRevert(asset)}
          isNew={false}
          value={shortenAddress(asset)}
          className="mt-4"
        />
      ))}
    </PreviewBox>
  )
}

export default ProposedUnregisterPreview
