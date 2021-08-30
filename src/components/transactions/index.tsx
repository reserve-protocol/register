import { Card } from '@shopify/polaris'
import { useTransactions } from '@usedapp/core'
import { Text } from 'rebass'
import { formatEther } from '@ethersproject/units'
import { BigNumber, ethers, Transaction } from 'ethers'
import { RSR_ADDRESS, INSURANCE_ADDRESS } from '../../constants/addresses'
import RSR from '../../abis/RSR.json'
import Insurance from '../../abis/Insurance.json'
import {
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/providers'

const INTERFACES: { [x: string]: ethers.utils.Interface } = {
  [RSR_ADDRESS]: new ethers.utils.Interface(RSR),
  [INSURANCE_ADDRESS]: new ethers.utils.Interface(Insurance),
}

type IItem = {
  data: {
    transaction: TransactionResponse
    transactionName?: string
    receipt?: TransactionReceipt
    submittedAt: number
  }
}

const Item = ({
  data: { transaction, transactionName, receipt, submittedAt },
}: IItem) => {
  const abi = INTERFACES[transaction.to as string]
  let argumentsString = null

  if (abi) {
    const parsed = abi.parseTransaction(transaction)
    argumentsString = parsed.functionFragment.inputs.map((input) => (
      <Text key={input.name}>
        <b>{input.name}:</b>
        {input.type === 'uint256'
          ? formatEther(parsed.args[input.name])
          : parsed.args[input.name]}
      </Text>
    ))
  }

  return (
    <Card title={transactionName} key={transaction.hash} sectioned>
      <Text>
        <b>Status:</b> {receipt ? 'Confirmed' : 'Pending'}
      </Text>
      <Text>
        <b>To:</b> {transaction.to}
      </Text>
      <Text>
        <b>Nonce:</b> {transaction.nonce}
      </Text>
      <Text>
        <b>Transaction Hash:</b> {transaction.hash}
      </Text>
      <Text>
        <b>Gas Price:</b> {formatEther(transaction.gasPrice as BigNumber)}
      </Text>
      <Text>
        <b>Gas Limit:</b> {formatEther(transaction.gasLimit)}
      </Text>
      {argumentsString && (
        <>
          <Text fontSize={2} py={2}>
            <b>Arguments</b>
          </Text>
          {argumentsString}
        </>
      )}
      {!!receipt && (
        <>
          <Text fontSize={2} py={2}>
            <b>Block</b>
          </Text>
          <Text>
            <b>Block Number: </b>
            {receipt.blockNumber}
          </Text>
          <Text>
            <b>Block Hash: </b>
            {receipt.blockHash}
          </Text>
          <Text>
            <b>Gas Used: </b>
            {formatEther(receipt.gasUsed)}
          </Text>
        </>
      )}
    </Card>
  )
}

const Transactions = () => {
  const { transactions } = useTransactions()

  return (
    <Card title="Recent transactions" sectioned>
      <div style={{ maxHeight: 500, overflow: 'scroll' }}>
        {transactions.map((data) => (
          <Item key={data.transaction.hash} data={data} />
        ))}
      </div>
      {!transactions.length && <Text>No recent transactions...</Text>}
    </Card>
  )
}

export default Transactions
