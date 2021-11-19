import { useEffect, useMemo, useState } from 'react'
import styled from '@emotion/styled'
import { formatEther, parseEther } from '@ethersproject/units'
import { ethers } from 'ethers'
import { useEthers, useContractCall, useContractFunction } from '@usedapp/core'
import { Flex, Text, Box, Button } from 'theme-ui'
import RSR from '../../abis/RSR.json'
import Insurance from '../../abis/Insurance.json'
import { DEPOSIT_STATUS } from '../../constants'
import { useIsTransactionConfirmed } from '../../hooks/useTransaction'
import Card from '../card'

// const InsuranceContract = new ethers.Contract(INSURANCE_ADDRESS, Insurance)
const insuranceInterface = new ethers.utils.Interface(Insurance)
const RsrInterface = new ethers.utils.Interface(RSR)
// const RSRContract = new ethers.Contract(RSR_ADDRESS, RSR)

const InputContainer = styled(Box)`
  display: flex;
  align-items: flex-end;

  div {
    flex-grow: 1;
  }
`

type DepositStatusProps = {
  amount: string
  approveTx?: string
  status: string
  onStake(): void
}

type IStakeStatus = {
  status: string
  amount: string
  approveTx?: string
}

const DepositStatus = ({
  amount,
  approveTx,
  status,
  onStake,
}: DepositStatusProps) => {
  const isApproved = useIsTransactionConfirmed(approveTx)

  return (
    <Card title="Deposit status">
      <Text>
        <b>Status:</b> {status}
      </Text>
      <Text>
        <b>Amount:</b> {amount}
      </Text>
      {status === DEPOSIT_STATUS.APPROVED && isApproved && (
        <Button onClick={() => onStake()}>Confirm stake</Button>
      )}
    </Card>
  )
}

DepositStatus.defaultProps = {
  approveTx: '',
}

/**
 * Stake component
 *
 * @returns React
 */
const Stake = () => {
  const { account, chainId } = useEthers()
  // const InsuranceContract = useMemo(
  //   () => new ethers.Contract(getAddress(chainId, 'INSURANCE'), Insurance),
  //   [chainId]
  // )
  // const RSRContract = useMemo(
  //   () => new ethers.Contract(getAddress(chainId, 'RSR'), RSR),
  //   [chainId]
  // )

  // const [allowance] =
  //   useContractCall({
  //     abi: RsrInterface,
  //     address: RSRContract.address,
  //     method: 'allowance',
  //     args: [account, InsuranceContract?.address],
  //   }) ?? []

  // const [earned] =
  //   useContractCall({
  //     abi: insuranceInterface,
  //     address: InsuranceContract?.address,
  //     method: 'earned',
  //     args: [account],
  //   }) ?? []

  // Stake component
  const [stakeAmount, setStakeAmount] = useState('0')
  const [unstakeAmount, setUnstakeAmount] = useState('0')
  const [stakeStatus, setStakeStatus] = useState<IStakeStatus | undefined>(
    undefined
  )
  // const [isOpen, openModal] = useState(false)

  // const { state: stakeState, send: stake } = useContractFunction(
  //   InsuranceContract,
  //   'stake',
  //   { transactionName: 'Add RSR to Insurance pool' }
  // )
  // const { send: unstake } = useContractFunction(InsuranceContract, 'unstake', {
  //   transactionName: 'Remove RSR from Insurance Pool',
  // })
  // const { state: approve, send: approveAmount } = useContractFunction(
  //   RSRContract,
  //   'approve',
  //   { transactionName: 'Approve RSR for Insurance' }
  // )

  // const handleStake = (amount = allowance) => {
  //   stake(amount)
  //   setStakeStatus({
  //     amount: formatEther(amount),
  //     status: DEPOSIT_STATUS.CONFIRMED,
  //   })
  // }

  // const handleStakeApprove = () => {
  //   const amount = parseEther(stakeAmount)

  //   if (
  //     allowance &&
  //     Number(formatEther(allowance)) >= Number(formatEther(amount))
  //   ) {
  //     handleStake(amount)
  //   } else {
  //     approveAmount(InsuranceContract.address, amount)
  //     setStakeStatus({
  //       status: DEPOSIT_STATUS.PENDING_APPROVAL,
  //       amount: stakeAmount,
  //     })
  //     setStakeAmount('0')
  //   }
  // }

  // const handleUnstake = () => {
  //   unstake(parseEther(unstakeAmount))
  //   setUnstakeAmount('0')
  // }

  // // RSR Approve
  // useEffect(() => {
  //   if (approve.status === 'Success' && approve.receipt) {
  //     setStakeStatus({
  //       ...(stakeStatus as IStakeStatus),
  //       status: DEPOSIT_STATUS.APPROVED,
  //       approveTx: approve?.transaction?.hash,
  //     })
  //   } else if (approve?.status === 'Fail') {
  //     setStakeStatus({
  //       ...(stakeStatus as IStakeStatus),
  //       status: DEPOSIT_STATUS.REJECTED,
  //     })
  //   }
  // }, [approve.status])

  // // Insurance stake
  // useEffect(() => {
  //   if (stakeState.status === 'Success' && stakeState.receipt) {
  //     setStakeStatus({
  //       ...(stakeStatus as IStakeStatus),
  //       status: DEPOSIT_STATUS.COMPLETED,
  //     })
  //   }

  //   if (stakeState.status === 'Fail' || stakeState.status === 'Exception') {
  //     setStakeStatus({
  //       ...(stakeStatus as IStakeStatus),
  //       status: DEPOSIT_STATUS.FAILED,
  //     })
  //   }
  // }, [stakeState.status])

  return (
    <Card title="Stake">
      <span>hola</span>
    </Card>
  )
}

export default Stake
