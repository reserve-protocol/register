import { Trans } from '@lingui/macro'
import CopyValue from 'components/button/CopyValue'
import GoTo from 'components/button/GoTo'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import { selectedRTokenAtom } from 'state/atoms'
import { Box, Button, Text } from 'theme-ui'
import { shortenAddress } from 'utils'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'

const External = () => {
  const rToken = useRToken()
  const rTokenAddress = useAtomValue(selectedRTokenAtom)

  return (
    <Box
      variant="layout.verticalAlign"
      sx={{ display: ['none', 'flex'], flexWrap: 'wrap' }}
      ml={4}
    >
      {rToken?.meta?.website && (
        <Button
          variant="muted"
          px={5}
          mr={3}
          onClick={() => window.open(rToken.meta?.website, '_blank')}
        >
          <Trans>Website</Trans>
        </Button>
      )}
      {rToken?.meta?.social?.twitter && (
        <Button
          variant="muted"
          px={5}
          mr={3}
          onClick={() => window.open(rToken?.meta?.social?.twitter, '_blank')}
        >
          <Trans>Twitter</Trans>
        </Button>
      )}
      {!!rTokenAddress && (
        <>
          <Text ml="auto">{shortenAddress(rTokenAddress)}</Text>
          <CopyValue ml={2} mr={2} value={rTokenAddress} />
          <GoTo
            href={getExplorerLink(
              rToken?.address ?? '',
              ExplorerDataType.TOKEN
            )}
          />
        </>
      )}
    </Box>
  )
}

export default External
