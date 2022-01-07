import { useState } from 'react'
import { Box, Flex, Text } from '@theme-ui/components'
import { Button, Card, Input } from 'components'
import { ERC20, Main } from 'abis'
import { StringMap } from 'types'
import { useContract } from 'hooks/useContract'

const contracts: StringMap = {
  Main,
  ERC20,
}

const ContractPlayground = (props: any) => {
  const [currentContract, setCurrentContract] = useState('')
  const [abi, setAbi] = useState('ERC20')
  const [params, setParams] = useState([] as string[])
  const [method, setMethod] = useState('')
  const [error, setError] = useState('')
  const contract = useContract(currentContract, contracts[abi], true)
  const [lastResult, setResult] = useState({} as any)

  const handleAdd = () => {
    setParams([...params, ''])
  }

  const handleRemove = () => {
    setParams(params.slice(0, params.length - 1))
  }

  const handleParamChange = (index: number, value: string) => {
    setParams([...params.slice(0, index), value, ...params.slice(index + 1)])
  }

  const handleExec = async () => {
    if (!contract) return
    setError('')

    try {
      const result = await contract[method](...params)
      console.log('[Contract execution result]', result)
      setResult(result)
    } catch (e: any) {
      setError(e?.message ?? 'Unknown error')
    }
  }

  return (
    <Box mt={3} {...props}>
      <Text sx={{ fontSize: 4, display: 'block' }} mb={2}>
        Contract Playground
      </Text>
      <Card>
        <Box>
          <Text>Components Addresses</Text>
        </Box>
        <Box>
          <Text>Contract</Text>
          <Flex mt={2}>
            {Object.keys(contracts).map((contractName) => (
              <Box
                key={contractName}
                sx={{
                  border: '1px solid #ccc',
                  padding: 2,
                  borderRadius: 8,
                  cursor: 'pointer',
                  backgroundColor: contractName === abi ? 'primary' : 'none',
                  color: contractName === abi ? 'white' : 'inherit',
                }}
                mr={3}
                onClick={() => setAbi(contractName)}
              >
                {contractName}
              </Box>
            ))}
          </Flex>
        </Box>
        <Box mt={2}>
          <Text>Contract address</Text>
          <Input
            placeholder="Contract address"
            value={currentContract}
            onChange={setCurrentContract}
          />
        </Box>
        <Box mt={2}>
          <Text>Method</Text>
          <Input placeholder="Method" value={method} onChange={setMethod} />
        </Box>
        {params.map((param, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <Box key={index} mt={2}>
            <Text>Param {index + 1}</Text>
            <Input
              placeholder={`Parameter ${index + 1}`}
              value={param}
              onChange={(value: string) => handleParamChange(index, value)}
            />
          </Box>
        ))}
        {!!error && (
          <Text mt={2} sx={{ display: 'block', color: 'red' }}>
            {error}
          </Text>
        )}
        <Flex mt={3}>
          <Button mr={2} onClick={handleExec} disabled={!method || !contract}>
            Execute
          </Button>
          <Button mr={2} onClick={handleAdd}>
            Add parameter
          </Button>
          {!!params.length && (
            <Button onClick={handleRemove}>Remove param</Button>
          )}
        </Flex>
      </Card>
      <Card mt={2}>
        <Text sx={{ display: 'block' }} mb={2}>
          Last result
        </Text>
        <pre>{JSON.stringify(lastResult, null, 2)}</pre>
      </Card>
    </Box>
  )
}

export default ContractPlayground
