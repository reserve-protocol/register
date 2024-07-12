import useAccounts from 'hooks/useAccounts'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import {
  accountHoldingsAtom,
  accountRTokensAtom,
  accountTokensAtom,
  walletAtom,
} from '../../atoms'

export interface AccountRTokenPosition {
  address: string
  name: string
  symbol: string
  usdPrice: number
  balance: number
  usdAmount: number
  stakedRSR: number
  stakedRSRUsd: number
  chain: number
}

export interface AccountToken {
  address: string
  name: string
  symbol: string
  chainId: number
}

const AccountUpdater = () => {
  const account = useAtomValue(walletAtom)
  const updateTokens = useSetAtom(accountTokensAtom)
  const updateHoldings = useSetAtom(accountHoldingsAtom)
  const updateAccountTokens = useSetAtom(accountRTokensAtom)

  const accountDataMap = useAccounts(account ? [account] : [])

  useEffect(() => {
    if (account && accountDataMap[account.toLowerCase()]) {
      const { tokens, holdings, accountTokens } =
        accountDataMap[account.toLowerCase()]
      updateTokens(tokens)
      updateHoldings(holdings)
      updateAccountTokens(accountTokens)
    }
  }, [
    account,
    accountDataMap,
    updateTokens,
    updateHoldings,
    updateAccountTokens,
  ])

  return null
}

export default AccountUpdater
