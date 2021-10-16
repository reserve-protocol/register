import {
  getExplorerTransactionLink,
  useEthers,
  useTransactions,
} from '@usedapp/core'
import { Box, Text } from 'theme-ui'
import { formatEther } from '@ethersproject/units'
import { BigNumber } from 'ethers'
// import { RSR_ADDRESS, INSURANCE_ADDRESS } from '../../constants/addresses'
import {
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/providers'
import { Falsy } from 'types'
import Card from '../card'

type IItem = {
  data: {
    transaction: TransactionResponse
    transactionName?: string
    receipt?: TransactionReceipt
    submittedAt: number
  }
  chainId: number
}

const Item = ({
  data: { transaction, transactionName, receipt },
  chainId,
}: IItem) => {
  // const abi = INTERFACES[transaction.to as string]
  const abi: any = null
  let argumentsString = null

  if (abi) {
    const parsed = abi.parseTransaction(transaction)
    argumentsString = parsed.functionFragment.inputs.map((input: any) => (
      <Text key={input.name}>
        <b>{input.name}:</b>
        {input.type === 'uint256'
          ? formatEther(parsed.args[input.name])
          : parsed.args[input.name]}
      </Text>
    ))
  }

  return (
    <Box key={transaction.hash}>
      <Text sx={{ display: 'block', fontWeight: 500 }} mb={2}>
        {transactionName}
      </Text>
      <Text>
        <b>Status:</b> {receipt ? 'Confirmed' : 'Pending'}
      </Text>
      <br />
      <Text>
        <b>To:</b> {transaction.to}
      </Text>
      {/* <br />
      <Text>
        <b>Nonce:</b> {transaction.nonce}
      </Text> */}
      <br />
      <Text>
        <b>Transaction Hash:</b>{' '}
        <a href={getExplorerTransactionLink(transaction.hash, chainId)}>
          View on etherscan
        </a>
      </Text>
      <br />
      <Text>
        <b>Gas Price:</b> {formatEther(transaction.gasPrice as BigNumber)}
      </Text>
      <br />
      <Text>
        <b>Gas Limit:</b> {formatEther(transaction.gasLimit)}
      </Text>
      {argumentsString && (
        <>
          <br />
          <Text py={2}>
            <b>Arguments</b>
          </Text>
          {argumentsString}
        </>
      )}
      {!!receipt && (
        <>
          <br />
          <Text>
            <b>Gas Used: </b>
            {formatEther(receipt.gasUsed)}
          </Text>
          <br />

          <Text>
            <b>Block Number: </b>
            {receipt.blockNumber}
          </Text>
          {/* <br />
          <Text>
            <b>Block Hash: </b>
            {receipt.blockHash}
          </Text> */}
        </>
      )}
    </Box>
  )
}

const Transactions = () => {
  const { chainId } = useEthers()
  const { transactions } = useTransactions()

  if (!transactions.length || !chainId) {
    return <Text>No recent transactions...</Text>
  }

  return (
    <Box sx={{ maxHeight: 500, overflow: 'auto' }}>
      {transactions.map((data) => (
        <Item key={data.transaction.hash} chainId={chainId} data={data} />
      ))}
    </Box>
  )
}

export default Transactions
