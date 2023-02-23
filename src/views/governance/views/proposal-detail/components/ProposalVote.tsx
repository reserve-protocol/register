import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import { useState } from 'react'
import { Box, BoxProps, Button } from 'theme-ui'
import { Proposal } from 'types'
import VoteModal from './VoteModal'

interface Props extends BoxProps {
  proposal: Proposal
}

// TODO: Validate voting power first?
const ProposalVote = ({ proposal, ...props }: Props) => {
  const { account } = useWeb3React()
  const [isVisible, setVisible] = useState(false)

  if (!account) {
    return null
  }

  return (
    <Box variant="layout.borderBox" {...props}>
      <Button sx={{ width: '100%' }} onClick={() => setVisible(true)}>
        <Trans>Vote on-chain</Trans>
      </Button>
      {isVisible && (
        <VoteModal proposal={proposal} onClose={() => setVisible(false)} />
      )}
    </Box>
  )
}

export default ProposalVote
