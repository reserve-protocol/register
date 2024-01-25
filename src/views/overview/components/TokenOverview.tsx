import { t, Trans } from '@lingui/macro'
import TokenLogo from 'components/icons/TokenLogo'
import { ContentHead, InfoHeading } from 'components/info-box'
import { useAtomValue } from 'jotai'
import { estimatedApyAtom, rTokenAtom } from 'state/atoms'
import { Box, BoxProps, Flex, Text } from 'theme-ui'
import { TokenStats } from 'types'
import { formatCurrency, formatPercentage } from 'utils'

interface Props extends BoxProps {
  metrics: TokenStats
}

const specialCases: Record<string, string> = {
  '0x073f98792ef4c00bb5f11b1f64f13cb25cde0d8d':
    'Estimated Yield includes the STG token, which is not tradeable by the protocol yet because there is no Chainlink oracle for STG. Once there is a Chainlink oracle, and governance adds to the collateral plugins, this yield will be distributed.',
}

const TokenOverview = ({ metrics, ...props }: Props) => {
  const rToken = useAtomValue(rTokenAtom)

  const { holders, stakers } = useAtomValue(estimatedApyAtom)
  const isRSV = !!rToken && !rToken.main

  const additionalHelp = [
    ...new Set(
      rToken?.collaterals
        .map((i) => specialCases[i.address.toLowerCase()])
        .filter((i) => i != null)
    ),
  ]

  return (
    <Box {...props}>
      <Flex sx={{ flexDirection: 'column' }}>
        <Flex
          sx={{
            alignItems: ['left', 'center'],
            flexDirection: ['column', 'row'],
          }}
        >
          <TokenLogo
            symbol={rToken?.symbol}
            width={52}
            sx={{ display: ['none', 'block'] }}
          />

          <Flex ml={[0, 4]} mt={[3, 2]} sx={{ flexDirection: 'column' }}>
            <Text variant="legend" sx={{ fontWeight: 300, color: 'lightText' }}>
              <Trans>Market cap</Trans>
            </Text>{' '}
            <Text sx={{ fontWeight: 'medium', fontSize: 6 }}>
              {metrics.supplyUsd}
            </Text>
          </Flex>
        </Flex>
        {!isRSV && (
          <Flex
            mt={[3, 5]}
            mb={-3}
            sx={{ flexWrap: 'wrap', verticalAlign: 'top' }}
          >
            <Box mr={8}>
              <InfoHeading
                title={t`Stake pool`}
                subtitle={`${formatCurrency(metrics.staked, 0)} RSR`}
                mb={[3, 4]}
              />
              <InfoHeading
                title={t`Stake pool USD value`}
                subtitle={metrics.stakedUsd}
                mb={4}
              />
            </Box>
            <Box>
              <InfoHeading
                title={t`Est. RToken Yield`}
                subtitle={`${formatPercentage(holders || 0)}`}
                help={
                  t`Estimated APY calculated base on the RToken basket averaged yield with regards of the total RToken market cap and revenue distribution to holders.` +
                  '\n\n' +
                  additionalHelp
                }
                mb={[3, 4]}
              />
              <InfoHeading
                title={t`Est. stRSR Yield`}
                subtitle={`${formatPercentage(stakers || 0)}`}
                help={
                  t`Estimated APY, calculated base on the RToken basket averaged yield with regards of the total RToken market cap and revenue distribution to stakers. Calculation = [avgCollateralYield * rTokenMarketCap / rsrStaked]` +
                  '\n\n' +
                  additionalHelp
                }
                mb={[3, 4]}
              />
            </Box>
          </Flex>
        )}
      </Flex>
    </Box>
  )
}

export default TokenOverview
