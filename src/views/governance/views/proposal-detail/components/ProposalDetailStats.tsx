import Governance from 'abis/Governance'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { Check, X } from 'react-feather'
import { Box, Progress, Text } from 'theme-ui'
import { formatEther } from 'viem'
import { useContractReads } from 'wagmi'
import { proposalDetailAtom } from '../atom'
import { colors } from 'theme'
import { formatCurrency, formatPercentage } from 'utils'

const BooleanIcon = ({
  value,
  colorSuccess = colors.success,
  colorFailure = 'orange',
}: {
  value: boolean
  colorSuccess?: string
  colorFailure?: string
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: '2px',
        bg: 'secondary',
        borderRadius: '4px',
      }}
    >
      {value ? (
        <Check size={18} color={colorSuccess} />
      ) : (
        <X size={18} color={colorFailure} />
      )}
    </Box>
  )
}

const ProposalDetailStats = () => {
  const proposal = useAtomValue(proposalDetailAtom)

  const { data } = useContractReads({
    contracts: [
      {
        address: proposal?.governor ?? '0x1',
        abi: Governance,
        functionName: 'quorum',
        args: [BigInt(proposal?.creationTime || '0')],
      },
      {
        address: proposal?.governor ?? '0x1',
        abi: Governance,
        functionName: 'proposalVotes',
        args: [BigInt(proposal?.id || '0')],
      },
    ],
    allowFailure: false,
    enabled: !!proposal,
  })

  const [quorum, votes] = data ?? [0n, [0n, 0n, 0n]]

  const [quorumWeight, currentQuorum, quorumNeeded] = useMemo(() => {
    if (
      proposal?.abstainWeightedVotes &&
      proposal.forWeightedVotes &&
      proposal.startBlock
    ) {
      const quorumVotes = Number(proposal.quorumVotes)
        ? Number(proposal.quorumVotes)
        : Number(formatEther(quorum ?? 0n))

      const total = +proposal.abstainWeightedVotes + +proposal.forWeightedVotes

      return [total / quorumVotes, total, quorumVotes]
    }

    return [0, 0, 0]
  }, [proposal, quorum])

  return (
    <Box sx={{ bg: 'background', borderRadius: '8px', p: 2 }}>
      <Text variant="title" sx={{ fontWeight: 'bold' }} p={3}>
        Current votes
      </Text>
      <Box
        sx={{
          bg: 'focusedBackground',
          borderRadius: '6px',
          overflow: 'hidden',
          '>div:not(:last-child)': {
            borderBottom: '1px solid',
            borderColor: 'borderSecondary',
          },
          boxShadow: '0px 10px 38px 6px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 3 }}>
          <Box
            variant="layout.verticalAlign"
            sx={{ gap: 2, justifyContent: 'space-between' }}
          >
            <Box variant="layout.verticalAlign" sx={{ gap: 2 }}>
              <BooleanIcon value={quorumWeight > 1} />
              <Text>Quorum</Text>
            </Box>
            <Box variant="layout.verticalAlign" sx={{ gap: 2 }}>
              <Text
                sx={{
                  fontWeight: 'bold',
                  color: quorumWeight > 1 ? 'success' : 'orange',
                }}
              >
                {formatPercentage(quorumWeight * 100)}
              </Text>

              <Text color="secondaryText" sx={{ whiteSpace: 'nowrap' }}>
                {formatCurrency(currentQuorum, 2, {
                  notation: 'compact',
                  compactDisplay: 'short',
                })}{' '}
                of{' '}
                {formatCurrency(quorumNeeded, 2, {
                  notation: 'compact',
                  compactDisplay: 'short',
                })}
              </Text>
            </Box>
          </Box>
          <Progress
            max={1}
            mt={2}
            sx={{
              width: '100%',
              color: quorumWeight > 1 ? 'success' : 'orange',
              backgroundColor: 'lightgray',
              height: 4,
            }}
            value={quorumWeight}
          />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 3 }}>
          <Box
            variant="layout.verticalAlign"
            sx={{ gap: 2, justifyContent: 'space-between' }}
          >
            <Box variant="layout.verticalAlign" sx={{ gap: 2 }}>
              <BooleanIcon
                value={quorumWeight > 1}
                colorSuccess={colors.primary}
                colorFailure="red"
              />
              <Text>Majority support</Text>
            </Box>
            <Box variant="layout.verticalAlign" sx={{ gap: 2 }}>
              <Text
                sx={{
                  fontWeight: 'bold',
                  color: quorumWeight > 1 ? 'primary' : 'red',
                }}
              >
                {quorumWeight > 1 ? 'Yes' : 'No'}
              </Text>
            </Box>
          </Box>
          <Progress
            max={1}
            mt={2}
            sx={{
              width: '100%',
              color: quorumWeight > 1 ? 'primary' : 'red',
              backgroundColor: 'lightgray',
              height: 4,
            }}
            value={quorumWeight}
          />
        </Box>
      </Box>
    </Box>
  )
}

export default ProposalDetailStats
