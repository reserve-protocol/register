import { Trans } from '@lingui/macro'
import { Box, BoxProps, Card, Divider, Link, Text } from 'theme-ui'
import { useAtom, useAtomValue } from 'jotai'
import { rTokenAssetsAtom } from 'state/atoms'
import { rtokenAllActiveCollateralsAtom } from 'components/rtoken-setup/atoms'
import UnregisterEdit from './UnregisterEdit'
import { unregisterAssetsAtom } from '../atoms'
import useRToken from 'hooks/useRToken'

const UnregisterProposal = (props: BoxProps) => {
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

  if (!unusedAssets.length) return
  const handleAssetRemoval = (asset: string) => {
    setAssetsToUnregister(assetsToUnregister.concat(asset))
  }

  return (
    <Card {...props} p={4}>
      <Text variant="sectionTitle">
        <Trans>Unregister Assets</Trans>
      </Text>
      <Divider my={4} mx={-4} />
      <UnregisterEdit addresses={unusedAssets} onChange={handleAssetRemoval} />
      <Divider my={4} mx={-4} sx={{ borderColor: 'darkBorder' }} />
      <Text variant="legend" as="p" sx={{ fontSize: 1 }} mb={1} mr={2}>
        <Trans>
          Ensure that the asset(s) you are unregistering do not have pending
          revenue that can be
        </Trans>{' '}
        <Link
          href={`#/auctions?token=${rToken?.address}`}
          target="_blank"
          sx={{ textDecoration: 'underline' }}
        >
          <Trans> auctioned</Trans>
        </Link>
        .
      </Text>
    </Card>
  )
}

export default UnregisterProposal
