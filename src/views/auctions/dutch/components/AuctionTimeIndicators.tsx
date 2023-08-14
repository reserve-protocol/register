import { Trans } from '@lingui/macro'
import AuctionsIcon from 'components/icons/AuctionsIcon'
import { useAtomValue } from 'jotai'
import { blockAtom, chainIdAtom } from 'state/atoms'
import { Box, Spinner, Text } from 'theme-ui'
import { parseDuration } from 'utils'
import { blockDuration } from 'utils/constants'

const AuctionTimeIndicators = ({
  start,
  end,
}: {
  start: number
  end: number
}) => {
  const currentBlock = useAtomValue(blockAtom) ?? 0
  const chainId = useAtomValue(chainIdAtom)

  // Calculations
  const blocksLeft = end - currentBlock
  const auctionLength = end - start
  const bufferBlocks = Math.round(auctionLength * 0.2)
  const finalPriceBlock = start + (auctionLength - bufferBlocks)
  const isEnding = currentBlock >= finalPriceBlock

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
            {finalPriceBlock - currentBlock} blocks
          </Text>
        </>
      )}
      {!isEnding && <AuctionsIcon />}
      <Text ml={2} mr={1}>
        Auction ends in:
      </Text>
      <Text variant="strong" sx={{ color: isEnding ? 'warning' : 'text' }}>
        {Math.max(blocksLeft, 0)} blocks
      </Text>
      <Text ml={1} sx={{ display: ['none', 'block'] }}>
        (
        {parseDuration(blocksLeft * (blockDuration[chainId] ?? 12), {
          units: ['m'],
          round: true,
        })}
        )
      </Text>
    </Box>
  )
}

export default AuctionTimeIndicators
