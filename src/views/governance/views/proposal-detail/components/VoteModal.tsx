import { t, Trans } from '@lingui/macro'
import { Modal } from 'components'
import { LoadingButton } from 'components/button'
import GoTo from 'components/button/GoTo'
import { ModalProps } from 'components/modal'
import { BigNumber } from 'ethers'
import useTransactionCost from 'hooks/useTransactionCost'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo, useState } from 'react'
import { CheckCircle, ExternalLink, ThumbsUp } from 'react-feather'
import {
  addTransactionAtom,
  chainIdAtom,
  rTokenGovernanceAtom,
} from 'state/atoms'
import { useTransactionState } from 'state/chain/hooks/useTransactions'
import { Box, Checkbox, Divider, Flex, Link, Spinner, Text } from 'theme-ui'
import {
  formatCurrency,
  getProposalTitle,
  getTransactionWithGasLimit,
  shortenAddress,
} from 'utils'
import { TRANSACTION_STATUS } from 'utils/constants'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { v4 as uuid } from 'uuid'
import { proposalDetailAtom } from '../atom'

export const VOTE_TYPE = {
  AGAINST: 0,
  FOR: 1,
  ABSTAIN: 2,
}

const VoteModal = (props: ModalProps) => {
  const chainId = useAtomValue(chainIdAtom)
  const [vote, setVote] = useState(-1)
  const [txId, setId] = useState('')
  const proposal = useAtomValue(proposalDetailAtom)
  const governance = useAtomValue(rTokenGovernanceAtom)

  const transaction = useMemo(() => {
    if (!governance.governor || !proposal?.id) {
      return null
    }

    return {
      id: '',
      description: 'Vote',
      value: '0',
      status: TRANSACTION_STATUS.PENDING,
      call: {
        address: governance.governor,
        method: 'castVote',
        abi: 'governance',
        args: [
          proposal.id.split('-')[1],
          BigNumber.from(vote === -1 ? 0 : vote),
        ],
      },
    }
  }, [vote, proposal?.id ?? '', governance.governor])
  const [fee, gasError, gasLimit] = useTransactionCost(
    transaction ? [transaction] : []
  )
  const tx = useTransactionState(txId)
  const signed =
    tx?.status === TRANSACTION_STATUS.MINING ||
    tx?.status === TRANSACTION_STATUS.CONFIRMED
  const addTransaction = useSetAtom(addTransactionAtom)

  const handleVote = () => {
    if (transaction) {
      const id = uuid()
      addTransaction([
        { ...getTransactionWithGasLimit(transaction, gasLimit), id },
      ])
      setId(id)
    }
  }

  const voteOptions = [
    { label: t`For`, value: VOTE_TYPE.FOR },
    { label: t`Against`, value: VOTE_TYPE.AGAINST },
    { label: t`Abstain`, value: VOTE_TYPE.ABSTAIN },
  ]

  // TODO: Handle error case
  useEffect(() => {
    if (tx?.status === TRANSACTION_STATUS.REJECTED) {
      setId('')
    }
  }, [tx?.status ?? ''])

  // TODO: Signed modal should be its own component
  // TODO: reused on other modals
  if (signed) {
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
            key={tx.id}
            href={getExplorerLink(
              tx.hash ?? '',
              chainId,
              ExplorerDataType.TRANSACTION
            )}
            target="_blank"
            sx={{ fontSize: 1 }}
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
          <Text ml={1}>{shortenAddress(proposal?.proposer || '')}</Text>
          <GoTo
            ml={2}
            href={getExplorerLink(
              proposal?.proposer ?? '',
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
          <ThumbsUp size={16} />
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
      <LoadingButton
        loading={!!txId}
        variant={!!txId ? 'accentAction' : 'primary'}
        text={t`Vote`}
        sx={{ width: '100%' }}
        onClick={handleVote}
        disabled={vote === -1 || !transaction}
      />
      <Box mt={3} sx={{ fontSize: 1, textAlign: 'center' }}>
        <Text variant="legend" mr={1}>
          <Trans>Estimated gas cost:</Trans>
          {!transaction && ' --'}
        </Text>
        {!!transaction && !fee && <Spinner color="black" size={12} />}
        {!!transaction && !!fee && (
          <Text sx={{ fontWeight: 500 }}>${formatCurrency(fee)}</Text>
        )}
      </Box>
    </Modal>
  )
}

export default VoteModal
