import { useMemo, useState } from 'react'
import {
  useContractFunction,
  TransactionStatus,
  useTokenBalance,
  useEthers,
} from '@usedapp/core'
import { ethers } from 'ethers'
import { Button, Card, Input } from 'components'
import { ERC20Mock, Factory } from 'abis'
import { Flex, Text, Select, Box } from 'theme-ui'
import { gql, useQuery, useSubscription } from '@apollo/client'
import styled from '@emotion/styled'
import { parseEther, formatEther } from '@ethersproject/units'

const FactoryContract = new ethers.Contract(
  '0x70e0bA845a1A0F2DA3359C97E0285013525FFC49',
  Factory
)

const TXStatus = ({ status }: { status: TransactionStatus }) => {
  if (!status) {
    return null
  }

  return <Text>Status: {status.status}</Text>
}

type IToken = { name: string; symbol: string; address: string }

const ACTIONS = {
  TRANSFER: 'TRANSFER',
  MINT: 'MINT',
  BURN: 'BURN',
}

const TokenView = ({ token, ...props }: { token: IToken }) => {
  const { account } = useEthers()
  const [actionType, setActionType] = useState(ACTIONS.TRANSFER)
  const [to, setTo] = useState('')
  const [amount, setAmount] = useState('')
  const balance = useTokenBalance(token.address, account)
  const contract = useMemo(
    () => new ethers.Contract(token.address, ERC20Mock),
    [token.address]
  )
  const { state, send } = useContractFunction(
    contract,
    actionType.toLowerCase(),
    {
      transactionName: `${actionType} ${token.name}`,
    }
  )

  const handleChangeAction = (event: any) => {
    setActionType(event.target.value)
  }

  const handleAction = () => {
    if (actionType === ACTIONS.BURN) {
      send(parseEther(amount))
    } else {
      send(to, parseEther(amount))
    }

    setTo('')
    setAmount('')
  }

  return (
    <Box mt={3} {...props}>
      <Box mb={3}>
        <Text sx={{ fontWeight: 500 }} mb={2}>
          Balance
        </Text>
        : ${balance ? formatEther(balance) : '0.0'}
      </Box>

      <Text sx={{ fontWeight: 500 }} mb={2}>
        Action
      </Text>
      <Select defaultValue={actionType} onChange={handleChangeAction}>
        {Object.keys(ACTIONS).map((action) => (
          <option value={action}>{action}</option>
        ))}
      </Select>
      <Flex mb={3} mt={3}>
        {actionType !== ACTIONS.BURN && (
          <Input placeholder="To" mr={3} onChange={setTo} />
        )}
        <Input placeholder="Amount" onChange={setAmount} />
      </Flex>
      <Button onClick={handleAction} mr={3}>
        {actionType}
      </Button>
      <TXStatus status={state} />
    </Box>
  )
}

const GET_TOKENS = gql`
  subscription GetTokens {
    tokens {
      name
      symbol
      address
    }
  }
`

const TokenBox = styled(Box)`
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 10px;
  &:hover {
    cursor: pointer;
    background-color: #f5f5f5;
  }
`

const FactoryView = () => {
  const { data, loading } = useSubscription(GET_TOKENS, {
    variables: { orderBy: 'symbol', where: {} },
  })
  const [name, setName] = useState('')
  const [symbol, setSymbol] = useState('')
  const [token, setToken] = useState<null | IToken>(null)

  const { state, send } = useContractFunction(FactoryContract, 'deployToken', {
    transactionName: 'Deploy token',
  })

  const handleSelectToken = (selectedToken: IToken) => {
    setToken(selectedToken)
  }

  const handleDeploy = () => {
    send(name, symbol)
    setName('')
    setSymbol('')
  }

  return (
    <Card title="Factory" mb={3}>
      <Text
        sx={{
          display: 'block',
          fontWeight: 500,
          fontSize: 2,
          marginTop: 3,
          marginBottom: 2,
        }}
      >
        Create RToken
      </Text>
      <Flex mb={3}>
        <Input
          placeholder="Token Name"
          mr={3}
          onChange={(value: string) => setName(value)}
        />
        <Input
          placeholder="Token Symbol"
          onChange={(value: string) => setSymbol(value)}
        />
      </Flex>
      <Button mr={3} onClick={handleDeploy}>
        Deploy
      </Button>
      <TXStatus status={state} />
      <Text
        sx={{
          display: 'block',
          fontWeight: 500,
          fontSize: 2,
          marginTop: 3,
          marginBottom: 2,
        }}
      >
        RTokens
      </Text>
      <Flex mb={-3}>
        {' '}
        {!loading &&
          data.tokens.map((tkn: IToken) => (
            <TokenBox
              sx={{
                backgroundColor: token?.symbol === tkn.symbol ? '#ccc' : 'auto',
              }}
              mr={2}
              mb={3}
              key={tkn.symbol}
              onClick={() => handleSelectToken(tkn)}
            >
              {tkn.name} ${tkn.symbol}
            </TokenBox>
          ))}
      </Flex>

      {!!token && <TokenView token={token} />}
    </Card>
  )
}

export default FactoryView
