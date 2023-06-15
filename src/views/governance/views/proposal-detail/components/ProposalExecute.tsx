import { t } from '@lingui/macro'
import { LoadingButton } from 'components/button'
import { ethers } from 'ethers'
import useBlockNumber from 'hooks/useBlockNumber'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useState } from 'react'
import {
  addTransactionAtom,
  getValidWeb3Atom,
  rTokenGovernanceAtom,
} from 'state/atoms'
import { useTransactionState } from 'state/web3/hooks/useTransactions'
import { TRANSACTION_STATUS } from 'utils/constants'
import { v4 as uuid } from 'uuid'
import { proposalDetailAtom } from '../atom'

const ProposalExecute = () => {
  const { account } = useAtomValue(getValidWeb3Atom)
  const blockNumber = useBlockNumber()
  const governance = useAtomValue(rTokenGovernanceAtom)
  const addTransaction = useSetAtom(addTransactionAtom)
  const [txId, setTx] = useState('')
  const proposal = useAtomValue(proposalDetailAtom)
  const tx = useTransactionState(txId)
  const canExecute =
    blockNumber &&
    proposal?.executionStartBlock &&
    proposal?.executionStartBlock <= blockNumber

  useEffect(() => {
    if (
      tx?.status === TRANSACTION_STATUS.CONFIRMED ||
      tx?.status === TRANSACTION_STATUS.REJECTED
    ) {
      setTx('')
    }
  }, [tx?.status])

  if (!canExecute) {
    return null
  }

  const handleExecute = () => {
    if (account && governance.governor && proposal) {
      const id = uuid()
      setTx(id)
      addTransaction([
        {
          id,
          description: t`Execute proposal`,
          status: TRANSACTION_STATUS.PENDING,
          value: '0',
          call: {
            abi: 'governance',
            address: governance.governor,
            method: 'execute',
            args: [
              proposal.targets,
              new Array(proposal.targets.length).fill(0),
              proposal.calldatas,
              ethers.utils.keccak256(
                ethers.utils.toUtf8Bytes(proposal.description)
              ),
            ],
          },
        },
      ])
    }
  }

  return (
    <LoadingButton
      small
      loading={!!txId}
      ml="auto"
      disabled={!account}
      onClick={handleExecute}
      text={t`Execute proposal`}
    />
  )
}

export default ProposalExecute
