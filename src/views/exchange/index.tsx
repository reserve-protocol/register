import { useMemo, useState } from 'react'
import styled from '@emotion/styled'
import { ethers } from 'ethers'
import {
  useGasPrice,
  useBlockNumber,
  useEthers,
  useContractCall,
  useTokenBalance,
  useContractFunction,
} from '@usedapp/core'
import { Text, Flex, Box, Button } from 'theme-ui'
import RSR from '../../abis/RSR.json'
import PrevRSR from '../../abis/PrevRSR.json'
import { getAddress } from '../../constants/addresses'
import Container from '../../components/container'
import Transactions from '../../components/transactions'
import Stake from '../../components/stake'
import Deposits from '../../components/deposits'
import Card from '../../components/card'

const InputContainer = styled(Box)`
  display: flex;
  align-items: flex-end;

  div {
    flex-grow: 1;
  }
`

const RsrInterface = new ethers.utils.Interface(RSR)
const prevRSRInterface = new ethers.utils.Interface(PrevRSR)

const Exchange = () => {
  const { account, chainId } = useEthers()
  const etherBalance = useTokenBalance(getAddress(chainId, 'RSR'), account)
  const stakedAmount = useTokenBalance(
    getAddress(chainId, 'INSURANCE'),
    account
  )
  const RSRContract = useMemo(
    () => new ethers.Contract(getAddress(chainId, 'RSR'), RSR),
    [chainId]
  )
  const gasPrice = useGasPrice()
  const blockNumber = useBlockNumber()
  const [transferAmount, setTransferAmount] = useState('0')
  const [transferAccount, setTransferAccount] = useState('')

  const [isPrevPaused] =
    useContractCall({
      abi: prevRSRInterface,
      address: getAddress(chainId, 'PREV_RSR'),
      method: 'paused',
      args: [],
    }) ?? []

  const [totalSupply] =
    useContractCall({
      abi: RsrInterface,
      address: getAddress(chainId, 'RSR'),
      method: 'totalSupply',
      args: [],
    }) ?? []

  const { send: transfer } = useContractFunction(RSRContract, 'transfer', {
    transactionName: 'Transfer RSR',
  })

  const handleTransfer = () => {
    transfer(transferAccount, ethers.utils.parseEther(transferAmount))
  }

  const currentBalance = etherBalance
    ? parseFloat(ethers.utils.formatEther(etherBalance)).toFixed(3)
    : 0

  return (
    <Container pt={4} pb={4}>
      {account && (
        <Card title="State" mb={3}>
          <Text>
            <b>RSR Balance:</b> {currentBalance}{' '}
          </Text>
          <Text mt={2}>
            <b>Staked Amount:</b>{' '}
            {stakedAmount ? ethers.utils.formatEther(stakedAmount) : 0}
          </Text>
          <Flex mt={2}>
            <Text>
              <b>RSR Total supply:</b>{' '}
              {totalSupply && parseFloat(ethers.utils.formatEther(totalSupply))}
            </Text>
          </Flex>
          {!!gasPrice && (
            <Text mt={2}>
              <b>Gas Price: </b>
              {ethers.utils.formatEther(gasPrice)}
            </Text>
          )}
          <Text mt={2}>
            <b>Latest block:</b> {blockNumber || 0}
          </Text>
        </Card>
      )}
      <Card title="Is PrevRSR Paused" mb={3}>
        <Flex>
          <Text>{isPrevPaused ? 'Yes' : 'No'}</Text>
        </Flex>
      </Card>
      <Card title="Send" mb={3}>
        <Flex mx={-2}>
          {/* <InputContainer mx={2}>
            <TextField
              placeholder="amount..."
              label="Send amount"
              value={transferAmount}
              onChange={(value) => setTransferAmount(value)}
            />
            <TextField
              placeholder="to"
              label="To"
              value={transferAccount}
              onChange={setTransferAccount}
            />
            <Button onClick={handleTransfer}>Transfer</Button>
          </InputContainer> */}
        </Flex>
      </Card>
      <Stake />
      <Transactions />
      <Deposits />
    </Container>
  )
}

export default Exchange
