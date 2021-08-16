import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { formatEther, parseEther } from '@ethersproject/units'
import { ethers } from 'ethers'
import { Card, TextField, Button, Modal, buttonFrom } from '@shopify/polaris'
import {
  useGasPrice,
  useEthers,
  useContractCall,
  useContractFunction,
} from '@usedapp/core'
import { Flex, Text, Box } from 'rebass'
import { INSURANCE_ADDRESS, RSR_ADDRESS } from '../../constants/addresses'
import RSR from '../../abis/RSR.json'
import Insurance from '../../abis/Insurance.json'
import { DEPOSIT_STATUS } from '../../constants'
import { useIsTransactionConfirmed } from '../../hooks/useTransaction'

const InsuranceContract = new ethers.Contract(INSURANCE_ADDRESS, Insurance)
const insuranceInterface = new ethers.utils.Interface(Insurance)
const RsrInterface = new ethers.utils.Interface(RSR)
const RSRContract = new ethers.Contract(RSR_ADDRESS, RSR)

const InputContainer = styled(Box)`
  display: flex;
  align-items: flex-end;

  div {
    flex-grow: 1;
  }
`

const DepositStatus = ({ amount, approveTx, status, onStake }) => {
  const isApproved = useIsTransactionConfirmed(approveTx)

  return (
    <Card title="Deposit status" sectioned>
      <Text>
        <b>Status:</b> {status}
      </Text>
      <Text>
        <b>Amount:</b> {amount}
      </Text>
      {status === DEPOSIT_STATUS.APPROVED && isApproved && (
        <Button onClick={() => onStake()} primary>
          Confirm stake
        </Button>
      )}
    </Card>
  )
}

/**
 * Stake component
 *
 * @returns React
 */
const Stake = () => {
  const { account } = useEthers()

  const [allowance] =
    useContractCall({
      abi: RsrInterface,
      address: RSR_ADDRESS,
      method: 'allowance',
      args: [account, INSURANCE_ADDRESS],
    }) ?? []

  const [earned] =
    useContractCall({
      abi: insuranceInterface,
      address: INSURANCE_ADDRESS,
      method: 'earned',
      args: [account],
    }) ?? []

  // Stake component
  const [stakeAmount, setStakeAmount] = useState(0)
  const [unstakeAmount, setUnstakeAmount] = useState(0)
  const [stakeStatus, setStakeStatus] = useState(null)
  const [isOpen, openModal] = useState(false)

  const { state: stakeState, send: stake } = useContractFunction(
    InsuranceContract,
    'stake',
    { transactionName: 'Add RSR to Insurance pool' }
  )
  const { state: unstakeState, send: unstake } = useContractFunction(
    InsuranceContract,
    'unstake',
    { transactionName: 'Remove RSR from Insurance Pool' }
  )
  const { state: approve, send: approveAmount } = useContractFunction(
    RSRContract,
    'approve',
    { transactionName: 'Approve RSR for Insurance' }
  )

  const handleStake = (amount = allowance) => {
    stake(amount)
    setStakeStatus({
      amount: formatEther(amount),
      status: DEPOSIT_STATUS.CONFIRMED,
    })
  }

  const handleStakeApprove = () => {
    const amount = parseEther(stakeAmount)

    if (
      allowance &&
      Number(formatEther(allowance)) >= Number(formatEther(amount))
    ) {
      handleStake(amount)
    } else {
      approveAmount(INSURANCE_ADDRESS, amount)
      setStakeStatus({ status: DEPOSIT_STATUS.PENDING, amount: stakeAmount })
      setStakeAmount(0)
    }
  }

  const handleUnstake = () => {
    unstake(parseEther(unstakeAmount))
    setUnstakeAmount(0)
  }

  // RSR Approve
  useEffect(() => {
    console.log('approve status', approve)
    if (approve.status === 'Success' && approve.receipt) {
      setStakeStatus({
        ...stakeStatus,
        status: DEPOSIT_STATUS.APPROVED,
        approveTx: approve.transaction.hash,
      })
    } else if (approve.status === 'Rejection') {
      setStakeStatus({ ...stakeStatus, status: DEPOSIT_STATUS.REJECTED })
    }
  }, [approve.status])

  // Insurance stake
  useEffect(() => {
    if (stakeState.status === 'Success' && stakeState.receipt) {
      setStakeStatus({ ...stakeStatus, status: DEPOSIT_STATUS.COMPLETED })
    }

    console.log('state', stakeState)

    if (
      stakeState.status === 'Rejection' ||
      stakeState.status === 'Exception'
    ) {
      setStakeStatus({ ...stakeStatus, status: DEPOSIT_STATUS.FAILED })
    }
  }, [stakeState.status])

  return (
    <Card title="Stake" sectioned>
      <Flex mx={-2}>
        <InputContainer mx={2} width={1 / 2}>
          <TextField
            placeholder="amount..."
            label="Stake amount"
            value={stakeAmount}
            onChange={setStakeAmount}
          />
          <Button onClick={handleStakeApprove}>Stake</Button>
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
      {stakeStatus && <DepositStatus {...stakeStatus} onStake={handleStake} />}
      <Flex mt={4}>
        <Text>
          <b>Allowance:</b> {allowance ? formatEther(allowance) : 0}
        </Text>
      </Flex>
      <Flex alignItems="center" mt={2}>
        <Text mr={2}>
          <b>Total earnings:</b> {earned ? formatEther(earned) : 0}
        </Text>
        <Button
          primary
          disabled={!earned || parseInt(formatEther(earned)) === 0}
        >
          Withdraw
        </Button>
      </Flex>
    </Card>
  )
}

export default Stake
