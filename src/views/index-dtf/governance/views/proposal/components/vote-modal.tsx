import GoTo from '@/components/old/button/GoTo'
import TransactionButton from '@/components/old/button/TransactionButton'
import { ModalProps } from '@/components/old/modal'
import { t, Trans } from '@lingui/macro'
import Governance from 'abis/Governance'
import { Modal } from 'components'
import useContractWrite from 'hooks/useContractWrite'
import { useAtomValue } from 'jotai'
import {
  CheckCircle,
  ExternalLink,
  Slash,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react'
import { useState } from 'react'
import { chainIdAtom } from 'state/atoms'
import { Box, Checkbox, Divider, Flex, Link, Text } from 'theme-ui'
import { getProposalTitle, shortenAddress } from 'utils'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { proposalDetailAtom } from '../atom'

export const VOTE_TYPE = {
  AGAINST: 0,
  FOR: 1,
  ABSTAIN: 2,
}

// TODO: Move to tailwind
const VoteModal = (props: ModalProps) => {
  const chainId = useAtomValue(chainIdAtom)
  const [vote, setVote] = useState(-1)
  const proposal = useAtomValue(proposalDetailAtom)
  const isValid = proposal?.id && vote !== -1

  const { hash, isLoading, isReady, write } = useContractWrite(
    isValid
      ? {
          address: proposal?.governor ?? '0x',
          functionName: 'castVote',
          abi: Governance,
          args: [BigInt(proposal.id), vote],
        }
      : undefined
  )

  const voteOptions = [
    { label: t`For`, value: VOTE_TYPE.FOR },
    { label: t`Against`, value: VOTE_TYPE.AGAINST },
    { label: t`Abstain`, value: VOTE_TYPE.ABSTAIN },
  ]

  // TODO: Signed modal should be its own component
  // TODO: reused on other modals
  if (hash) {
    return (
      <Modal {...props}>
        <Flex
          p={4}
          sx={{
            alignItems: 'center',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <CheckCircle size={36} />
          <br />
          <Text>Transactions signed!</Text>
          <br />
          <Link
            href={getExplorerLink(hash, chainId, ExplorerDataType.TRANSACTION)}
            target="_blank"
            className="text-sm flex items-center gap-1"
          >
            <ExternalLink size={12} /> <Trans>View on etherscan</Trans>
          </Link>
        </Flex>
      </Modal>
    )
  }

  return (
    <Modal {...props} title={t`Voting`} style={{ maxWidth: 420 }}>
      <Flex sx={{ alignItems: 'center', flexDirection: 'column' }}>
        <Text variant="title">
          "
          {proposal?.description
            ? getProposalTitle(proposal.description)
            : 'Loading...'}
        </Text>
        <Box variant="layout.verticalAlign" mt={2}>
          <Text variant="legend">
            <Trans>Proposed by</Trans>:
          </Text>
          <Text ml={1}>
            {shortenAddress(proposal?.proposer?.address ?? '')}
          </Text>
          <GoTo
            ml={2}
            href={getExplorerLink(
              proposal?.proposer?.address ?? '',
              chainId,
              ExplorerDataType.ADDRESS
            )}
          />
        </Box>
      </Flex>
      <Divider sx={{ borderColor: 'darkBorder' }} my={4} mx={-4} />
      {voteOptions.map((option, index) => (
        <Box
          variant="layout.verticalAlign"
          mt={!!index ? 2 : 0}
          key={option.value}
        >
          {option.value === VOTE_TYPE.FOR && <ThumbsUp size={16} />}
          {option.value === VOTE_TYPE.AGAINST && <ThumbsDown size={16} />}
          {option.value === VOTE_TYPE.ABSTAIN && <Slash size={16} />}
          <Text variant="strong" ml={2}>
            {option.label}
          </Text>
          <label style={{ marginLeft: 'auto', cursor: 'pointer' }}>
            <Checkbox
              checked={vote === option.value}
              onChange={() => setVote(option.value)}
            />
          </label>
        </Box>
      ))}

      <Divider sx={{ borderColor: 'darkBorder' }} my={4} mx={-4} />
      <TransactionButton
        loading={isLoading}
        variant={!!hash ? 'accentAction' : 'primary'}
        text={t`Vote`}
        fullWidth
        onClick={write}
        disabled={!isReady}
      />
    </Modal>
  )
}

export default VoteModal
