import { navigationMenuTriggerStyle } from '@/components/ui/navigation-menu'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/utils/constants'
import mixpanel from 'mixpanel-browser/src/loaders/loader-module-core'
import { useEffect } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

const EARN_ROUTES = [
  {
    label: 'Index DTF Governance',
    path: ROUTES.EARN_INDEX,
  },
  {
    label: 'Yield DTF Staking',
    path: ROUTES.EARN_YIELD,
  },
  {
    label: 'Defi Yield',
    path: ROUTES.EARN_DEFI,
  },
]

const EarnNavigation = () => {
  return (
    <div className="flex justify-center mt-12 mb-10">
      <div className="flex items-center bg-border p-1 rounded-full">
        {EARN_ROUTES.map((route) => (
          <NavLink key={route.path} to={route.path} className="text-sm">
            {({ isActive }: { isActive: boolean }) => (
              <div
                className={cn(
                  'px-3 py-2 rounded-full',
                  isActive && 'text-primary bg-card'
                )}
              >
                <span>{route.label}</span>
              </div>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  )
}

const Earn = () => {
  useEffect(() => {
    mixpanel.track('Visted Earn Page', {})
  }, [])

  return (
    <div className="container px-0 lg:px-4">
      <EarnNavigation />
      <Outlet />
    </div>
  )
}

export default Earn
