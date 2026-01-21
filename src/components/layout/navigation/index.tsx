import { t } from '@lingui/macro'
import AuctionsIcon from 'components/icons/AuctionsIcon'
import GovernanceIcon from 'components/icons/GovernanceIcon'
import IssuanceIcon from 'components/icons/IssuanceIcon'
import ManagerIcon from 'components/icons/ManagerIcon'
import OverviewIcon from 'components/icons/OverviewIcon'
import StakeIcon from 'components/icons/StakeIcon'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import mixpanel from 'mixpanel-browser/src/loaders/loader-module-core'
import { useEffect, useMemo } from 'react'
import { NavLink } from 'react-router-dom'
import { chainIdAtom, selectedRTokenAtom } from 'state/atoms'
import { ROUTES } from 'utils/constants'
import RSV from 'utils/rsv'

interface Item {
  path: string
  title: string
  Icon: React.ElementType
}

interface NavItemProps extends Item {
  rTokenAddress: string
}

const MenuItem = ({ title, Icon }: Omit<Item, 'path'>) => {
  return (
    <div className="flex flex-grow items-center px-2 my-2.5 md:my-0.5 transition-all">
      <Icon />
      <span className="hidden md:inline whitespace-nowrap font-light ml-2">
        {title}
      </span>
    </div>
  )
}

const NavItem = ({ path, title, Icon, rTokenAddress }: NavItemProps) => {
  const chainId = useAtomValue(chainIdAtom)

  return (
    <NavLink
      className={({ isActive }) =>
        `no-underline mx-3 py-3 flex ${
          isActive
            ? 'opacity-100 shadow-[inset_0_0px_0px_var(--background),inset_0_-2px_0px_currentColor]'
            : 'opacity-70'
        }`
      }
      to={`${path}?token=${rTokenAddress}&chainId=${chainId}`}
      onClick={() =>
        mixpanel.track('Selected RToken NavItem', {
          RToken: rTokenAddress.toLowerCase(),
          Target: path.slice(1),
        })
      }
    >
      <MenuItem title={title} Icon={Icon} />
    </NavLink>
  )
}

// Sidebar Navigation
const Navigation = () => {
  const rTokenAddress = useAtomValue(selectedRTokenAtom)
  const rToken = useRToken()

  useEffect(() => {
    document.title = `${
      rToken?.symbol || `Register`
    } - Reserve Protocol Interface`
  }, [rToken])

  const PAGES = useMemo(() => {
    const items = [
      { path: ROUTES.OVERVIEW, title: t`Overview`, Icon: OverviewIcon },
      { path: ROUTES.ISSUANCE, title: t`Mint + Redeem`, Icon: IssuanceIcon },
      { path: ROUTES.STAKING, title: t`Stake + Unstake`, Icon: StakeIcon },
      { path: ROUTES.AUCTIONS, title: t`Auctions`, Icon: AuctionsIcon },
      { path: ROUTES.GOVERNANCE, title: t`Governance`, Icon: GovernanceIcon },
      {
        path: ROUTES.SETTINGS,
        title: t`Details + Roles`,
        Icon: ManagerIcon,
      },
    ]

    return items
  }, [])

  const pages = useMemo(() => {
    if (rTokenAddress === RSV.address) {
      return [...PAGES.slice(0, 2)]
    }

    return PAGES
  }, [rTokenAddress])

  return (
    <div className="flex mx-auto">
      {pages.map((item) => (
        <NavItem
          key={item.path}
          {...item}
          rTokenAddress={rTokenAddress ?? ''}
        />
      ))}
    </div>
  )
}

export default Navigation
