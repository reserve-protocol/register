import Help from 'components/help'
import BackingBufferIcon from 'components/icons/BackingBufferIcon'
import ProgressBar from 'components/progress-bar'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import Skeleton from 'react-loading-skeleton'
import {
  rTokenBackingDistributionAtom,
  rTokenPriceAtom,
  rTokenStateAtom,
} from 'state/atoms'
import { Box, BoxProps, Text } from 'theme-ui'
import { formatCurrency, formatPercentage } from 'utils'

const BuckingBuffer = ({ ...props }: BoxProps) => {
  const rToken = useRToken()
  const backing = useAtomValue(rTokenBackingDistributionAtom)
  const rTokenState = useAtomValue(rTokenStateAtom)
  const rTokenPrice = useAtomValue(rTokenPriceAtom)

  const [percentage, actual, required, percentageOfMCap] = useMemo(() => {
    if (!backing) return [0, 0, 0]

    const _actual = backing.backingBuffer.actual
    const _required = backing.backingBuffer.required
    const _percentage = (_actual / _required) * 100
    const mCap = rTokenPrice * rTokenState.tokenSupply
    const _percentageOfMCap = formatPercentage((_required / mCap) * 100)

    return [
      _percentage,
      formatCurrency(_actual),
      formatCurrency(_required),
      _percentageOfMCap,
    ]
  }, [backing, rTokenPrice, rTokenState])

  return (
    <Box {...props}>
      <Box
        px={4}
        sx={{
          display: 'flex',
          flexDirection: ['column', 'column', 'column', 'row', 'row'],
          alignItems: [
            'flex-start',
            'flex-start',
            'flex-start',
            'center',
            'center',
          ],
          gap: 2,
          justifyContent: 'space-between',
          '@media (min-width: 1150px) and (max-width: 1250px)': {
            flexDirection: 'column',
            alignItems: 'flex-start',
          },
        }}
      >
        <Box
          variant="layout.verticalAlign"
          sx={{
            gap: 2,
            flexDirection: ['column', 'row'],
            alignItems: ['flex-start', 'center'],
          }}
        >
          <Box variant="layout.verticalAlign" sx={{ gap: 2 }}>
            <BackingBufferIcon />
            <Text variant="sectionTitle">Backing buffer</Text>
          </Box>
          <Box variant="layout.verticalAlign" sx={{ gap: 2 }}>
            <Text
              sx={{
                fontSize: 3,
                opacity: 0.2,
                mx: 2,
                display: ['none', 'inline'],
              }}
            >
              |
            </Text>
            <Text variant="contentTitle">
              {rToken?.symbol || ''} buffer as % of mcap:
            </Text>
            <Text sx={{ fontSize: 1 }}>{percentageOfMCap}</Text>
          </Box>
        </Box>
        <Box variant="layout.verticalAlign" sx={{ gap: 2 }}>
          <Text variant="contentTitle">
            Collateral yield is distributed as revenue when the backing buffer
            is full
          </Text>
          <Help content="Collateral yield is distributed as revenue when the backing buffer is full." />
        </Box>
      </Box>

      <Box my={4}>
        {backing ? (
          <ProgressBar
            percentage={percentage}
            foregroundText={
              <Text>
                <Text sx={{ display: ['none', 'inline', 'inline'] }}>
                  Current value in buffer:{' '}
                </Text>
                <Text sx={{ fontWeight: 'bold' }}>${actual}</Text>
              </Text>
            }
            backgroundText={
              <Text>
                100% at current mcap:{' '}
                <Text sx={{ fontWeight: 'bold' }}>${required}</Text>
              </Text>
            }
          />
        ) : (
          <Skeleton height={36} width="100%" />
        )}
      </Box>
    </Box>
  )
}

export default BuckingBuffer
