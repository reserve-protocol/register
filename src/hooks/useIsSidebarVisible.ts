import { useAtomValue } from 'jotai'
import { useLocation } from 'react-router-dom'
import { selectedRTokenAtom } from 'state/atoms'
import { ROUTES } from 'utils/constants'

/**
 * Check if user is on the deployer view
 *
 * @returns bool
 */
const useIsSidebarVisible = () => {
  const { pathname } = useLocation()
  const selectedToken = useAtomValue(selectedRTokenAtom)

  if (
    pathname.indexOf(ROUTES.DEPLOY) !== -1 ||
    pathname.indexOf(ROUTES.MANAGEMENT) !== -1 ||
    pathname.toLowerCase() === ROUTES.GOVERNANCE ||
    !selectedToken
  ) {
    return false
  }

  return true
}

export default useIsSidebarVisible
