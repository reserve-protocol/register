import { t, Trans } from '@lingui/macro'
import { ContentHead, InfoHeading } from 'components/info-box'
import { useAtomValue } from 'jotai'
import { estimatedApyAtom, rTokenAtom, rTokenYieldAtom } from 'state/atoms'
import { Box, BoxProps, Flex, Image, Text } from 'theme-ui'
import { TokenStats } from 'types'
import { formatPercentage } from 'utils'

interface Props extends BoxProps {
  metrics: TokenStats
}

const TokenOverview = ({ metrics, ...props }: Props) => {
  const rToken = useAtomValue(rTokenAtom)
  const { tokenApy, stakingApy } = useAtomValue(rTokenYieldAtom)
  const { holders, stakers } = useAtomValue(estimatedApyAtom)
  const isRSV = !!rToken && !rToken.main

  return (
    <Box {...props}>
      {isRSV ? (
        <ContentHead
          mb={[3, 6]}
          title={t`Overview`}
          subtitle={t`Here you can find usage data about RSV, which is used to mostly be used in the Rpay app. Usage data includes off-chain data from before the migration on March 22, 2023 that as been anonymized to protect user privacy. This page will likely be removed from Register in the future.`}
        />
      ) : undefined}

      <Flex sx={{ flexDirection: 'column' }}>
        <Flex sx={{ alignItems: 'center' }}>
          <Image src={rToken?.logo} sx={{ width: 40, height: 40 }} />
          <Flex ml={3} sx={{ flexDirection: 'column' }}>
            <Text variant="legend" sx={{ fontWeight: 300 }}>
              <Trans>Market cap</Trans>
            </Text>{' '}
            <Text sx={{ fontWeight: '500', fontSize: 5 }}>
              {metrics.supplyUsd}
            </Text>
          </Flex>
        </Flex>
        {!isRSV && (
          <Flex mt={5} mb={-3} sx={{ flexWrap: 'wrap' }}>
            <InfoHeading
              title={t`RSR Staked Pool`}
              subtitle={metrics.stakedUsd}
              mr={5}
            />
            <InfoHeading
              mb={3}
              mr={5}
              help={t`Historic RToken yield, this will be 0% until enough on-chain events ocurred.`}
              title={t`RToken Yield`}
              subtitle={`${tokenApy}%`}
            />
            <InfoHeading
              mb={3}
              mr={5}
              title={t`Est. RToken Yield`}
              help={t`Manually estimated APY, calculated base on the RToken basket averaged yield with regards of the total RToken market cap and revenue distribution to holders.`}
              subtitle={`${formatPercentage(holders || 0)}`}
            />
            <InfoHeading
              title={t`stRSR Yield`}
              mr={5}
              help={t`Historic stRSR yield, this will be 0% until enough on-chain events ocurred. Calculated in base of the exchange rate between RSR <> stRSR historic changes`}
              subtitle={`${stakingApy}%`}
            />
            <InfoHeading
              title={t`Est. stRSR Yield`}
              mr={5}
              subtitle={`${formatPercentage(stakers || 0)}`}
              help={t`Manually estimated APY, calculated base on the RToken basket averaged yield with regards of the total RToken market cap and revenue distribution to stakers. Calculation = [avgCollateralYield * rTokenMarketCap / rsrStaked]`}
            />
          </Flex>
        )}
      </Flex>
    </Box>
  )
}

export default TokenOverview
