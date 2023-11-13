import { t } from '@lingui/macro'
import { useAtom } from 'jotai'
import { BoxProps } from 'theme-ui'
import { shortenAddress } from 'utils'
import { registerAssetsAtom } from '../atoms'
import { ListChangePreview } from './ItemPreview'
import PreviewBox from './PreviewBox'

const ProposedRegisterPreview = (props: BoxProps) => {
  const [assetsToRegister, setAssetsToRegister] = useAtom(registerAssetsAtom)

  if (!assetsToRegister.length) {
    return null
  }

  const handleRevert = (asset: string) => {
    setAssetsToRegister(assetsToRegister.filter((x) => x !== asset))
  }

  return (
    <PreviewBox
      variant="layout.borderBox"
      count={assetsToRegister.length}
      title={t`Registering assets`}
      {...props}
    >
      {assetsToRegister.map((asset) => (
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

export default ProposedRegisterPreview
