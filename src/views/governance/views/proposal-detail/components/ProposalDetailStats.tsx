import { t, Trans } from '@lingui/macro'
import IconInfo from 'components/info-icon'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { Archive, Shield, ThumbsDown, ThumbsUp, XOctagon } from 'react-feather'
import { blockAtom } from 'state/atoms'
import { Box, Grid, Progress, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { accountVotesAtom, proposalDetailAtom } from '../atom'

const ProposalDetailStats = () => {
  const proposal = useAtomValue(proposalDetailAtom)
  const accountVotes = useAtomValue(accountVotesAtom)

  const blockNumber = useAtomValue(blockAtom)
  const quorumWeight = useMemo(() => {
    if (
      proposal?.abstainWeightedVotes &&
      proposal.forWeightedVotes &&
      proposal.startBlock
    ) {
      const total = +proposal.abstainWeightedVotes + +proposal.forWeightedVotes

      return total / +proposal.quorumVotes
    }

    return 0
  }, [proposal])

  return (
    <Box variant="layout.borderBox" p={0}>
      <Grid gap={0} columns={2}>
        <Box
          p={4}
          sx={{
            borderRight: '1px solid',
            borderBottom: '1px solid',
            borderColor: 'border',
          }}
        >
          <Box mb={2}>
            <Text variant="subtitle" mb={3}>
              <Trans>For Votes</Trans>
            </Text>
            <IconInfo
              icon={<ThumbsUp size={14} />}
              title={t`Current`}
              text={formatCurrency(Number(proposal?.forWeightedVotes ?? '0'))}
            />
          </Box>

          <Box>
            {Number(blockNumber) > Number(proposal?.startBlock) ? (
              <>
                <IconInfo
                  icon={<Shield size={14} />}
                  title={t`Quorum`}
                  text={formatCurrency(Number(proposal?.quorumVotes ?? '0'))}
                />

                <Progress
                  max={1}
                  mt={2}
                  sx={{
                    width: '100%',
                    color: 'success',
                    backgroundColor: 'red',
                    height: 4,
                  }}
                  value={quorumWeight}
                />
              </>
            ) : (
              <>
                <IconInfo
                  icon={<Shield size={14} />}
                  title={t`Snapshot Block`}
                  text={proposal?.startBlock.toString() ?? '0'}
                />
              </>
            )}
          </Box>
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
