import { Trans } from '@lingui/macro'
import MDEditor from '@uiw/react-md-editor'
import GoTo from 'components/button/GoTo'
import dayjs from 'dayjs'
import { useAtomValue } from 'jotai'
import { Box, Card, Divider, Text } from 'theme-ui'
import { shortenAddress } from 'utils'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import ProposalDetail from 'views/governance/components/ProposalDetailPreview'
import { proposalDetailAtom } from '../atom'
import { chainIdAtom } from 'state/atoms'

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
        <Box variant="layout.verticalAlign" sx={{ fontSize: 1 }}>
          <Text variant="legend" mr={1}>
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
        <Divider my={3} mx={-4} sx={{ borderColor: 'darkBorder' }} />
        <MDEditor.Markdown
          source={description}
          style={{ whiteSpace: 'pre-wrap', backgroundColor: 'transparent' }}
        />
      </Card>
      {!!proposal && (
        <ProposalDetail
          addresses={proposal.targets}
          calldatas={proposal.calldatas}
        />
      )}
    </Box>
  )
}

export default ProposalDetailContent
