import { Trans } from '@lingui/macro'
import { useAtom, useAtomValue } from 'jotai'
import { rTokenAssetsAtom } from 'state/atoms'
import { BoxProps, Card, Divider, Text } from 'theme-ui'
import { registerAssetsProposedAtom } from '../atoms'
import RegisterEdit from './RegisterEdit'

const RegisterProposal = (props: BoxProps) => {
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
    <Card {...props} p={4}>
      <Text variant="sectionTitle">
        <Trans>Register Assets</Trans>
      </Text>
      <Divider my={4} mx={-4} />
      <RegisterEdit
        onChange={handleAssetRegister}
        addresses={[...proposedAssetsToRegister, ...registeredAssets]}
      />
      <Divider my={4} mx={-4} sx={{ borderColor: 'darkBorder' }} />

      <Text variant="legend" as="p" sx={{ fontSize: 1 }} mb={1} mr={2}>
        <Trans>
          Registration of an asset plugin enables the RToken to price an
          underlying ERC20 token. Where an asset plugin for the underlying token
          already exists, the existing asset plugin is replaced with the new
          one.
        </Trans>
      </Text>
    </Card>
  )
}

export default RegisterProposal
