import { t, Trans } from '@lingui/macro'
import IconInfo from 'components/info-icon'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { Archive, Shield, ThumbsDown, ThumbsUp, XOctagon } from 'react-feather'
import { blockAtom } from 'state/atoms'
import { Box, Grid, Progress, Text } from 'theme-ui'
import { formatCurrency, getCurrentTime } from 'utils'
import { accountVotesAtom, proposalDetailAtom } from '../atom'
import { isTimeunitGovernance } from 'views/governance/utils'
import dayjs from 'dayjs'
import { useContractRead } from 'wagmi'
import Governance from 'abis/Governance'
import { formatEther } from 'viem'

const ProposalDetailStats = () => {
  const proposal = useAtomValue(proposalDetailAtom)
  const isTimeunit = isTimeunitGovernance(proposal?.version ?? '1')
  const accountVotes = useAtomValue(accountVotesAtom)
  const { data: quorum } = useContractRead({
    abi: Governance,
    functionName: 'quorum',
    address: proposal?.governor ?? '0x1',
    args: [BigInt(proposal?.creationTime || '0')],
    enabled: !!proposal && proposal.quorumVotes !== '0',
  })

  const blockNumber = useAtomValue(blockAtom)
  const quorumWeight = useMemo(() => {
    if (
      proposal?.abstainWeightedVotes &&
      proposal.forWeightedVotes &&
      proposal.startBlock
    ) {
      const quorumVotes = Number(proposal.quorumVotes)
        ? Number(proposal.quorumVotes)
        : Number(formatEther(quorum ?? 0n))

      const total = +proposal.abstainWeightedVotes + +proposal.forWeightedVotes

      return total / quorumVotes
    }

    return 0
  }, [proposal, quorum])

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
            {(isTimeunit ? getCurrentTime() : Number(blockNumber)) >
            Number(proposal?.startBlock) ? (
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
                  title={isTimeunit ? t`Snapshot date` : t`Snapshot Block`}
                  text={
                    isTimeunit && proposal?.startBlock
                      ? dayjs(+proposal.startBlock * 1000).format(
                          'YYYY-M-D HH:mm'
                        )
                      : proposal?.startBlock.toString() ?? '0'
                  }
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
