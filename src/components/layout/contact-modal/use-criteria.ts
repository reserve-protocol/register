import { walletAtom } from '@/state/chain/atoms/chainAtoms'
import { usePortfolio } from '@/views/portfolio-page/hooks/use-portfolio'
import { useAtomValue } from 'jotai'

export const CONTACT_THRESHOLD_USD = 500

export const useContactCriteria = () => {
  const wallet = useAtomValue(walletAtom)
  const { data } = usePortfolio(wallet ?? undefined)

  const total =
    (data?.indexDTFs.reduce((sum, d) => sum + (d.value || 0), 0) ?? 0) +
    (data?.yieldDTFs.reduce((sum, d) => sum + (d.value || 0), 0) ?? 0)

  return {
    wallet,
    criteriaMet: !!wallet && total >= CONTACT_THRESHOLD_USD,
  }
}
