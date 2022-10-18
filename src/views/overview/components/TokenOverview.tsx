import { t } from '@lingui/macro'
import { ContentHead, InfoHeading } from 'components/info-box'
import { useAtomValue } from 'jotai'
import { rTokenAtom, rTokenYieldAtom } from 'state/atoms'
import { Box, BoxProps, Flex } from 'theme-ui'
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
      <Flex mt={6} sx={{ flexWrap: 'wrap' }}>
        <Box mr={5}>
          <InfoHeading
            mb={3}
            title={t`Market cap`}
            subtitle={metrics.supplyUsd}
          />
          {!rToken?.isRSV && (
            <InfoHeading
              title={t`Insurance Pool`}
              subtitle={metrics.insuranceUsd}
            />
          )}
        </Box>
        {!rToken?.isRSV && (
          <Box>
            <InfoHeading
              mb={3}
              title={t`RToken Yield`}
              subtitle={`${tokenApy}%`}
            />
            <InfoHeading title={t`stRSR Yield`} subtitle={`${stakingApy}%`} />
          </Box>
        )}
      </Flex>
    </Box>
  )
}

export default TokenOverview
