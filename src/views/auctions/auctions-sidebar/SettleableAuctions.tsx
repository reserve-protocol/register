import { atom, useAtomValue } from 'jotai'
import { Box, Text, Image, Spinner } from 'theme-ui'
import { auctionsToSettleAtom, currentTradesAtom } from '../atoms'
import { Trans, t } from '@lingui/macro'
import { Info } from 'components/info-box'
import Help from '../../../components/help'

const ongoingAtom = atom((get) => get(currentTradesAtom)?.length || 0)

const SettleableAuctions = () => {
  const ongoing = useAtomValue(ongoingAtom)
  const settleable = useAtomValue(auctionsToSettleAtom)

  if (!settleable?.length) {
    return null
  }

  return (
    <Box
      variant="layout.borderBox"
      p={4}
      sx={{ backgroundColor: 'contentBackground' }}
      mb={4}
    >
      <Box variant="layout.verticalAlign" mb={4} sx={{ width: '100%' }}>
        <Text variant="subtitle" mr="auto">
          <Trans>Auctions to settle</Trans>
        </Text>
        <Help
          ml="auto"
          size={14}
          mt="1px"
          content={
            'Batch auctions (the only currently available auction type) require a final settlement transaction after the auction has finished (successful or failed auctions) to begin distribution of revenue or to start the auctuin again. Settlement transactions can be combined, so if there’s auctions ongoing, it’s recommended to wait for them to end before paying the gas to settle. It’s also possible to combine settlement with starting one or more new auctions.'
          }
        />
      </Box>
      {!!ongoing && (
        <Info
          icon={<Spinner size={14} />}
          title={t`Ongoing`}
          subtitle={`${ongoing} auctions still ongoing`}
          mb={3}
        />
      )}
      <Info
        icon={<Image src="/svgs/asterisk.svg" />}
        title={t`Settle`}
        subtitle={`${settleable?.length ?? 0} auctions`}
      />
    </Box>
  )
}

export default SettleableAuctions
