import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const withNavigationGuard = (Component: React.ComponentType) => {
  return function WithNavigationGuard(props: any) {
    const location = useLocation()

    useEffect(() => {
      const handleBeforeUnload = (event: BeforeUnloadEvent) => {
        event.preventDefault()
      }

      const handlePopState = (event: PopStateEvent) => {
        event.preventDefault()
        window.history.pushState(null, '', location.pathname)
      }

      window.addEventListener('beforeunload', handleBeforeUnload)
      window.addEventListener('popstate', handlePopState)

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload)
        window.removeEventListener('popstate', handlePopState)
      }
    }, [location])

    return <Component {...props} />
  }
}
export default withNavigationGuard
