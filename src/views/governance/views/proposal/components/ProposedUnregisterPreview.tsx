import { t } from '@lingui/macro'
import { useAtom } from 'jotai'
import { BoxProps } from 'theme-ui'
import { shortenAddress } from 'utils'
import { unregisterAssetsAtom } from '../atoms'
import { ListChangePreview } from './ItemPreview'
import PreviewBox from './PreviewBox'

const ProposedUnregisterPreview = (props: BoxProps) => {
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
      variant="layout.borderBox"
      count={assetsToUnregister.length}
      title={t`Unregistering assets`}
      {...props}
    >
      {assetsToUnregister.map((asset) => (
        <ListChangePreview
          key={asset}
          onRevert={() => handleRevert(asset)}
          isNew={false}
          value={shortenAddress(asset)}
          mt={3}
        />
      ))}
    </PreviewBox>
  )
}

export default ProposedUnregisterPreview
