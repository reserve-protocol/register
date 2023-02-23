import { t, Trans } from '@lingui/macro'
import GoTo from 'components/button/GoTo'
import { InfoItem } from 'components/info-box'
import { useAtomValue } from 'jotai'
import { rTokenRevenueSplitAtom } from 'state/atoms'
import { Box, BoxProps, Card, Text, Divider } from 'theme-ui'
import { shortenAddress } from 'utils'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'

/**
 * View: Settings > Display RToken revenue split (addresses)
 */
const RevenueSplitInfo = (props: BoxProps) => {
  const distribution = useAtomValue(rTokenRevenueSplitAtom)

  return (
    <Card p={4} {...props}>
      <Text variant="sectionTitle">
        <Trans>Revenue Distribution</Trans>
      </Text>
      <Divider mx={-4} my={4} sx={{ borderColor: 'darkBorder' }} />
      <InfoItem
        title="% to"
        subtitle={t`RToken holders`}
        right={<Text>{distribution.holders || 0}%</Text>}
        mb={3}
      />
      <InfoItem
        title="% to"
        subtitle={t`RSR Stakers`}
        right={<Text>{distribution.stakers || 0}%</Text>}
        mb={3}
      />
      {distribution.external.map((dist, index) => (
        <Box key={dist.address} mt={index ? 3 : 0}>
          <InfoItem
            mb={2}
            title={t`% to external address`}
            subtitle={
              <Box variant="layout.verticalAlign">
                <Text mr={2}>{shortenAddress(dist.address)}</Text>
                <GoTo
                  href={getExplorerLink(dist.address, ExplorerDataType.ADDRESS)}
                />
              </Box>
            }
            right={<Text>{dist.total}%</Text>}
          />
          <Box sx={{ marginLeft: 20 }}>
            <Text variant="legend">RToken/RSR split:</Text>{' '}
            <Text>
              {dist.holders}/{dist.stakers}
            </Text>
          </Box>
        </Box>
      ))}
    </Card>
  )
}

export default RevenueSplitInfo
