import BaseBridge from 'abis/BaseBridge'
import { useAtomValue } from 'jotai'
import { walletAtom } from 'state/atoms'
import useSWR from 'swr'
import { Address, Hex, decodeFunctionData, formatEther } from 'viem'
import { L2_BRIDGE_ADDRESS, L2_L1_MESSAGER_ADDRESS } from '../utils/constants'

export type BlockExplorerTransaction = {
  blockHash: string
  blockNumber: string
  confirmations: string
  contractAddress: string
  cumulativeGasUsed: string
  from: string
  gas: string
  gasPrice: string
  gasUsed: string
  hash: string
  input: string
  isError: string
  nonce: string
  timeStamp: string
  to: string
  transactionIndex: string
  txreceipt_status: string
  value: string
}

export type BridgeWithdraw = {
  from: Address
  to: Address
  symbol: string
  amount: bigint
  formattedAmount: string
  blockTimestamp: string
  hash: Hex
}

const API =
  'https://base.blockscout.com/api?action=txlist&module=account&filterby=from&startblock=211&address='

function getWithdrawalTx(
  tx: BlockExplorerTransaction
): BridgeWithdraw | undefined {
  try {
    if (
      tx.to !== L2_L1_MESSAGER_ADDRESS.toLowerCase() &&
      tx.to !== L2_BRIDGE_ADDRESS.toLowerCase()
    ) {
      return undefined
    }

    const call = decodeFunctionData({
      abi: BaseBridge,
      data: tx.input as Hex,
    })

    // ETH withdrawal
    if (tx.to === L2_L1_MESSAGER_ADDRESS.toLowerCase() && tx.value !== '0') {
      const amount = BigInt(tx.value)

      return {
        from: tx.from as Address,
        to: tx.to as Address,
        symbol: 'ETH',
        amount,
        formattedAmount: formatEther(amount),
        blockTimestamp: tx.timeStamp,
        hash: tx.hash as `0x${string}`,
      }
    }

    const amount = (
      call.functionName === 'withdraw' ? call.args[1] : call.args[2]
    ) as bigint

    return {
      from: tx.from as Address,
      to: tx.to as Address,
      symbol: 'RSR', // TODO: Symbol when bridging other tokens
      amount,
      formattedAmount: formatEther(amount),
      blockTimestamp: tx.timeStamp,
      hash: tx.hash as Hex,
    }
  } catch (e) {
    console.error('Error parsing tx', e)
    return undefined
  }
}

type BlockExplorerApiResponse<T> = {
  message: string
  status: string
  result: T
}

const fetcher = async (url: string) => {
  const { result }: BlockExplorerApiResponse<BlockExplorerTransaction[]> =
    await fetch(url).then((res) => res.json())
  const txs: BridgeWithdraw[] = []

  for (const tx of result) {
    const parsed = getWithdrawalTx(tx)

    if (parsed) {
      txs.push(parsed)
    }
  }

  return txs
}

const useBridgeTransactions = (): BridgeWithdraw[] | undefined => {
  const account = useAtomValue(walletAtom)
  const { data, error } = useSWR(account ? API + account : null, fetcher)

  if (error) {
    return []
  }

  return data
}

export default useBridgeTransactions
