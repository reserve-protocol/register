import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import { useAtomValue } from 'jotai'
import { useState } from 'react'
import { stRsrBalanceAtom } from 'state/atoms'
import { Box, BoxProps, Button, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { PROPOSAL_STATES } from 'utils/constants'
import { accountVotesAtom, getProposalStateAtom } from '../atom'
import VoteModal from './VoteModal'

// TODO: Validate voting power first?
const ProposalVote = (props: BoxProps) => {
  const { account } = useWeb3React()
  const [isVisible, setVisible] = useState(false)
  const { state } = useAtomValue(getProposalStateAtom)
  const { votePower = '0.0' } = useAtomValue(accountVotesAtom)
  const { balance } = useAtomValue(stRsrBalanceAtom)

  return (
    <Box variant="layout.borderBox" sx={{ textAlign: 'center' }} {...props}>
      <Text variant="legend">
        <Trans>Your voting power</Trans>
      </Text>
      <Text variant="title" mt={1} mb={3}>
        {formatCurrency(votePower ? +votePower : 0)}
      </Text>
      <Button
        disabled={
          !account ||
          state === PROPOSAL_STATES.PENDING ||
          !votePower ||
          votePower === '0.0'
        }
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
      {!!account && votePower && !Number(votePower) && !!Number(balance) && (
        <Text mt={3} sx={{ display: 'block', color: 'warning' }}>
          <Trans>Please delegate your voting power</Trans>
        </Text>
      )}
      {isVisible && <VoteModal onClose={() => setVisible(false)} />}
    </Box>
  )
}

export default ProposalVote
