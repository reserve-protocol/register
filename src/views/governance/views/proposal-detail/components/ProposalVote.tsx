import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import { useAtomValue } from 'jotai'
import { useState } from 'react'
import { Box, BoxProps, Button, Text } from 'theme-ui'
import { Proposal } from 'types'
import { formatCurrency } from 'utils'
import { PROPOSAL_STATES } from 'utils/constants'
import {
  accountVotesAtom,
  getProposalStateAtom,
  proposalDetailAtom,
} from '../atom'
import VoteModal from './VoteModal'

// TODO: Validate voting power first?
const ProposalVote = (props: BoxProps) => {
  const { account } = useWeb3React()
  const proposal = useAtomValue(proposalDetailAtom)
  const [isVisible, setVisible] = useState(false)
  const { state } = useAtomValue(getProposalStateAtom)
  const accountVoting = useAtomValue(accountVotesAtom)

  return (
    <Box variant="layout.borderBox" sx={{ textAlign: 'center' }} {...props}>
      <Text variant="legend">
        <Trans>Your voting power</Trans>
      </Text>
      <Text variant="title" mt={1} mb={3}>
        {formatCurrency(accountVoting.votePower ? +accountVoting.votePower : 0)}
      </Text>
      <Button
        disabled={!account || state === PROPOSAL_STATES.PENDING}
        sx={{ width: '100%' }}
        onClick={() => setVisible(true)}
      >
        <Trans>Vote on-chain</Trans>
      </Button>
      {!account && (
        <Text mt={3} sx={{ display: 'block', color: 'warning' }}>
          <Trans>Please connect your wallet</Trans>
        </Text>
      )}
      {isVisible && <VoteModal onClose={() => setVisible(false)} />}
    </Box>
  )
}

export default ProposalVote
