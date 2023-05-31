import { t, Trans } from '@lingui/macro'
import { ContentHead, InfoHeading } from 'components/info-box'
import { useAtomValue } from 'jotai'
import { estimatedApyAtom, rTokenAtom, rTokenYieldAtom } from 'state/atoms'
import { Box, BoxProps, Flex, Text, Image } from 'theme-ui'
import { TokenStats } from 'types'
import { formatPercentage, parsePercent } from 'utils'

interface Props extends BoxProps {
  metrics: TokenStats
}

const TokenOverview = ({ metrics, ...props }: Props) => {
  const rToken = useAtomValue(rTokenAtom)
  const { tokenApy, stakingApy } = useAtomValue(rTokenYieldAtom)
  const { holders, stakers } = useAtomValue(estimatedApyAtom)

  return (
    <Box {...props}>
      {rToken?.isRSV ? (
        <ContentHead
          mb={[3, 6]}
          title={t`Overview`}
          subtitle={t`Here you can find usage data about RSV, which is used to mostly be used in the Rpay app. Usage data includes off-chain data from before the migration on March 22, 2023 that as been anonymized to protect user privacy. This page will likely be removed from Register in the future.`}
        />
      ) : undefined}

      <Flex sx={{ flexDirection: 'column' }}>
        <Flex
          sx={{
            alignItems: ['left', 'center'],
            flexDirection: ['column', 'row'],
          }}
        >
          <Image
            src={rToken?.logo}
            sx={{ width: 52, display: ['none', 'block'] }}
          />
          <Flex ml={[0, 4]} mt={[3, 2]} sx={{ flexDirection: 'column' }}>
            <Text variant="title" sx={{ fontWeight: 300, color: 'lightText' }}>
              <Trans>Market cap</Trans>
            </Text>{' '}
            <Text sx={{ fontWeight: 'medium', fontSize: 6 }}>
              {metrics.supplyUsd}
            </Text>
          </Flex>
        </Flex>
        {!rToken?.isRSV && (
          <Flex
            mt={[3, 5]}
            mb={-3}
            sx={{ flexWrap: 'wrap', verticalAlign: 'top' }}
          >
            <Box mr={8}>
              <InfoHeading
                title={t`RSR Staked Pool`}
                subtitle={metrics.stakedUsd}
                mb={[3, 4]}
              />
              <InfoHeading
                title={t`Est. stRSR Yield`}
                subtitle={`${formatPercentage(stakers || 0)}`}
                help={t`Manually estimated APY, calculated base on the RToken basket averaged yield with regards of the total RToken market cap and revenue distribution to stakers. Calculation = [avgCollateralYield * rTokenMarketCap / rsrStaked]`}
                mb={4}
              />
              <InfoHeading
                title={t`stRSR Yield`}
                help={t`Historic stRSR yield, this will be 0% until enough on-chain events ocurred. Calculated in base of the exchange rate between RSR <> stRSR historic changes`}
                subtitle={`${stakingApy}%`}
                mb={[3, 4]}
              />
            </Box>
            <Box>
              <InfoHeading
                title={t`Est. RToken Yield`}
                help={t`Manually estimated APY, calculated base on the RToken basket averaged yield with regards of the total RToken market cap and revenue distribution to holders.`}
                subtitle={`${formatPercentage(holders || 0)}`}
                mb={[3, 4]}
              />
              <InfoHeading
                help={t`Historic RToken yield, this will be 0% until enough on-chain events ocurred.`}
                title={t`RToken Yield`}
                subtitle={`${tokenApy}%`}
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
