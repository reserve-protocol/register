import { t } from '@lingui/macro'
import { useAtom } from 'jotai'
import { cn } from '@/lib/utils'
import { shortenAddress } from 'utils'
import { registerAssetsProposedAtom } from '../atoms'
import { ListChangePreview } from './ItemPreview'
import PreviewBox from './PreviewBox'

interface Props {
  className?: string
}

const ProposedRegisterPreview = ({ className }: Props) => {
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
      className={cn('border border-border rounded-xl p-6', className)}
      count={proposedAssetsToRegister.length}
      title={t`Registering assets`}
    >
      {proposedAssetsToRegister.map((asset) => (
        <ListChangePreview
          key={asset}
          onRevert={() => handleRevert(asset)}
          isNew={true}
          value={shortenAddress(asset)}
          className="mt-4"
        />
      ))}
    </PreviewBox>
  )
}

export default ProposedRegisterPreview
