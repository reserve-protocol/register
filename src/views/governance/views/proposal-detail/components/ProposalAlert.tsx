import { Trans } from '@lingui/macro'
import { useAtomValue } from 'jotai'
import { Box, Image, Text } from 'theme-ui'
import { parseDuration } from 'utils'
import { PROPOSAL_STATES } from 'utils/constants'
import { getProposalStateAtom } from '../atom'

const ProposalAlert = () => {
  const state = useAtomValue(getProposalStateAtom)

  if (!state.deadline) {
    return null
  }

  const deadline = parseDuration(state.deadline, {
    units: ['d', 'h', 'm'],
    round: true,
  })

  return (
    <Box
      ml="auto"
      py={2}
      px={3}
      sx={{
        display: 'flex',
        alignItems: 'center',
        background: 'infoBG',
        borderRadius: '30px',
        color: 'info',
        fontSize: 0,
      }}
    >
      <Image src="/svgs/asterisk.svg" />
      <Text ml={2} mr="1" sx={{ fontWeight: 500 }}>
        {state.state === PROPOSAL_STATES.ACTIVE && (
          <Trans>Voting ends in:</Trans>
        )}
        {state.state === PROPOSAL_STATES.PENDING && (
          <Trans>Voting starts in:</Trans>
        )}
        {state.state === PROPOSAL_STATES.QUEUED && (
          <Trans>Execution delay ends in:</Trans>
        )}
      </Text>
      {deadline}
    </Box>
  )
}

export default ProposalAlert
