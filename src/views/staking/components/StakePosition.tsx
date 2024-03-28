import { Trans } from '@lingui/macro'
import { useAtomValue } from 'jotai'
import { Box, BoxProps, Divider, Text } from 'theme-ui'
import { accountCurrentPositionAtom, rateAtom, stRsrTickerAtom } from '../atoms'
import TokenLogo from 'components/icons/TokenLogo'
import { rsrPriceAtom, stRsrBalanceAtom } from 'state/atoms'
import { formatCurrency } from 'utils'
import TrendingIcon from 'components/icons/TrendingIcon'

const StakePosition = (props: BoxProps) => {
  const ticker = useAtomValue(stRsrTickerAtom)
  const rate = useAtomValue(rateAtom)
  const balance = useAtomValue(stRsrBalanceAtom)
  const rsrPrice = useAtomValue(rsrPriceAtom)
  const rewards = useAtomValue(accountCurrentPositionAtom)

  return (
    <Box {...props}>
      <Text ml="4" variant="bold" sx={{ fontSize: 4 }}>
        <Trans>Your stake position</Trans>
      </Text>
      <Box mt={3} variant="layout.borderBox">
        <Box variant="layout.verticalAlign">
          <TokenLogo src="/svgs/strsr.svg" />
          <Text variant="bold" ml="2">
            {formatCurrency(+balance.balance, 2, {
              notation: 'compact',
              compactDisplay: 'short',
            })}
          </Text>
          <Text ml="1" variant="bold" color="secondaryText">
            {ticker}
          </Text>
        </Box>
        <Divider my={3} />
        <Box variant="layout.verticalAlign">
          <Text sx={{ fontSize: 3, width: 16 }} variant="bold">
            =
          </Text>
          <TokenLogo symbol="rsr" mx={2} />
          <Box>
            <Text variant="legend" sx={{ fontSize: 1 }}>
              Exchangeable for
            </Text>
            <Box sx={{ fontWeight: 700 }}>
              <Text>
                {formatCurrency(+balance.balance * rate, 2, {
                  notation: 'compact',
                  compactDisplay: 'short',
                })}
              </Text>{' '}
              <Text variant="legend">RSR</Text>
            </Box>
          </Box>
          <Text variant="legend" ml="auto">
            ${formatCurrency(+balance.balance * rate * rsrPrice)}
          </Text>
        </Box>
        <Box variant="layout.verticalAlign" mt="2">
          <TrendingIcon />
          <TokenLogo symbol="rsr" mx={2} />
          <Box>
            <Text variant="legend" sx={{ fontSize: 1 }}>
              Rewards
            </Text>
            <Box sx={{ fontWeight: 700 }}>
              <Text>
                {formatCurrency(rewards, 2, {
                  notation: 'compact',
                  compactDisplay: 'short',
                })}
              </Text>{' '}
              <Text variant="legend">RSR</Text>
            </Box>
          </Box>
          <Text variant="legend" ml="auto">
            ${formatCurrency(rewards * rsrPrice)}
          </Text>
        </Box>
      </Box>
    </Box>
  )
}

export default StakePosition
