import { Trans } from '@lingui/macro'
import Button, { SmallButton } from 'components/button'
import ExternalArrowIcon from 'components/icons/ExternalArrowIcon'
import { useAtomValue } from 'jotai'
import { ArrowLeft } from 'react-feather'
import { useNavigate, useParams } from 'react-router-dom'
import { chainIdAtom } from 'state/atoms'
import { Box, Text } from 'theme-ui'
import { PROPOSAL_STATES, ROUTES } from 'utils/constants'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { getProposalStateAtom } from './atom'
import ProposalAlert from './components/ProposalAlert'
import ProposalCancel from './components/ProposalCancel'
import ProposalDetailTitle from './components/ProposalDetailTitle'
import ProposalExecute from './components/ProposalExecute'
import ProposalQueue from './components/ProposalQueue'
import ProposalVote from './components/ProposalVote'
import ProposalSnapshot from './ProposalSnapshot'
import useProposalDetail from './useProposalDetail'

const BackButton = () => {
  const navigate = useNavigate()

  const handleBack = () => {
    navigate(`../${ROUTES.GOVERNANCE}`)
  }

  return (
    <SmallButton variant="transparent" mr="auto" onClick={handleBack}>
      <Box variant="layout.verticalAlign">
        <ArrowLeft size={14} style={{ marginRight: 10 }} />
        <Trans>Back to governance</Trans>
      </Box>
    </SmallButton>
  )
}

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

const ProposalHeader = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Box
        variant="layout.verticalAlign"
        sx={{ justifyContent: 'space-between' }}
        mt={6}
        mb={5}
        px={[1, 7]}
      >
        <BackButton />
        <ProposalAlert />
        <ProposalSnapshot />
        <ProposalCTAs />
        <ViewExecuteTxButton />
      </Box>
      <Box>
        <ProposalDetailTitle />
      </Box>
      <ProposalVote />
    </Box>
  )
}
export default ProposalHeader
