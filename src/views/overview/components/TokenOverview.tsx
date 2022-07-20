import { t } from '@lingui/macro'
import { ContentHead, InfoHeading } from 'components/info-box'
import { useAtomValue } from 'jotai'
import { rTokenAtom } from 'state/atoms'
import { Box, BoxProps, Flex } from 'theme-ui'
import { TokenStats } from 'types'

interface Props extends BoxProps {
  metrics: TokenStats
}

const TokenOverview = ({ metrics, ...props }: Props) => {
  const rToken = useAtomValue(rTokenAtom)

  return (
    <Box {...props}>
      <ContentHead
        title={t`${rToken?.symbol} Overview`}
        subtitle={
          rToken?.isRSV
            ? t`Including off-chain in-app transactions of RSV in the Reserve App.`
            : undefined
        }
      />
      <Flex sx={{ flexWrap: 'wrap' }}>
        <InfoHeading
          mt={4}
          mr={5}
          title={t`Market cap`}
          subtitle={metrics.supplyUsd}
        />
        <InfoHeading
          mt={4}
          mr={5}
          title={t`Insurance Pool`}
          subtitle={metrics.insuranceUsd}
        />
        <InfoHeading mt={4} mr={5} title={t`RToken Yield`} subtitle="0%" />
        <InfoHeading mt={4} title={t`stRSR Yield`} subtitle="0%" />
      </Flex>
    </Box>
  )
}

export default TokenOverview
