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
import { zeroAddress } from 'viem'
import DelegateModal from 'views/governance/components/DelegateModal'
import { Address, useContractRead } from 'wagmi'
import { accountVotesAtom, getProposalStateAtom } from '../atom'
import useProposalDetail from '../useProposalDetail'
import ProposalCancel from './ProposalCancel'
import ProposalExecute from './ProposalExecute'
import ProposalQueue from './ProposalQueue'
import ProposalAlert from './ProposalAlert'
import VoteModal from './VoteModal'

const ViewExecuteTxButton = () => {
  const { proposalId } = useParams()
  const chainId = useAtomValue(chainIdAtom)
  const { data: proposal } = useProposalDetail(proposalId ?? '')

  if (!proposal?.executionTxnHash) return null

  return (
    <Button
      small
      variant="muted"
      sx={{ display: 'flex', alignItems: 'center' }}
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
      <ExternalArrowIcon />
      <Text ml={2}>View execute tx</Text>
    </Button>
  )
}

const ProposalCTAs = () => {
  const { state } = useAtomValue(getProposalStateAtom)

  return (
    <>
      {state === PROPOSAL_STATES.SUCCEEDED && <ProposalQueue />}
      {state === PROPOSAL_STATES.QUEUED && (
        <Box
          variant="layout.verticalAlign"
          sx={{
            gap: 3,
            ':not(:has(> *))': { ml: 0 },
          }}
        >
          <ProposalCancel />
          <ProposalExecute />
        </Box>
      )}
    </>
  )
}

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

  const { data: delegate } = useContractRead({
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
      }}
      {...props}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          flexGrow: 1,
        }}
      >
        <Text variant="legend">
          <Trans>Your voting power</Trans>
        </Text>
        <Text variant="title" mt={1} mb={3}>
          {formatCurrency(votePower ? +votePower : 0)}
        </Text>
      </Box>
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
            {vote ? `You voted "${vote}"` : <Trans>Vote on-chain</Trans>}
          </Button>
        )}

        {!account && (
          <Text mt={3} sx={{ display: 'block', color: 'warning' }}>
            <Trans>Please connect your wallet</Trans>
          </Text>
        )}
      </Box>
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
