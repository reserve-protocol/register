import { useAtomValue } from 'jotai'
import { allWalletsAtom } from './atoms'

const PortfolioUpdater = () => {
  const wallets = useAtomValue(allWalletsAtom)

  return null
}

export default PortfolioUpdater
