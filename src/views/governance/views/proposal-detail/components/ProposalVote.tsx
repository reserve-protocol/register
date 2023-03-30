import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import { stRSRVotesInterface } from 'abis'
import { useContractCall } from 'hooks/useCall'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import { useState } from 'react'
import { stRsrBalanceAtom } from 'state/atoms'
import { Box, BoxProps, Button, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { ZERO_ADDRESS } from 'utils/addresses'
import { PROPOSAL_STATES } from 'utils/constants'
import DelegateModal from 'views/governance/components/DelegateModal'
import { accountVotesAtom, getProposalStateAtom } from '../atom'
import VoteModal from './VoteModal'

// TODO: Validate voting power first?
const ProposalVote = (props: BoxProps) => {
  const { account } = useWeb3React()
  const rToken = useRToken()

  const [isVisible, setVisible] = useState(false)
  const [isDelegateVisible, setDelegateVisible] = useState(false)
  const { state } = useAtomValue(getProposalStateAtom)
  const { votePower = '0.0', vote } = useAtomValue(accountVotesAtom)
  const { balance } = useAtomValue(stRsrBalanceAtom)

  const { value = [] } =
    useContractCall(
      account &&
        rToken?.stToken?.address && {
          abi: stRSRVotesInterface,
          address: rToken.stToken.address,
          method: 'delegates',
          args: [account],
        }
    ) ?? {}
  const hasNoDelegates = !value[0] || value[0] === ZERO_ADDRESS

  const hasUndelegatedBalance =
    !!account && votePower && !Number(votePower) && !!Number(balance)

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
          <Trans>Please delegate your voting power</Trans>
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
          onClick={() => setDelegateVisible(true)}
        >
          {vote ? `You voted "${vote}"` : <Trans>Vote on-chain</Trans>}
        </Button>
      )}

      {!account && (
        <Text mt={3} sx={{ display: 'block', color: 'warning' }}>
          <Trans>Please connect your wallet</Trans>
        </Text>
      )}
      {isVisible && <VoteModal onClose={() => setVisible(false)} />}
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
