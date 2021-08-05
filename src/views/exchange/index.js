import { useState } from 'react'
import { Page } from '@shopify/polaris';
import styled from 'styled-components'
import { ethers } from 'ethers'
import { useEtherBalance, useEthers, useContractCall, useTokenBalance, useTransactions, useContractFunction } from '@usedapp/core'
import { formatEther } from '@ethersproject/units'
import { Contract } from '@ethersproject/contracts'
import RToken from '../../abis/RToken.json'
import RSR from '../../abis/RSR.json'
import { RTOKEN_ADDRESS, RSR_ADDRESS } from '../../constants/addresses'
import Container from '../../components/container'
import { Card, TextField, Button } from '@shopify/polaris'
import { Text, Flex, Box } from 'rebass'

const InputContainer = styled(Box)`
  display: flex;
  align-items: flex-end;

  div {
    flex-grow: 1;
  }
`

const simpleContractInterface = new ethers.utils.Interface(RSR)
// const greeterAddress = '0xa51c1fc2f0d1a1b8494ed1fe312d7c3a78ed91c0'
// const GreeterContract = new Contract(greeterAddress, Greeter.abi)

const Exchange = () => {
  const { account } = useEthers()
  const { transactions } = useTransactions()
  const etherBalance = useTokenBalance(RSR_ADDRESS, account)
  // Stake component
  const [stakeAmount, setStakeAmount] = useState(0)
  const [unstakeAmount, setUnstakeAmount] = useState(0)

  const [symbol] = useContractCall({
    abi: simpleContractInterface,
    address: RSR_ADDRESS,
    method: 'symbol',
  }) ?? []

  const [totalSupply] = useContractCall({
    abi: simpleContractInterface,
    address: RSR_ADDRESS,
    method: 'totalSupply',
  })?? []

  // const { state, send } = useContractFunction(GreeterContract, 'setGreeting')

  // const handleChangeGreet = () => {
  //   send('Test change greeting from contract')
  // }

  const currentBalance = etherBalance ? parseFloat(formatEther(etherBalance)).toFixed(3) : 0


  console.log('transactions', transactions)

  return (
    <Container mt={4}>
      { account && (
        <Card title="State" sectioned>
          <Text><b>RSR Balance:</b> {currentBalance} </Text>
          <Flex mt={2}>
            <Text><b>RSR Total supply:</b> {totalSupply && parseFloat(formatEther(totalSupply))}</Text>
          </Flex>
        </Card>
      ) }
      <Card title="Stake" sectioned>
        <Flex mx={-2}>
          <InputContainer mx={2} width={1/2}>
            <TextField 
              placeholder="amount..." 
              label="Stake amount" 
              value={stakeAmount}
              onChange={setStakeAmount} 
            />
            <Button>Stake</Button>
          </InputContainer>
          <InputContainer mx={2} width={1/2}>
            <TextField 
              placeholder="amount..." 
              label="Unstake amount"
              value={unstakeAmount}
              onChange={setUnstakeAmount}
            />
            <Button>Unstake</Button>
          </InputContainer>
        </Flex>
        <Flex alignItems="center" mt={4}>
          <Text mr={2}><b>Total earnings:</b> 0</Text>
          <Button primary>Withdraw</Button>
        </Flex>
      </Card>
    </Container>
  )
}

export default Exchange
