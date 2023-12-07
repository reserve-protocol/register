import dayjs from 'dayjs'
import { useAtomValue } from 'jotai'
import { walletAtom } from 'state/atoms'
import useSWR from 'swr'
import { formatCurrency } from 'utils'
import { ChainId } from 'utils/chains'
import { Address, Hex, formatUnits } from 'viem'
import BRIDGE_ASSETS, { BridgeAsset } from '../utils/assets'

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

const ETH_TOKEN_ADDRESS = '0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000'

const bridgeAssetMap = BRIDGE_ASSETS.reduce((prev, curr) => {
  if (!curr.L1contract) {
    prev[ETH_TOKEN_ADDRESS.toLowerCase()] = curr
  } else {
    prev[curr.L1contract.toLowerCase()] = curr
  }

  return prev
}, {} as Record<string, BridgeAsset>)

async function fetchOPWithdrawals(address: string): Promise<BridgeWithdraw[]> {
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
}

const useWithdrawals = (): { data: BridgeWithdraw[]; isLoading: boolean } => {
  const account = useAtomValue(walletAtom)
  const { data, error, isLoading } = useSWR(
    account ? account : null,
    fetchOPWithdrawals,
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
