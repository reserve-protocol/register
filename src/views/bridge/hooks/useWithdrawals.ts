import BaseBridge from 'abis/BaseBridge'
import dayjs from 'dayjs'
import { useAtomValue } from 'jotai'
import { walletAtom } from 'state/atoms'
import useSWR from 'swr'
import { formatCurrency } from 'utils'
import { ChainId } from 'utils/chains'
import { Address, Hex, decodeFunctionData, formatUnits } from 'viem'
import BRIDGE_ASSETS, { BridgeAsset } from '../utils/assets'

// TODO: This became spaguetti code, refactor and decouple code
export type BridgeWithdraw = {
  from: Address
  to: Address
  symbol: string
  amount: bigint
  formattedAmount: string
  timestamp: number
  time: string
  date: string
  hash: Hex
  asset?: BridgeAsset
}

interface WithdrawalItem {
  amount: string // bigint
  claimTransactionHash?: Hex
  from: Address
  to: Address
  guid: Hex
  l1TokenAddress: Address
  l2BlockHash: Hex
  l2TokenAddress: Address
  messageHash?: Hex
  proofTransactionHash?: Hex
  transactionHash: Hex
  timestamp: number
  asset?: BridgeAsset
}

const ETH_WITHDRAWAL_ADDRESS =
  '0x4200000000000000000000000000000000000016'.toLowerCase()

const ERC20_WITHDRAWAL_ADDRESS =
  '0x4200000000000000000000000000000000000010'.toLowerCase()

const ETH_TOKEN_ADDRESS = '0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000'

const bridgeAssetMap = BRIDGE_ASSETS.reduce((prev, curr) => {
  if (!curr.L1contract) {
    prev[ETH_TOKEN_ADDRESS.toLowerCase()] = curr
  } else {
    prev[curr.L1contract.toLowerCase()] = curr
    if (curr.L2contract) {
      prev[curr.L2contract.toLowerCase()] = curr
    }
  }

  return prev
}, {} as Record<string, BridgeAsset>)

export function explorerTxToBridgeWithdrawal(tx: any): BridgeWithdraw {
  const date = dayjs.unix(tx.timeStamp)

  if (tx.to === ETH_WITHDRAWAL_ADDRESS) {
    const asset: BridgeAsset | undefined =
      bridgeAssetMap[ETH_TOKEN_ADDRESS.toLowerCase()]
    // ETH withdrawal (OP)
    return {
      from: tx.from,
      to: tx.to,
      asset,
      symbol: asset?.L1symbol ?? 'Unlisted',
      amount: BigInt(tx.value),
      formattedAmount: formatCurrency(
        +formatUnits(BigInt(tx.value), asset?.decimals ?? 18),
        5
      ),
      timestamp: tx.timeStamp,
      time: date.format('h:ss A'),
      date: date.format('MMM D, YYYY'),
      hash: tx.hash as `0x${string}`,
    }
  }

  const { args } = decodeFunctionData({
    abi: BaseBridge,
    data: tx.input,
  })
  const asset: BridgeAsset | undefined =
    bridgeAssetMap[((args?.[0] as string) ?? '').toLowerCase()]

  return {
    from: tx.from,
    to: tx.to,
    symbol: asset?.L1symbol ?? 'Unlisted',
    amount: BigInt(args?.[1]),
    formattedAmount: formatCurrency(
      +formatUnits(BigInt(args?.[1]), asset?.decimals ?? 18),
      5
    ),
    timestamp: tx.timeStamp,
    time: date.format('h:ss A'),
    date: date.format('MMM D, YYYY'),
    hash: tx.hash as `0x${string}`,
  }
}

export function isETHOrERC20Withdrawal(tx: any) {
  // Immediately filter out if tx is not to an address we don't care about
  if (tx.to !== ETH_WITHDRAWAL_ADDRESS && tx.to !== ERC20_WITHDRAWAL_ADDRESS) {
    return false
  }

  // ETH withdrawal
  if (tx.to === ETH_WITHDRAWAL_ADDRESS && tx.value !== '0') {
    return true
  }

  // ERC-20 Withdrawal
  if (tx.to === ERC20_WITHDRAWAL_ADDRESS) {
    const { functionName } = decodeFunctionData({
      abi: BaseBridge,
      data: tx.input,
    })
    if (functionName === 'withdraw') {
      return true
    }
  }

  return false
}

const fetchExplorerWithdrawals = async (
  address: string
): Promise<BridgeWithdraw[]> => {
  const params = new URLSearchParams({
    address: address,
    action: 'txlist',
    module: 'account',
    filterby: 'from',
    startBlock: '0',
  }).toString()

  const response = await fetch('https://base.blockscout.com/api?' + params)
  const result = await response.json()

  try {
    return result.result
      .filter(isETHOrERC20Withdrawal)
      .map(explorerTxToBridgeWithdrawal)
  } catch (e) {
    return []
  }
}

async function fetchOPWithdrawals(address: string): Promise<BridgeWithdraw[]> {
  try {
    const response = await fetch('https://bridge-api.base.org/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'indexer_getAllWithdrawalsByAddress',
        params: [address, ChainId.Base],
        id: 0,
      }),
    })

    const { result: withdrawals } = (await response.json()) as {
      result: WithdrawalItem[]
    }

    return withdrawals.map((item) => {
      const asset: BridgeAsset | undefined =
        bridgeAssetMap[item.l1TokenAddress.toLowerCase()]
      const date = dayjs.unix(item.timestamp)

      // TODO: full support unlisted tokens
      return {
        asset,
        from: item.from,
        to: item.to,
        symbol: asset?.L1symbol ?? 'Unlisted',
        amount: BigInt(item.amount),
        formattedAmount: formatCurrency(
          +formatUnits(BigInt(item.amount), asset?.decimals ?? 18),
          5
        ),
        timestamp: item.timestamp,
        time: date.format('h:ss A'),
        date: date.format('MMM D, YYYY'),
        hash: item.transactionHash,
      }
    })
  } catch (e) {
    return []
  }
}

const fetchWithdrawals = async (address: string): Promise<BridgeWithdraw[]> => {
  const explorerWithdrawals = await fetchExplorerWithdrawals(address)
  const baseApiWithdrawals = await fetchOPWithdrawals(address)

  const txMap = new Set<string>()

  return [...explorerWithdrawals, ...baseApiWithdrawals].reduce((acc, tx) => {
    if (!txMap.has(tx.hash)) {
      txMap.add(tx.hash)
      acc.push(tx)
    }

    return acc
  }, [] as BridgeWithdraw[])
}

const useWithdrawals = (): { data: BridgeWithdraw[]; isLoading: boolean } => {
  const account = useAtomValue(walletAtom)
  const { data, error, isLoading } = useSWR(
    account ? account : null,
    fetchWithdrawals,
    {
      keepPreviousData: true,
    }
  )

  if (error) {
    return { data: [], isLoading: false }
  }

  return { data: data || [], isLoading }
}

export default useWithdrawals
