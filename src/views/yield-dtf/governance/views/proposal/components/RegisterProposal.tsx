import { Trans } from '@lingui/macro'
import { useAtom, useAtomValue } from 'jotai'
import { rTokenAssetsAtom } from 'state/atoms'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { registerAssetsProposedAtom } from '../atoms'
import RegisterEdit from './RegisterEdit'

interface RegisterProposalProps {
  className?: string
}

const RegisterProposal = ({ className }: RegisterProposalProps) => {
  const [proposedAssetsToRegister, setProposedAssetsToRegister] = useAtom(
    registerAssetsProposedAtom
  )

  const registeredErc20s = useAtomValue(rTokenAssetsAtom)

  const registeredAssets = Object.values(registeredErc20s || {}).map(
    (asset) => asset.address
  )

  const handleAssetRegister = (asset: string) => {
    setProposedAssetsToRegister(proposedAssetsToRegister.concat(asset))
  }

  return (
    <Card className={`p-6 ${className || ''}`}>
      <span className="text-lg font-semibold">
        <Trans>Register Assets</Trans>
      </span>
      <Separator className="my-6 -mx-6 w-[calc(100%+3rem)]" />
      <RegisterEdit
        onChange={handleAssetRegister}
        addresses={[...proposedAssetsToRegister, ...registeredAssets]}
      />
      <Separator className="my-6 -mx-6 w-[calc(100%+3rem)] bg-border-dark" />

      <p className="text-legend text-xs mb-1 mr-2">
        <Trans>
          Registration of an asset plugin enables the RToken to price an
          underlying ERC20 token. Where an asset plugin for the underlying token
          already exists, the existing asset plugin is replaced with the new
          one.
        </Trans>
      </p>
    </Card>
  )
}

export default RegisterProposal
