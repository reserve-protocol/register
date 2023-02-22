import { useLocation } from 'react-router-dom'
import { ROUTES } from 'utils/constants'

/**
 * Check if user is on the deployer view
 *
 * @returns bool
 */
const useIsDeployer = () => {
  const { pathname } = useLocation()

  if (pathname.indexOf(ROUTES.DEPLOY) !== -1) {
    return true
  }

  return false
}

export default useIsDeployer
