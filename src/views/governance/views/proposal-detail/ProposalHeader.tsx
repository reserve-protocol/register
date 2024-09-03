import Address from 'components/address'
import Button, { SmallButton } from 'components/button'
import CopyValue from 'components/button/CopyValue'
import ExternalArrowIcon from 'components/icons/ExternalArrowIcon'
import dayjs from 'dayjs'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import { ArrowLeft, Link2 } from 'react-feather'
import { useNavigate, useParams } from 'react-router-dom'
import { chainIdAtom } from 'state/atoms'
import { Box, Link, Text } from 'theme-ui'
import { shortenString, shortenStringN } from 'utils'
import { PROPOSAL_STATES, ROUTES } from 'utils/constants'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { getProposalStateAtom, proposalDetailAtom } from './atom'
import ProposalAlert from './components/ProposalAlert'
import ProposalCancel from './components/ProposalCancel'
import ProposalExecute from './components/ProposalExecute'
import ProposalQueue from './components/ProposalQueue'
import ProposalSnapshot from './ProposalSnapshot'
import useProposalDetail from './useProposalDetail'

const BackButton = () => {
  const navigate = useNavigate()

  const handleBack = () => {
    navigate(`../${ROUTES.GOVERNANCE}`)
  }

  return (
    <SmallButton variant="transparent" onClick={handleBack}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          py: 1,
        }}
      >
        <ArrowLeft size={16} />
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

const Dot = () => (
  <Box
    variant="layout.verticalAlign"
    sx={{ justifyContent: 'center', fontWeight: 'bold' }}
  >
    ·
  </Box>
)

const ProposalHeader = () => {
  const rToken = useRToken()
  const proposal = useAtomValue(proposalDetailAtom)

  let title = 'Loading...'
  let rfcLink = ''

  if (proposal?.description) {
    const [heading, rfc, _] = proposal.description.split(/\r?\n/)
    title = heading.replaceAll('#', '').trim()
    if (rfc?.includes('forum')) {
      rfcLink = rfc.match(/\(([^)]+)\)/)?.[1] ?? ''
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        gap: 8,
        p: 4,
      }}
    >
      <Box
        variant="layout.verticalAlign"
        sx={{ gap: 2, justifyContent: 'space-between' }}
      >
        <BackButton />
        <Box
          variant="layout.verticalAlign"
          sx={{ gap: 3, fontSize: 1, flexWrap: 'wrap' }}
        >
          <Box variant="layout.verticalAlign" sx={{ gap: 1 }}>
            <Text variant="legend">Proposed by:</Text>
            <Box sx={{ fontWeight: 'bold' }}>
              {proposal?.proposer && rToken?.chainId && (
                <Address address={proposal?.proposer} chain={rToken?.chainId} />
              )}
            </Box>
          </Box>
          <Dot />
          <Box variant="layout.verticalAlign" sx={{ gap: 1 }}>
            <Text variant="legend">ID:</Text>
            <Box variant="layout.verticalAlign" sx={{ gap: 1 }}>
              <Text sx={{ fontWeight: 'bold' }}>
                {proposal?.id ? shortenString(proposal.id) : 'Loading...'}
              </Text>
              {!!proposal?.id && (
                <CopyValue text={proposal.id} value={proposal.id} />
              )}
            </Box>
          </Box>
          <Dot />
          <Box variant="layout.verticalAlign" sx={{ gap: 1 }}>
            <Text variant="legend">Proposed on:</Text>
            <Text sx={{ fontWeight: 'bold' }}>
              {proposal?.creationTime
                ? dayjs.unix(+proposal.creationTime).format('MMM D, YYYY')
                : 'Loading...'}
            </Text>
          </Box>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Text sx={{ fontSize: 4, fontWeight: 'bold' }}>{title}</Text>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <Box
            variant="layout.verticalAlign"
            sx={{
              gap: 5,
              fontSize: 2,
              justifyContent: 'space-between',
            }}
          >
            <Box variant="layout.verticalAlign" sx={{ gap: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 1,
                  bg: 'bgIcon',
                  borderRadius: '4px',
                  color: 'text',
                }}
              >
                <Link2 size={16} />
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Text variant="legend" sx={{ fontSize: 1 }}>
                  Forum link
                </Text>
                <Link href={rfcLink} target="_blank">
                  {shortenStringN(rfcLink, 12)}
                </Link>
              </Box>
            </Box>
            <Box variant="layout.verticalAlign" sx={{ gap: 1 }}>
              <ProposalAlert />
              <ProposalSnapshot />
              <ProposalCTAs />
              <ViewExecuteTxButton />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
export default ProposalHeader
