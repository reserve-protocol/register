import { useAtomValue, useSetAtom } from 'jotai'
import { allWalletsAccountsAtom, allWalletsAtom } from './atoms'
import useAccounts from 'hooks/useAccounts'
import { useEffect } from 'react'

const PortfolioUpdater = () => {
  const wallets = useAtomValue(allWalletsAtom)
  const setWalletsAccounts = useSetAtom(allWalletsAccountsAtom)
  const accountTokens = useAccounts(wallets.map((wallet) => wallet.address))
  useEffect(() => {
    setWalletsAccounts((prev) => ({ ...prev, ...accountTokens }))
  }, [accountTokens, setWalletsAccounts])

  return null
}

export default PortfolioUpdater
