import { useDeprecatedAddresses } from '@/hooks/use-dtf-status'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ROUTES } from '@/utils/constants'
import type { MessageDescriptor } from '@lingui/core'
import { msg } from '@lingui/core/macro'
import { useLingui } from '@lingui/react/macro'
import { useSetAtom } from 'jotai'
import mixpanel from 'mixpanel-browser/src/loaders/loader-module-core'
import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { deprecatedDTFAddressesAtom } from './atoms'

const EARN_ROUTES: { label: MessageDescriptor; path: string }[] = [
  {
    label: msg`Index DTF Governance`,
    path: ROUTES.EARN_INDEX,
  },
  {
    label: msg`Yield DTF Staking`,
    path: ROUTES.EARN_YIELD,
  },
  {
    label: msg`DeFi Yield`,
    path: ROUTES.EARN_DEFI,
  },
]

const EarnNavigation = () => {
  const { t } = useLingui()
  const location = useLocation()
  const navigate = useNavigate()
  const activeRoute =
    EARN_ROUTES.find((route) => location.pathname.startsWith(route.path))
      ?.path ?? EARN_ROUTES[0].path

  return (
    <div className="mb-6 mt-3 flex justify-center px-1 md:mb-8 md:mt-16">
      <Tabs value={activeRoute} onValueChange={(value) => navigate(value)}>
        <TabsList className="h-8 rounded-[70px] py-0 px-0.5">
          {EARN_ROUTES.map((route) => (
            <TabsTrigger
              key={route.path}
              value={route.path}
              className="h-7 rounded-[60px] px-2.5 text-xs data-[state=active]:text-primary dark:data-[state=active]:text-foreground sm:px-3 sm:text-sm"
            >
              {t(route.label)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  )
}

const DeprecatedDTFsUpdater = () => {
  const deprecated = useDeprecatedAddresses()
  const setDeprecated = useSetAtom(deprecatedDTFAddressesAtom)

  useEffect(() => {
    setDeprecated(deprecated)
  }, [deprecated, setDeprecated])

  return null
}

const Earn = () => {
  useEffect(() => {
    mixpanel.track('Visted Earn Page', {})
  }, [])

  return (
    <div className="container mb-4">
      <EarnNavigation />
      <Outlet />
      <DeprecatedDTFsUpdater />
    </div>
  )
}

export default Earn
