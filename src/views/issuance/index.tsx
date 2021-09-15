import { useCallback, useEffect, useState } from 'react'
import { BigNumberish, ethers } from 'ethers'
import { Card, Modal, Button, TextField, Spinner } from '@shopify/polaris'
import { utils } from 'ethers'
import Container from '../../components/container'
import { RTOKEN_ADDRESS } from '../../constants/addresses'
import RTokenAbi from '../../abis/RToken.json'
import ERC20Abi from '../../abis/RToken.json'
import { RToken } from '../../abis/types'
import useMultiContractFunction, {
  IContractCall,
} from '../../hooks/usePromiseTransactions'
import useRToken, { IRTokenInfo, IBasketToken } from '../../hooks/useRToken'
import { parseEther } from 'ethers/lib/utils'
import {
  useContractCall,
  useContractCalls,
  useContractFunction,
  useEthers,
  useTokenBalance,
} from '@usedapp/core'
import Transactions from '../../components/transactions'
import styled from 'styled-components'
import { Box, Flex } from 'rebass'
import useTokensApproval from '../../hooks/useTokenApproval'
import useTokensHasAllowance from '../../hooks/useTokensHasAllowance'
import { useRTokenContract } from '../../hooks/useContract'

const RTokenContract = new ethers.Contract(RTOKEN_ADDRESS, RTokenAbi)
const ERC20Contract = new ethers.Contract(RTOKEN_ADDRESS, ERC20Abi)

const InputContainer = styled(Box)`
  display: flex;
  align-items: flex-end;

  div {
    flex-grow: 1;
  }
`

const BasketToken = ({ data }: { data: IBasketToken }) => {
  return (
    <div>
      <b>Name: </b> {data.name} | <b>Symbol: </b> {data.symbol} |{' '}
      <b>Balance: </b> {data.balance ? utils.formatEther(data.balance) : ''}
    </div>
  )
}

const RTokenInfo = ({ data }: { data: IRTokenInfo }) => (
  <Card sectioned title="RToken info">
    <b>Symbol: </b> {data.symbol}
    <br />
    <b>Balance: </b> {data.balance ? utils.formatEther(data.balance) : ''}
    <br />
    <br />
    <h3>
      <b>Basket Tokens</b>
    </h3>
    <br />
    {(data?.basket || []).map((token, index) => (
      <BasketToken key={token.address} data={token} />
    ))}
  </Card>
)

const getApprovalContractFn = (
  tokens: IBasketToken[] | undefined
): IContractCall[] => {
  if (!tokens) return []

  return tokens.map((basketToken) => ({
    contract: ERC20Contract.attach(basketToken.address),
    functionName: 'approve',
    options: {
      transactionName: `Approve ${basketToken.name} for RToken issuance`,
    },
  }))
}

const STATUS = {
  PRECHECK: 'PRECHECK',
  APPROVING: 'APPROVING',
  VALIDATING: 'VALIDATING',
  ISSUING: 'ISSUING',
  SUBMITTED: 'SUBMITTED',
  REJECTED: 'REJECTED',
}

const IssuanceTransactionModal = ({
  rToken,
  amount,
  onClose,
}: {
  onClose(): void
  amount: string
  rToken: IRTokenInfo
}) => {
  const contract = useRTokenContract(rToken.address, false)
  const { state: issueState, send: issue } = useContractFunction(
    contract as RToken,
    'issue',
    { transactionName: 'Issue RToken' }
  )
  const tokens = (rToken?.basket ?? []).map((bsk) => bsk.address)
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
      {!!rToken.basket &&
        rToken.basket.map((token) => (
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
              {state[token.address] === 'PENDING' && <Spinner size="small" />}
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
          {issueStatus === STATUS.ISSUING && <Spinner size="small" />}
          {issueStatus === STATUS.VALIDATING && <Spinner size="small" />}
          {issueStatus === STATUS.SUBMITTED && 'SUBMITTED'}
        </div>
      </div>
    </Modal>
  )
}

const Redeem = ({
  address,
  balance,
}: {
  address: string
  balance: BigNumberish
}) => {
  const [amount, setAmount] = useState('')

  return (
    <>
      <InputContainer mx={2} width={1 / 2}>
        <TextField
          placeholder="Redeem amount"
          label="Redeem amount"
          value={amount}
          onChange={setAmount}
        />
        <Button onClick={() => {}}>Issue</Button>
      </InputContainer>
    </>
  )
}

const Issue = ({ rToken }: { rToken: IRTokenInfo }) => {
  const [amount, setAmount] = useState('1')
  const [modal, setModal] = useState(false)

  return (
    <>
      <InputContainer mx={2} width={1 / 2}>
        <TextField
          placeholder="Issue amount"
          label="Issue ammount"
          value={amount}
          onChange={setAmount}
        />
        <Button onClick={() => setModal(true)}>Issue</Button>
      </InputContainer>
      {modal && (
        <IssuanceTransactionModal
          rToken={rToken}
          amount={amount}
          onClose={() => setModal(false)}
        />
      )}
    </>
  )
}

const Issuance = () => {
  const [state, loading] = useRToken(RTOKEN_ADDRESS)

  if (loading) {
    return <div>Loading...</div>
  }

  // const issue = async () => {
  //   const tStatus = await send(
  //     (state?.basket ?? []).map((bskToken) => [RTOKEN_ADDRESS, parseEther('1')])
  //   )
  //   console.log('finish running transactions', tStatus)
  // }

  return (
    <Container pt={4}>
      <RTokenInfo data={state} />
      <Card sectioned title="Issue and Redemption">
        <Flex mx={-2}>
          <Issue rToken={state} />
          <Redeem address={state.address} balance={state.balance || 0} />
        </Flex>
      </Card>

      <Transactions />
    </Container>
  )
}

export default Issuance
