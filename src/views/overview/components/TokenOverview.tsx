import { t, Trans } from '@lingui/macro'
import { ContentHead, InfoHeading } from 'components/info-box'
import { useAtomValue } from 'jotai'
import { rTokenAtom, rTokenYieldAtom } from 'state/atoms'
import { Box, BoxProps, Flex, Text } from 'theme-ui'
import { TokenStats } from 'types'

interface Props extends BoxProps {
  metrics: TokenStats
}

const TokenOverview = ({ metrics, ...props }: Props) => {
  const rToken = useAtomValue(rTokenAtom)
  const { tokenApy, stakingApy } = useAtomValue(rTokenYieldAtom)

  return (
    <Box {...props}>
      <ContentHead
        title={t`Overview`}
        subtitle={
          rToken?.isRSV
            ? t`Here you can find usage data about RSV, which is mostly used in the
            RPay app. Transactions data includes off-chain data that as been
            anonymized to protect user privacy.`
            : undefined
        }
      />
      <Flex mt={[3, 6]} sx={{ flexDirection: 'column' }}>
        <Flex mr={5}>
          <Text
            variant="sectionTitle"
            sx={{ whiteSpace: 'nowrap', fontWeight: '300', color: 'lightText' }}
            mr={3}
          >
            <Trans>Market cap</Trans>
          </Text>{' '}
          <Text variant="sectionTitle" sx={{ color: 'boldText' }}>
            {metrics.supplyUsd}
          </Text>
        </Flex>
        {!rToken?.isRSV && (
          <Flex mt={5}>
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
