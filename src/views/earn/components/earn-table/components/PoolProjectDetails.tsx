import { Button } from 'components'
import ChainLogo from 'components/icons/ChainLogo'
import { useAtomValue } from 'jotai'
import Skeleton from 'react-loading-skeleton'
import { protocolMetadataAtom } from 'state/cms/atoms'
import { Box, Text } from 'theme-ui'
import { CHAIN_TAGS, LP_PROJECTS } from 'utils/constants'
import { ChainBadge } from 'views/compare/components/RTokenCard'
import { PROJECT_ICONS } from 'views/earn/utils/constants'

const PoolProjectDetails = ({
  project,
  chain,
}: {
  project: string
  chain: number
}) => {
  const protocolsMeta = useAtomValue(protocolMetadataAtom)
  const data = protocolsMeta?.[project]

  return (
    <Box p="4">
      <Box variant="layout.verticalAlign">
        <Box sx={{ img: { width: 20 } }}>{PROJECT_ICONS[project] ?? ''}</Box>
        <Text ml="2" variant="bold">
          {data ? data.name : LP_PROJECTS[project]?.name ?? project}
        </Text>
      </Box>
      {!protocolMetadataAtom ? (
        <Skeleton count={5} style={{ marginTop: 8 }} />
      ) : (
        <Box mt="2">
          <Text as="p" variant="legend" sx={{ lineHeight: 1.2 }}>
            {data?.description ?? 'No description available'}
          </Text>
          <Box variant="layout.verticalAlign" mt="3" sx={{ gap: 2 }}>
            {data?.website && (
              <Button
                onClick={() => window.open(data.website, '_blank')}
                variant="transparent"
                small
              >
                Website
              </Button>
            )}
            {data?.docs && (
              <Button
                onClick={() => window.open(data.docs, '_blank')}
                variant="transparent"
                small
              >
                Docs
              </Button>
            )}
            <Box
              ml="auto"
              variant="layout.verticalAlign"
              sx={{
                backgroundColor: 'rgba(0, 82, 255, 0.06)',
                border: '1px solid',
                borderColor: 'rgba(0, 82, 255, 0.20)',
                borderRadius: '50px',
                padding: '4px 8px',
                gap: 1,
              }}
            >
              <ChainLogo chain={chain} fontSize={12} />
              <Text sx={{ fontSize: 12 }} color="#627EEA">
                {CHAIN_TAGS[chain] + ' Native'}
              </Text>
            </Box>{' '}
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default PoolProjectDetails
