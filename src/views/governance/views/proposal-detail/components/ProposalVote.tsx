import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import { useAtomValue } from 'jotai'
import { useState } from 'react'
import { Box, BoxProps, Button } from 'theme-ui'
import { Proposal } from 'types'
import { proposalDetailAtom } from '../atom'
import VoteModal from './VoteModal'

// TODO: Validate voting power first?
const ProposalVote = (props: BoxProps) => {
  const { account } = useWeb3React()
  const proposal = useAtomValue(proposalDetailAtom)
  const [isVisible, setVisible] = useState(false)

  if (!account) {
    return null
  }

  return (
    <Box variant="layout.borderBox" {...props}>
      <Button sx={{ width: '100%' }} onClick={() => setVisible(true)}>
        <Trans>Vote on-chain</Trans>
      </Button>
      {isVisible && <VoteModal onClose={() => setVisible(false)} />}
    </Box>
  )
}

export default ProposalVote
