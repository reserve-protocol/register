import { Trans } from '@lingui/macro'
import CopyValue from 'components/button/CopyValue'
import GoTo from 'components/button/GoTo'
import dayjs from 'dayjs'
import { useAtomValue } from 'jotai'
import { chainIdAtom } from 'state/atoms'
import { Box, Card, Text } from 'theme-ui'
import { shortenAddress, shortenString } from 'utils'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { proposalDetailAtom } from '../atom'

const ProposalDetailContent = () => {
  const proposal = useAtomValue(proposalDetailAtom)
  const chainId = useAtomValue(chainIdAtom)
  let title = 'Loading...'
  let description = ''

  if (proposal?.description) {
    const [heading, ...content] = proposal.description.split(/\r?\n/)
    title = heading.replaceAll('#', '').trim()
    description = content.join('\n')
  }

  return (
    <Box>
      <Card p={4} mb={4}>
        <Text variant="title" mb={2}>
          {title}
        </Text>
        <Box
          variant="layout.verticalAlign"
          sx={{ fontSize: 1, flexWrap: 'wrap' }}
        >
          <Text variant="legend" mr={1}>
            Proposal ID:
          </Text>

          <Text>
            {proposal?.id ? shortenString(proposal.id) : 'Loading...'}
          </Text>
          {!!proposal?.id && (
            <CopyValue ml="1" text={proposal.id} value={proposal.id} />
          )}
          <Text variant="legend" ml="3" mr={1}>
            <Trans>Proposed by</Trans>:
          </Text>
          <Text>
            {proposal?.proposer
              ? shortenAddress(proposal.proposer)
              : 'Loading...'}
          </Text>
          {!!proposal?.proposer && (
            <GoTo
              ml={1}
              href={getExplorerLink(
                proposal.proposer,
                chainId,
                ExplorerDataType.ADDRESS
              )}
            />
          )}

          <Text variant="legend" ml={3} mr={1}>
            <Trans>Proposed on</Trans>:
          </Text>
          <Text>
            {proposal?.creationTime
              ? dayjs.unix(+proposal.creationTime).format('MMM D, YYYY')
              : 'Loading...'}
          </Text>
        </Box>
      </Card>
    </Box>
  )
}

export default ProposalDetailContent
