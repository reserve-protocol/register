import { t, Trans } from '@lingui/macro'
import GoTo from 'components/button/GoTo'
import RevenueSplitIcon from 'components/icons/RevenueSplitIcon'
import RevenueToStakersIcon from 'components/icons/RevenueToStakersIcon'
import RevenueToHoldersIcon from 'components/icons/RevenueToHoldersIcon'
import { ContentHead, InfoItem } from 'components/info-box'
import { useAtomValue } from 'jotai'
import { chainIdAtom, rTokenAtom, rTokenRevenueSplitAtom } from 'state/atoms'
import { Box, BoxProps, Image, Link, Text } from 'theme-ui'
import { shortenAddress } from 'utils'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import RevenueToExternalIcon from 'components/icons/RevenueToExternalIcon'

const RevenueSplitOverview = (props: BoxProps) => {
  const rToken = useAtomValue(rTokenAtom)
  const distribution = useAtomValue(rTokenRevenueSplitAtom)
  const chainId = useAtomValue(chainIdAtom)

  if (rToken && !rToken.main) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          textAlign: 'center',
          alignItems: 'center',
        }}
      >
        <Box mx={'auto'} sx={{ maxWidth: '360px' }}>
          <Image src="/svgs/asterisk.svg" />
          <Text variant="title">RSV can't earn revenue...</Text>
          <Text variant="legend" as="p" mt={2}>
            <Trans>
              RSV is not integrated with the Reserve protocol at this time and
              is a separate discrete set of smart contracts.
            </Trans>{' '}
            <Link
              href="https://reserve.org/protocol/how_rsv_works/index.html"
              target="_blank"
              sx={{ textDecoration: 'underline' }}
            >
              Learn more here.
            </Link>
          </Text>
        </Box>
      </Box>
    )
  }

  return (
    <Box px={4} py={4} {...props}>
      <RevenueSplitIcon />
      <ContentHead
        mb={4}
        mt={2}
        title={t`Revenue Split`}
        subtitle={t`Governance defines how an RToken's revenue is split between different parties. The default split is between RToken holders and RSR stakers, but it might also be shared to any arbitrary Eth address`}
      />
      <InfoItem
        title="% to"
        subtitle={t`RToken holders`}
        right={<Text>{distribution?.holders || 0}%</Text>}
        icon={<RevenueToHoldersIcon />}
        mb={3}
      />
      <InfoItem
        title="% to"
        subtitle={t`RSR Stakers`}
        right={<Text>{distribution?.stakers || 0}%</Text>}
        icon={<RevenueToStakersIcon />}
        mb={3}
      />
      {!!distribution &&
        distribution.external.map((dist, index) => (
          <Box key={dist.address} mt={index ? 3 : 0}>
            <InfoItem
              mb={2}
              title={t`% to external address`}
              icon={<RevenueToExternalIcon />}
              subtitle={
                <Box variant="layout.verticalAlign">
                  <Text mr={2}>{shortenAddress(dist.address)}</Text>
                  <GoTo
                    href={getExplorerLink(
                      dist.address,
                      chainId,
                      ExplorerDataType.ADDRESS
                    )}
                  />
                </Box>
              }
              right={<Text>{dist.total}%</Text>}
            />
          </Box>
        ))}
    </Box>
  )
}

export default RevenueSplitOverview
