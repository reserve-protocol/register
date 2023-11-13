import { Trans } from '@lingui/macro'
import { Box, BoxProps, Card, Divider, Text } from 'theme-ui'
import { useAtom, useAtomValue } from 'jotai'
import { rTokenAssetsAtom } from 'state/atoms'
import { registerAssetsAtom } from '../atoms'
import useRToken from 'hooks/useRToken'
import RegisterEdit from './RegisterEdit'

const RegisterProposal = (props: BoxProps) => {
  const [assetsToRegister, setAssetsToRegister] = useAtom(registerAssetsAtom)

  const registeredErc20s = useAtomValue(rTokenAssetsAtom)

  const registeredAssets = Object.values(registeredErc20s || {}).map(
    (asset) => asset.address
  )

  const handleAssetRegister = (asset: string) => {
    setAssetsToRegister(assetsToRegister.concat(asset))
  }

  return (
    <Card {...props} p={4}>
      <Text variant="sectionTitle">
        <Trans>Register Assets</Trans>
      </Text>
      <Divider my={4} mx={-4} />
      <RegisterEdit
        onChange={handleAssetRegister}
        addresses={[...assetsToRegister, ...registeredAssets]}
      />
    </Card>
  )
}

export default RegisterProposal
