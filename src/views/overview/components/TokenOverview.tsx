import { t, Trans } from '@lingui/macro'
import { ContentHead, InfoHeading } from 'components/info-box'
import { useAtomValue } from 'jotai'
import { rTokenAtom, rTokenYieldAtom } from 'state/atoms'
import { Box, BoxProps, Flex, Text, Image } from 'theme-ui'
import { TokenStats } from 'types'

interface Props extends BoxProps {
  metrics: TokenStats
}

const TokenOverview = ({ metrics, ...props }: Props) => {
  const rToken = useAtomValue(rTokenAtom)
  const { tokenApy, stakingApy } = useAtomValue(rTokenYieldAtom)

  return (
    <Box {...props}>
      {rToken?.isRSV ? (
        <ContentHead
          mb={[3, 6]}
          title={t`Overview`}
          subtitle={t`Here you can find usage data about RSV, which is mostly used in the
             RPay app. Transactions data includes off-chain data that as been
             anonymized to protect user privacy.`}
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
        {!rToken?.isRSV && (
          <Flex mt={5} mb={-3}>
            <InfoHeading
              title={t`RSR Staked Pool`}
              subtitle={metrics.stakedUsd}
              mr={5}
            />
            <InfoHeading
              mb={3}
              mr={5}
              title={t`RToken Yield`}
              subtitle={`${tokenApy}%`}
            />
            <InfoHeading
              title={t`stRSR Yield`}
              mr={5}
              subtitle={`${stakingApy}%`}
            />
          </Flex>
        )}
      </Flex>
    </Box>
  )
}

export default TokenOverview
