import { useContractFunction } from '@usedapp/core'
import { MainInterface } from 'abis'
import { Main as IMain } from 'abis/types'
import { Modal } from 'components'
import { parseEther } from 'ethers/lib/utils'
import { useContract } from 'hooks/useContract'
import useTokensApproval from 'hooks/useTokenApproval'
import { useEffect, useState } from 'react'
import { useAppSelector } from 'state/hooks'
import { ICollateral, selectCurrentRToken } from 'state/reserve-tokens/reducer'

const STATUS = {
  PRECHECK: 'PRECHECK',
  APPROVING: 'APPROVING',
  VALIDATING: 'VALIDATING',
  ISSUING: 'ISSUING',
  SUBMITTED: 'SUBMITTED',
  REJECTED: 'REJECTED',
}

// TODO: @deprecated - remove
const IssuanceTransactionModal = ({
  amount,
  onClose,
}: {
  onClose(): void
  amount: string
}) => {
  const rToken = useAppSelector(selectCurrentRToken)
  const contract = useContract(rToken?.id, MainInterface)
  const { state: issueState, send: issue } = useContractFunction(
    contract as IMain,
    'issue',
    { transactionName: 'Issue RToken' }
  )

  const tokens = (rToken?.vault.collaterals ?? ([] as ICollateral[])).map(
    (collateral) => collateral.token.address
  )
  const { send: requestApproval, state } = useTokensApproval(tokens)
  const tokensHasAllowance = false
  const [issueStatus, setIssueStatus] = useState(STATUS.APPROVING)

  useEffect(() => {
    const action = async () => {
      const result = await requestApproval(rToken?.id ?? '', parseEther(amount))
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

  if (!rToken) {
    return null
  }

  return (
    <Modal open onClose={onClose} title="Transaction status">
      <div style={{ textAlign: 'center', padding: 20 }}>
        <b>Status: {issueStatus}</b>
      </div>
      {rToken.vault.collaterals.map(({ token }) => (
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
          Issue ${amount} {rToken.rToken.symbol}
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
