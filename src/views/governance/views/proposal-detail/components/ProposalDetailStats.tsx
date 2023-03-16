import { t, Trans } from '@lingui/macro'
import IconInfo from 'components/info-icon'
import { formatEther } from 'ethers/lib/utils'
import { useAtomValue } from 'jotai'
import { Archive, ThumbsDown, ThumbsUp, XOctagon } from 'react-feather'
import { Box, Grid, Image, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { accountVotesAtom, proposalDetailAtom } from '../atom'

const ProposalDetailStats = () => {
  const proposal = useAtomValue(proposalDetailAtom)
  const accountVotes = useAtomValue(accountVotesAtom)

  return (
    <Box variant="layout.borderBox" mt={4} p={0}>
      <Grid gap={0} columns={2}>
        <Box
          p={4}
          sx={{
            borderRight: '1px solid',
            borderBottom: '1px solid',
            borderColor: 'border',
          }}
        >
          <Text variant="subtitle" mb={3}>
            <Trans>For Votes</Trans>
          </Text>
          <IconInfo
            icon={<ThumbsUp size={14} />}
            title={t`Current`}
            text={formatCurrency(Number(proposal?.forWeightedVotes ?? '0'))}
          />
        </Box>
        <Box p={4} sx={{ borderBottom: '1px solid', borderColor: 'border' }}>
          <Text variant="subtitle" mb={3}>
            <Trans>Against Votes</Trans>
          </Text>
          <IconInfo
            icon={<ThumbsDown size={14} />}
            title={t`Current`}
            text={formatCurrency(Number(proposal?.againstWeightedVotes ?? '0'))}
          />
        </Box>
        <Box p={4} sx={{ borderRight: '1px solid', borderColor: 'border' }}>
          <Text variant="subtitle" mb={3}>
            <Trans>Your Vote</Trans>
          </Text>
          <IconInfo
            icon={<Archive size={14} />}
            title={accountVotes.vote || '--'}
            text={
              accountVotes.vote
                ? formatCurrency(Number(accountVotes.votePower ?? '0'))
                : '0'
            }
          />
        </Box>
        <Box p={4} sx={{ borderBottom: '1px solid', borderColor: 'border' }}>
          <Text variant="subtitle" mb={3}>
            <Trans>Abstain votes</Trans>
          </Text>
          <IconInfo
            icon={<XOctagon size={14} />}
            title={t`Current`}
            text={formatCurrency(Number(proposal?.abstainWeightedVotes ?? '0'))}
          />
        </Box>
      </Grid>
    </Box>
  )
}

export default ProposalDetailStats
