import { Trans } from '@lingui/macro'
import AuctionsIcon from 'components/icons/AuctionsIcon'
import { useAtomValue } from 'jotai'
import { blockTimestampAtom } from 'state/atoms'
import { Box, Spinner, Text } from 'theme-ui'
import { parseDuration } from 'utils'

const AuctionTimeIndicators = ({
  start,
  end,
}: {
  start: number
  end: number
}) => {
  // Calculations
  const currentTime = useAtomValue(blockTimestampAtom)
  const timeLeft = Math.max(0, end - currentTime)
  const auctionLength = end - start
  const bufferTime = Math.round(auctionLength * 0.05)
  const finalPriceTime = start + (auctionLength - bufferTime)
  const isEnding = currentTime >= finalPriceTime

  return (
    <Box
      variant="layout.verticalAlign"
      ml={[0, 0, 0, 'auto']}
      mt={[1, 1, 1, 0]}
      pr={3}
      sx={{ flexWrap: 'wrap' }}
    >
      <Spinner color={isEnding ? 'warning' : 'primary'} size={16} />
      {!isEnding && (
        <>
          <Text variant="legend" ml={2} mr={1}>
            <Trans>Final price in:</Trans>
          </Text>
          <Text variant="strong" mr={3}>
            {parseDuration(finalPriceTime - currentTime, {
              units: ['m'],
              round: true,
            })}
          </Text>
        </>
      )}
      {!isEnding && <AuctionsIcon />}
      <Text ml={2} mr={1}>
        Auction ends in:
      </Text>
      <Text sx={{ display: ['none', 'block'] }}>
        (
        {parseDuration(timeLeft, {
          units: ['m'],
          round: true,
        })}
        )
      </Text>
    </Box>
  )
}

export default AuctionTimeIndicators
