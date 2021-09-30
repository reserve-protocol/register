import { useTransactions } from '@usedapp/core'
import { Text } from 'theme-ui'
import { formatEther } from '@ethersproject/units'
import { BigNumber } from 'ethers'
// import { RSR_ADDRESS, INSURANCE_ADDRESS } from '../../constants/addresses'
import {
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/providers'
import Card from '../card'

// const INTERFACES: { [x: string]: ethers.utils.Interface } = {
//   [RSR_ADDRESS]: new ethers.utils.Interface(RSR),
//   [INSURANCE_ADDRESS]: new ethers.utils.Interface(Insurance),
// }

type IItem = {
  data: {
    transaction: TransactionResponse
    transactionName?: string
    receipt?: TransactionReceipt
    submittedAt: number
  }
}

const Item = ({ data: { transaction, transactionName, receipt } }: IItem) => {
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
    <Card title={transactionName} key={transaction.hash} sectioned>
      <Text>
        <b>Status:</b> {receipt ? 'Confirmed' : 'Pending'}
      </Text>
      <br />
      <Text>
        <b>To:</b> {transaction.to}
      </Text>
      <br />
      <Text>
        <b>Nonce:</b> {transaction.nonce}
      </Text>
      <br />
      <Text>
        <b>Transaction Hash:</b> {transaction.hash}
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
          <br />
          <Text py={2}>
            <b>Block</b>
          </Text>
          <br />
          <Text>
            <b>Block Number: </b>
            {receipt.blockNumber}
          </Text>
          <br />
          <Text>
            <b>Block Hash: </b>
            {receipt.blockHash}
          </Text>
          <br />
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
      <div style={{ maxHeight: 500, overflow: 'auto' }}>
        {transactions.map((data) => (
          <Item key={data.transaction.hash} data={data} />
        ))}
      </div>
      {!transactions.length && <Text>No recent transactions...</Text>}
    </Card>
  )
}

export default Transactions
