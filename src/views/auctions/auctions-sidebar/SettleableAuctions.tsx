import { atom, useAtomValue } from 'jotai'
import { Box, Text, Image, Spinner } from 'theme-ui'
import { auctionsToSettleAtom, currentTradesAtom } from '../atoms'
import { Trans, t } from '@lingui/macro'
import { Info } from 'components/info-box'

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
      <Text variant="subtitle" mb={4}>
        <Trans>To settle</Trans>
      </Text>
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
