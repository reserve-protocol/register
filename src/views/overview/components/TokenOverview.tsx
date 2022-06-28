import { t } from '@lingui/macro'
import { ContentHead, InfoHeading } from 'components/info-box'
import { useAtomValue } from 'jotai'
import { rTokenAtom } from 'state/atoms'
import { Box, BoxProps, Flex } from 'theme-ui'

const TokenOverview = (props: BoxProps) => {
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
          subtitle="$2,123,456,789"
        />
        <InfoHeading
          mt={4}
          mr={5}
          title={t`Insurance Pool`}
          subtitle="$25,123,456"
        />
        <InfoHeading mt={4} mr={5} title={t`RToken Yield`} subtitle="+4%" />
        <InfoHeading mt={4} title={t`stRSR Yield`} subtitle="+4%" />
      </Flex>
    </Box>
  )
}

export default TokenOverview
