import { useAtomValue } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useEffect } from 'react'
import { balancesAtom, selectedZapTokenAtom, walletAtom } from 'state/atoms'
import { maxZappableAmountAtom } from 'views/issuance/atoms'

/**
 * View: Mint -> Issue
 * maximum zappable token amounts
 */
const MaxZappableUpdater = () => {
  const tokenBalances = useAtomValue(balancesAtom)
  const selectedZapToken = useAtomValue(selectedZapTokenAtom)

  const setMaxZappable = useUpdateAtom(maxZappableAmountAtom)
  const account = useAtomValue(walletAtom)

  const updateMaxZappable = () => {
    const maxZappable = tokenBalances[selectedZapToken?.address || '']
    setMaxZappable(maxZappable)
  }

  useEffect(() => {
    if (selectedZapToken && account) {
      updateMaxZappable()
    }
  }, [selectedZapToken?.address, account, JSON.stringify(tokenBalances)])

  return null
}

export default MaxZappableUpdater
