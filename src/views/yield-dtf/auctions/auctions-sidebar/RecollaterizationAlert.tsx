import { Trans } from '@lingui/macro'
import { useAtomValue } from 'jotai'
import { Box, Text, Image, Divider } from 'theme-ui'
import { auctionsOverviewAtom } from '../atoms'
import ConfirmAuction from './ConfirmAuction'

const RecollaterizationAlert = () => {
  const data = useAtomValue(auctionsOverviewAtom)

  if (!data?.recollaterization) {
    return null
  }

  return (
    <Box
      mt={4}
      sx={{
        border: '1px dashed',
        borderRadius: '12px',
        textAlign: 'center',
        borderColor: 'warning',
        backgroundColor: 'background',
      }}
      p={5}
    >
      <Image src="/svgs/asterisk.svg" height={24} width={24} mb={2} />
      <Text variant="strong">
        <Trans>
          Unknown amount of recollateralization auctions left to run
        </Trans>
      </Text>
      <Text as="p" mt={2} sx={{ fontSize: 1 }} variant="legend">
        <Trans>
          Wait to trigger revenue auctions until after recollateralization has
          finished.
        </Trans>
      </Text>
      <Divider mx={-4} my={4} />
      <ConfirmAuction />
    </Box>
  )
}
export default RecollaterizationAlert
