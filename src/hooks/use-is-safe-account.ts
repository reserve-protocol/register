import { walletAtom } from '@/state/atoms'
import { useAtomValue } from 'jotai'
import type { Address } from 'viem'
import { useBytecode } from 'wagmi'

// EIP-7702 delegated EOAs carry code too but sign mined transactions themselves, so they count as plain wallets.
const DELEGATION_PREFIX = '0xef0100'

export const isSafeAccountCode = (code?: string) =>
  !!code && code !== '0x' && !code.toLowerCase().startsWith(DELEGATION_PREFIX)

// True for a smart-contract account (a Safe): its wallet returns a Safe tx hash, never a mined one.
export const useIsSafeAccount = (chainId?: number, account?: Address) => {
  const wallet = useAtomValue(walletAtom)
  const address = account ?? (wallet as Address | null) ?? undefined
  const { data: code } = useBytecode({ address, chainId, query: { enabled: !!address } })
  return isSafeAccountCode(code)
}
