import { Trans } from '@lingui/macro'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import { selectedRTokenAtom } from 'state/atoms'
import { Box } from 'theme-ui'
import { SmallButton } from 'components/button'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'

const External = () => {
  const rToken = useRToken()
  const rTokenAddress = useAtomValue(selectedRTokenAtom)

  return (
    <Box
      variant="layout.verticalAlign"
      sx={{ display: ['none', 'flex'], flexWrap: 'wrap' }}
      ml={3}
    >
      {rToken?.meta?.website && (
        <SmallButton
          variant="transparent"
          mr={3}
          onClick={() => window.open(rToken.meta?.website, '_blank')}
        >
          <Trans>Website</Trans>
        </SmallButton>
      )}
      {rToken?.meta?.social?.twitter && (
        <SmallButton
          variant="transparent"
          mr={3}
          onClick={() => window.open(rToken?.meta?.social?.twitter, '_blank')}
        >
          <Trans>Twitter</Trans>
        </SmallButton>
      )}
      {!!rTokenAddress && (
        <SmallButton
          variant="transparent"
          mr={3}
          onClick={() =>
            window.open(
              getExplorerLink(rToken?.address ?? '', ExplorerDataType.TOKEN),
              '_blank'
            )
          }
        >
          <Trans>Token contract</Trans>
        </SmallButton>
      )}
    </Box>
  )
}

export default External
