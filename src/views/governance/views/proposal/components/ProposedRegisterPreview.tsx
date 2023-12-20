import { t } from '@lingui/macro'
import { useAtom } from 'jotai'
import { BoxProps } from 'theme-ui'
import { shortenAddress } from 'utils'
import { registerAssetsProposedAtom } from '../atoms'
import { ListChangePreview } from './ItemPreview'
import PreviewBox from './PreviewBox'

const ProposedRegisterPreview = (props: BoxProps) => {
  const [proposedAssetsToRegister, setProposedAssetsToRegister] = useAtom(
    registerAssetsProposedAtom
  )

  if (!proposedAssetsToRegister.length) {
    return null
  }

  const handleRevert = (asset: string) => {
    setProposedAssetsToRegister(
      proposedAssetsToRegister.filter((x) => x !== asset)
    )
  }

  return (
    <PreviewBox
      variant="layout.borderBox"
      count={proposedAssetsToRegister.length}
      title={t`Registering assets`}
      {...props}
    >
      {proposedAssetsToRegister.map((asset) => (
        <ListChangePreview
          key={asset}
          onRevert={() => handleRevert(asset)}
          isNew={true}
          value={shortenAddress(asset)}
          mt={3}
        />
      ))}
    </PreviewBox>
  )
}

export default ProposedRegisterPreview
