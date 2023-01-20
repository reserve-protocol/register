import { t, Trans } from '@lingui/macro'
import GoTo from 'components/button/GoTo'
import { InfoItem } from 'components/info-box'
import { useAtomValue } from 'jotai'
import { rTokenRevenueSplitAtom } from 'state/atoms'
import { Box, BoxProps, Card, Text } from 'theme-ui'
import { shortenAddress } from 'utils'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'

const RevenueSplitInfo = (props: BoxProps) => {
  const distribution = useAtomValue(rTokenRevenueSplitAtom)

  return (
    <Card p={4} {...props}>
      <Text mb={5} variant="sectionTitle">
        <Trans>Revenue Distribution</Trans>
      </Text>

      <InfoItem
        title="% to"
        subtitle={t`RToken holders`}
        right={<Text>{distribution.holders}%</Text>}
        mb={3}
      />
      <InfoItem
        title="% to"
        subtitle={t`RSR Stakers`}
        right={<Text>{distribution.holders}%</Text>}
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
