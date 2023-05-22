import { Trans } from '@lingui/macro'
import { useAtomValue } from 'jotai'
import { Box, Text, Image } from 'theme-ui'
import { auctionsOverviewAtom } from '../atoms'

const RecollaterizationAlert = () => {
  const data = useAtomValue(auctionsOverviewAtom)

  if (!data?.recollaterization) {
    return null
  }

  return (
    <Box
      mt={0}
      m={4}
      sx={{
        border: '1px dashed',
        borderRadius: '12px',
        textAlign: 'center',
        borderColor: 'warning',
      }}
      p={5}
    >
      <Image src="/svgs/asterisk.svg" mb={2} />
      <Text variant="strong">
        <Trans>
          Unknown amount of recollateralization auctions left to run
        </Trans>
      </Text>
      <Text as="p" mt={2} variant="legend">
        <Trans>
          Wait to trigger revenue auctions until after recollateralization has
          finished.
        </Trans>
      </Text>
    </Box>
  )
}
export default RecollaterizationAlert
