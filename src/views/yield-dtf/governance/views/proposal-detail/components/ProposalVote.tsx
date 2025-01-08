import { Trans } from '@lingui/macro'
import StRSRVotes from 'abis/StRSRVotes'
import { Button } from 'components'
import ExternalArrowIcon from 'components/icons/ExternalArrowIcon'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { chainIdAtom, stRsrBalanceAtom, walletAtom } from 'state/atoms'
import { Box, BoxProps, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { PROPOSAL_STATES } from 'utils/constants'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { Address, zeroAddress } from 'viem'
import DelegateModal from '@/views/yield-dtf/governance/components/DelegateModal'
import { accountVotesAtom, getProposalStateAtom } from '../atom'
import useProposalDetail from '../useProposalDetail'
import ProposalCancel from './ProposalCancel'
import ProposalExecute from './ProposalExecute'
import ProposalQueue from './ProposalQueue'
import ProposalAlert from './ProposalAlert'
import VoteModal from './VoteModal'
import AsteriskIcon from 'components/icons/AsteriskIcon'
import DelegateIcon from 'components/icons/DelegateIcon'
import { useReadContract } from 'wagmi'

const ViewExecuteTxButton = () => {
  const { proposalId } = useParams()
  const chainId = useAtomValue(chainIdAtom)
  const { data: proposal } = useProposalDetail(proposalId ?? '')

  if (!proposal?.executionTxnHash) return null

  return (
    <Button
      variant="bordered"
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={() =>
        window.open(
          getExplorerLink(
            proposal.executionTxnHash,
            chainId,
            ExplorerDataType.TRANSACTION
          ),
          '_blank'
        )
      }
    >
      <Text mr={2}>View execute tx</Text>
      <ExternalArrowIcon />
    </Button>
  )
}

const FINAL_STATES = [
  PROPOSAL_STATES.EXECUTED,
  PROPOSAL_STATES.DEFEATED,
  PROPOSAL_STATES.EXPIRED,
  PROPOSAL_STATES.CANCELED,
  PROPOSAL_STATES.QUORUM_NOT_REACHED,
  PROPOSAL_STATES.SUCCEEDED,
]

const STATES_WITH_ACTIONS = [
  PROPOSAL_STATES.SUCCEEDED,
  PROPOSAL_STATES.EXECUTED,
]

// TODO: Validate voting power first?
const ProposalVote = (props: BoxProps) => {
  const account = useAtomValue(walletAtom)
  const rToken = useRToken()
  const chainId = useAtomValue(chainIdAtom)

  const [isVoteVisible, setVoteVisible] = useState(false)
  const [isDelegateVisible, setDelegateVisible] = useState(false)
  const { state } = useAtomValue(getProposalStateAtom)
  const { votePower = '0.0', vote } = useAtomValue(accountVotesAtom)
  const { balance } = useAtomValue(stRsrBalanceAtom)

  const { data: delegate } = useReadContract({
    address: account ? (rToken?.stToken?.address as Address) : undefined,
    abi: StRSRVotes,
    functionName: 'delegates',
    chainId,
    args: account ? [account as Address] : undefined,
  })

  const hasNoDelegates = !delegate || delegate === zeroAddress

  const hasUndelegatedBalance =
    !!account &&
    votePower &&
    !Number(votePower) &&
    !!Number(balance) &&
    hasNoDelegates

  return (
    <Box
      variant="layout.borderBox"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        textAlign: 'center',
        height: '100%',
        justifyContent: 'space-between',
        p: 2,
        gap: 2,
        borderColor: 'borderSecondary',
      }}
      {...props}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          borderRadius: '8px',
          border: STATES_WITH_ACTIONS.includes(state) ? '1px solid' : 'none',
          borderColor: 'borderSecondary',
          bg: FINAL_STATES.includes(state) ? 'transparent' : 'focusBox',
        }}
      >
        {!FINAL_STATES.includes(state) && (
          <Box
            variant="layout.verticalAlign"
            sx={{
              gap: 2,
              p: '12px',
              justifyContent: 'space-between',
              fontSize: 1,
              flexWrap: 'wrap',
              borderBottom: '1px solid',
              borderColor: 'borderSecondary',
            }}
          >
            <Box variant="layout.verticalAlign" sx={{ gap: 1 }}>
              <AsteriskIcon />
              <Text>Your voting power:</Text>
              <Text sx={{ fontWeight: 'bold' }}>
                {formatCurrency(votePower ? +votePower : 0)}
              </Text>
            </Box>
            <Box
              variant="layout.verticalAlign"
              sx={{
                gap: 1,
                color: hasUndelegatedBalance ? 'accentInverted' : 'muted',
                cursor: hasUndelegatedBalance ? 'pointer' : 'default',
              }}
              onClick={() => hasUndelegatedBalance && setDelegateVisible(true)}
            >
              <DelegateIcon />
              <Text sx={{ fontWeight: 700 }}>Delegate</Text>
            </Box>
          </Box>
        )}
        <Box sx={{ flexGrow: 1, p: '12px' }}>
          <ProposalAlert />
        </Box>
      </Box>
      {(state === PROPOSAL_STATES.PENDING ||
        state === PROPOSAL_STATES.ACTIVE) && (
        <Box>
          {hasUndelegatedBalance ? (
            <Button
              sx={{ width: '100%' }}
              onClick={() => setDelegateVisible(true)}
            >
              <Trans>Delegate voting power for future votes</Trans>
            </Button>
          ) : (
            <Button
              disabled={
                !account ||
                !!vote ||
                state !== PROPOSAL_STATES.ACTIVE ||
                !votePower ||
                votePower === '0.0'
              }
              sx={{ width: '100%' }}
              onClick={() => setVoteVisible(true)}
            >
              {!account ? (
                'Please connect your wallet'
              ) : vote ? (
                `You voted "${vote}"`
              ) : (
                <Trans>Vote on-chain</Trans>
              )}
            </Button>
          )}
        </Box>
      )}
      {state === PROPOSAL_STATES.EXECUTED && <ViewExecuteTxButton />}
      {state === PROPOSAL_STATES.SUCCEEDED && <ProposalQueue />}
      {state === PROPOSAL_STATES.QUEUED && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <ProposalCancel />
          <ProposalExecute />
        </Box>
      )}
      {isVoteVisible && <VoteModal onClose={() => setVoteVisible(false)} />}
      {isDelegateVisible && (
        <DelegateModal
          delegated={!hasNoDelegates}
          onClose={() => setDelegateVisible(false)}
        />
      )}
    </Box>
  )
}

export default ProposalVote
