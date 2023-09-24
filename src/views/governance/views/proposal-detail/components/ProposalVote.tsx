import { Trans } from '@lingui/macro'
import StRSRVotes from 'abis/StRSRVotes'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import { useState } from 'react'
import { stRsrBalanceAtom, walletAtom } from 'state/atoms'
import { Box, BoxProps, Button, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { PROPOSAL_STATES } from 'utils/constants'
import { zeroAddress } from 'viem'
import DelegateModal from 'views/governance/components/DelegateModal'
import { Address, useContractRead } from 'wagmi'
import { accountVotesAtom, getProposalStateAtom } from '../atom'
import VoteModal from './VoteModal'

// TODO: Validate voting power first?
const ProposalVote = (props: BoxProps) => {
  const account = useAtomValue(walletAtom)
  const rToken = useRToken()

  const [isVoteVisible, setVoteVisible] = useState(false)
  const [isDelegateVisible, setDelegateVisible] = useState(false)
  const { state } = useAtomValue(getProposalStateAtom)
  const { votePower = '0.0', vote } = useAtomValue(accountVotesAtom)
  const { balance } = useAtomValue(stRsrBalanceAtom)

  const { data: delegate } = useContractRead({
    address: account ? (rToken?.stToken?.address as Address) : undefined,
    abi: StRSRVotes,
    functionName: 'delegates',
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
    <Box variant="layout.borderBox" sx={{ textAlign: 'center' }} {...props}>
      <Text variant="legend">
        <Trans>Your voting power</Trans>
      </Text>
      <Text variant="title" mt={1} mb={3}>
        {formatCurrency(votePower ? +votePower : 0)}
      </Text>
      {hasUndelegatedBalance ? (
        <Button sx={{ width: '100%' }} onClick={() => setDelegateVisible(true)}>
          <Trans>Delegate voting power for future votes</Trans>
        </Button>
      ) : (
        <Button
          disabled={
            !account ||
            !!vote ||
            state === PROPOSAL_STATES.PENDING ||
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
