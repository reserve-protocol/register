import { useContractFunction } from '@usedapp/core'
import { RToken as IRToken } from 'abis/types'
import { Modal } from 'components'
import { parseEther } from 'ethers/lib/utils'
import { useRTokenContract } from 'hooks/useContract'
import useTokensApproval from 'hooks/useTokenApproval'
import useTokensHasAllowance from 'hooks/useTokensHasAllowance'
import { useEffect, useState } from 'react'
import { useAppSelector } from 'state/hooks'
import { selectBasket, selectCurrentRToken } from 'state/reserve-tokens/reducer'

const STATUS = {
  PRECHECK: 'PRECHECK',
  APPROVING: 'APPROVING',
  VALIDATING: 'VALIDATING',
  ISSUING: 'ISSUING',
  SUBMITTED: 'SUBMITTED',
  REJECTED: 'REJECTED',
}

const IssuanceTransactionModal = ({
  amount,
  onClose,
}: {
  onClose(): void
  amount: string
}) => {
  const { rToken } = useAppSelector(selectCurrentRToken) ?? {}
  const basket = useAppSelector(selectBasket)

  // TODO: Handle this, most likely not a valid case
  if (!rToken) {
    return null
  }

  const contract = useRTokenContract(rToken.address, false)
  const { state: issueState, send: issue } = useContractFunction(
    contract as IRToken,
    'issue',
    { transactionName: 'Issue RToken' }
  )
  const tokens = basket.map((bsk) => bsk.address)
  const { send: requestApproval, state } = useTokensApproval(tokens)
  const tokensHasAllowance = useTokensHasAllowance(
    tokens,
    rToken.address,
    parseEther(amount)
  )
  const [issueStatus, setIssueStatus] = useState(STATUS.APPROVING)

  useEffect(() => {
    const action = async () => {
      const result = await requestApproval(rToken.address, parseEther(amount))
      setIssueStatus(result ? STATUS.VALIDATING : STATUS.REJECTED)
    }
    action()
  }, [])

  useEffect(() => {
    if (issueStatus === STATUS.VALIDATING && tokensHasAllowance) {
      setIssueStatus(STATUS.ISSUING)
      issue(parseEther(amount))
    }
  }, [issueStatus, tokensHasAllowance])

  useEffect(() => {
    if (issueState.status === 'Success') {
      setIssueStatus(STATUS.SUBMITTED)
    }

    if (issueState.status === 'Exception' || issueState.status === 'Fail') {
      setIssueStatus(STATUS.REJECTED)
    }
  }, [issueState.status])

  return (
    <Modal open onClose={onClose} title="Transaction status">
      <div style={{ textAlign: 'center', padding: 20 }}>
        <b>Status: {issueStatus}</b>
      </div>
      {basket.map((token) => (
        <div
          key={token.symbol}
          style={{
            borderTop: '1px solid #ccc',
            padding: 20,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <b>Approve {token.symbol}</b>
          <div style={{ marginLeft: 'auto', position: 'relative', top: 3 }}>
            {state[token.address] === 'PENDING' && 'LOADING'}
            {state[token.address] === 'SUBMITTED' && 'APPROVED'}
            {state[token.address] === 'REJECTED' && 'REJECTED'}
          </div>
        </div>
      ))}
      <div
        style={{
          borderTop: '1px solid #ccc',
          padding: 20,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <b>
          Issue ${amount} {rToken.symbol}
        </b>
        <div style={{ marginLeft: 'auto', position: 'relative', top: 3 }}>
          {issueStatus === STATUS.ISSUING && 'LOADING'}
          {issueStatus === STATUS.VALIDATING && 'LOADING'}
          {issueStatus === STATUS.SUBMITTED && 'SUBMITTED'}
        </div>
      </div>
    </Modal>
  )
}

export default IssuanceTransactionModal
