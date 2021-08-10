import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { ethers } from 'ethers'
import {
  useGasPrice, useBlockNumber, useEthers, connectContractToSigner, useContractCall, useTokenBalance, useTransactions, useContractFunction,
} from '@usedapp/core'
import { formatEther, parseEther, parseUnits } from '@ethersproject/units'
import {
  Card, TextField, Button, Modal,
} from '@shopify/polaris'
import { Text, Flex, Box } from 'rebass'
import RToken from '../../abis/RToken.json'
import RSR from '../../abis/RSR.json'
import Insurance from '../../abis/Insurance.json'
import PrevRSR from '../../abis/PrevRSR.json'
import {
  RTOKEN_ADDRESS, RSR_ADDRESS, INSURANCE_ADDRESS, PREV_RSR_ADDRESS,
} from '../../constants/addresses'
import Container from '../../components/container'
import Transactions from '../../components/transactions'

const InputContainer = styled(Box)`
  display: flex;
  align-items: flex-end;

  div {
    flex-grow: 1;
  }
`

const simpleContractInterface = new ethers.utils.Interface(RSR)
const insuranceInterface = new ethers.utils.Interface(Insurance)
const prevRSRInterface = new ethers.utils.Interface(PrevRSR)
const InsuranceContract = new ethers.Contract(INSURANCE_ADDRESS, Insurance)
const RSRContract = new ethers.Contract(RSR_ADDRESS, RSR)
const PrevRSRContract = new ethers.Contract(PREV_RSR_ADDRESS, PrevRSR)

const parseAmount = (n) => parseUnits(n, 18)

const Exchange = () => {
  const { account, library } = useEthers()
  const { transactions } = useTransactions()
  const etherBalance = useTokenBalance(RSR_ADDRESS, account)
  const stakedAmount = useTokenBalance(INSURANCE_ADDRESS, account)
  const gasPrice = useGasPrice()
  const blockNumber = useBlockNumber()
  // Stake component
  const [stakeAmount, setStakeAmount] = useState(0)
  const [unstakeAmount, setUnstakeAmount] = useState(0)
  const [transferAmount, setTransferAmount] = useState(0)
  const [transferAccount, setTransferAccount] = useState('')
  const [isOpen, openModal] = useState(false)

  console.log('prev', PREV_RSR_ADDRESS)

  const [isPrevPaused] = useContractCall({
    abi: prevRSRInterface,
    address: PREV_RSR_ADDRESS,
    method: 'paused',
  }) ?? []

  const [totalSupply] = useContractCall({
    abi: simpleContractInterface,
    address: RSR_ADDRESS,
    method: 'totalSupply',
  }) ?? []

  const [earned] = useContractCall({
    abi: insuranceInterface,
    address: INSURANCE_ADDRESS,
    method: 'earned',
    args: [account],
  }) ?? []

  const { state: stakeState, send: stake } = useContractFunction(InsuranceContract, 'stake', { transactionName: 'Add RSR to Insurance pool' })
  const { state: unstakeState, send: unstake } = useContractFunction(InsuranceContract, 'unstake', { transactionName: 'Remove RSR from Insurance Pool' })
  const { state: approve, send: approveAmount } = useContractFunction(RSRContract, 'approve', { transactionName: 'Approve RSR for Insurance' })
  const { state: transferState, send: transfer } = useContractFunction(RSRContract, 'transfer', { transactionName: 'Transfer RSR' })

  const handleStake = () => {
    approveAmount(INSURANCE_ADDRESS, parseAmount(stakeAmount))
  }

  const handleUnstake = () => {
    unstake(parseEther(unstakeAmount))
    setUnstakeAmount(0)
  }

  // useEffect(() => {
  //   if (approve.status === 'Success') {
  //     stake(parseAmount(stakeAmount))
  //     setStakeAmount(0)
  //   }
  // }, [approve.status])

  const handleTransfer = () => {
    transfer(transferAccount, parseAmount(transferAmount))
  }

  const currentBalance = etherBalance ? parseFloat(formatEther(etherBalance)).toFixed(3) : 0

  console.log('transactions', transactions)

  return (
    <Container mt={4}>
      { account && (
        <Card title="State" sectioned>
          <Text>
            <b>RSR Balance:</b>
            {' '}
            {currentBalance}
            {' '}
          </Text>
          <Text mt={2}>
            <b>Staked Amount:</b>
            {' '}
            {stakedAmount ? formatEther(stakedAmount) : 0}
          </Text>
          <Flex mt={2}>
            <Text>
              <b>RSR Total supply:</b>
              {' '}
              {totalSupply && parseFloat(formatEther(totalSupply))}
            </Text>
          </Flex>
          {!!gasPrice && (
          <Text mt={2}>
            <b>Gas Price: </b>
            {formatEther(gasPrice)}
          </Text>
          ) }
          <Text mt={2}>
            <b>Latest block:</b>
            {' '}
            {blockNumber || 0}
          </Text>
        </Card>
      ) }
      <Card title="Is PrevRSR Paused" sectioned>
        <Flex>
          <Text>
            {isPrevPaused ? 'Yes' : 'No'}
          </Text>
        </Flex>
      </Card>
      <Card title="Send" sectioned>
        <Flex mx={-2}>
          <InputContainer mx={2} width={1}>
            <TextField
              placeholder="amount..."
              label="Send amount"
              value={transferAmount}
              onChange={setTransferAmount}
            />
            <TextField
              placeholder="to"
              label="To"
              value={transferAccount}
              onChange={setTransferAccount}
            />
            <Button primary onClick={handleTransfer}>Transfer</Button>
          </InputContainer>
        </Flex>
      </Card>
      <Card title="Stake" sectioned>
        <Flex mx={-2}>
          <InputContainer mx={2} width={1 / 2}>
            <TextField
              placeholder="amount..."
              label="Stake amount"
              value={stakeAmount}
              onChange={setStakeAmount}
            />
            <Button onClick={handleStake}>Stake</Button>
          </InputContainer>
          <InputContainer mx={2} width={1 / 2}>
            <TextField
              placeholder="amount..."
              label="Unstake amount"
              value={unstakeAmount}
              onChange={setUnstakeAmount}
            />
            <Button onClick={handleUnstake}>Unstake</Button>
          </InputContainer>
        </Flex>
        <Flex alignItems="center" mt={4}>
          <Text mr={2}>
            <b>Total earnings:</b>
            {' '}
            {earned ? formatEther(earned) : 0}
          </Text>
          <Button primary disabled={!earned || parseInt(formatEther(earned)) === 0}>Withdraw</Button>
        </Flex>
      </Card>
      <Transactions />
    </Container>
  )
}

export default Exchange
