import { t } from '@lingui/macro'
import AuctionsIcon from 'components/icons/AuctionsIcon'
import GovernanceIcon from 'components/icons/GovernanceIcon'
import IssuanceIcon from 'components/icons/IssuanceIcon'
import ManagerIcon from 'components/icons/ManagerIcon'
import StakeIcon from 'components/icons/StakeIcon'
import { CurrentRTokenLogo } from 'components/icons/TokenLogo'
import { navigationIndexAtom } from 'components/section-navigation/atoms'
import useSectionNavigate from '@/components/section-navigation/use-section-navigate'
import { useAtomValue } from 'jotai'
import React, { useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { ROUTES } from 'utils/constants'

interface SubNavItem {
  label: string
  id: string
}

interface NavigationItem {
  icon: any
  label: string
  route: string
  subnav?: SubNavItem[]
}

interface NavContentProps extends NavigationItem {
  isActive: boolean
}

const SubNavigation = ({
  items,
  currentRoute,
  route,
}: {
  items: SubNavItem[]
  currentRoute: boolean
  route: string
}) => {
  const navigate = useNavigate()
  const navigateToSection = useSectionNavigate()
  const current = useAtomValue(navigationIndexAtom)

  const handleSubnav = (
    e: React.MouseEvent<HTMLLIElement, MouseEvent>,
    index: number
  ) => {
    e.preventDefault()

    // Navigate and append section id
    if (!currentRoute) {
      navigate(`${route}?section=${index}`)
    } else {
      navigateToSection(`section-${index}`)
    }
  }

  const active = Math.min(...current)

  return (
    <ul className="pt-4 pl-8 list-none hidden md:block">
      {items.map(({ label, id }, currentIndex) => {
        const isActive = active === currentIndex

        return (
          <li
            className={cn('mb-2 cursor-pointer', isActive ? 'text-primary' : 'text-foreground')}
            onClick={(e) => handleSubnav(e, currentIndex)}
            key={id}
          >
            {label}
          </li>
        )
      })}
    </ul>
  )
}

const NavContent = ({
  isActive,
  icon,
  label,
  route,
  subnav,
}: NavContentProps) => {
  const [expanded, setExpanded] = useState(isActive)

  useEffect(() => {
    if (!!subnav) {
      if (!isActive && expanded) {
        setExpanded(false)
      }

      if (isActive && !expanded) {
        setExpanded(true)
      }
    }
  }, [isActive])

  const handleExpand = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault()
    setExpanded(!expanded)
  }

  return (
    <>
      <div
        className={cn(
          'flex items-center p-4 md:p-2 rounded-lg no-underline',
          isActive
            ? 'bg-secondary text-foreground'
            : 'bg-background text-legend hover:bg-muted hover:text-foreground'
        )}
      >
        <div className="w-5 flex justify-center text-foreground text-lg">
          {icon}
        </div>
        <span
          className={cn(
            'hidden md:block ml-2',
            isActive ? 'font-bold' : 'font-medium'
          )}
        >
          {label}
        </span>
        {!!subnav && (
          <div
            className="hidden md:flex items-center ml-auto"
            onClick={handleExpand}
          >
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </div>
        )}
      </div>
      {!!subnav && expanded && (
        <SubNavigation items={subnav} route={route} currentRoute={isActive} />
      )}
    </>
  )
}

const NavItem = (props: NavigationItem) => (
  <NavLink
    className="mb-1 no-underline block"
    to={props.route}
  >
    {({ isActive }) => <NavContent {...props} isActive={isActive} />}
  </NavLink>
)

const TokenNavigation = () => {
  const navigation: NavigationItem[] = useMemo(
    () => [
      {
        icon: <CurrentRTokenLogo />,
        label: t`Overview`,
        route: ROUTES.OVERVIEW,
        subnav: [
          { label: t`Intro`, id: 'intro' },
          { label: t`Backing & Risk`, id: 'backing' },
          { label: t`Earn`, id: 'earn' },
          { label: t`Historical metrics`, id: 'historic' },
          { label: t`Transactions`, id: 'transactions' },
        ],
      },
      {
        icon: <IssuanceIcon />,
        label: t`Mint`,
        route: ROUTES.ISSUANCE,
      },
      {
        icon: <StakeIcon />,
        label: t`Stake`,
        route: ROUTES.STAKING,
      },
      {
        icon: <AuctionsIcon />,
        label: t`Auctions`,
        route: ROUTES.AUCTIONS,
      },
      {
        icon: <GovernanceIcon />,
        label: t`Governance`,
        route: ROUTES.GOVERNANCE,
      },
      {
        icon: <ManagerIcon />,
        label: t`Details + Roles`,
        route: ROUTES.SETTINGS,
        subnav: [
          { label: t`Roles & Controls`, id: 'intro' },
          { label: t`Token details`, id: 'backing' },
          { label: t`Primary basket`, id: 'earn' },
          { label: t`Emergency basket`, id: 'revenue' },
          { label: t`Revenue share`, id: 'transactions' },
          { label: t`Backing config`, id: 'backingConfig' },
          { label: t`Other config`, id: 'other' },
          { label: t`Governance`, id: 'governance' },
          { label: t`Contract Addresses`, id: 'contracts' },
        ],
      },
    ],
    []
  )

  return (
    <div
      className={cn(
        'w-full md:w-[220px] shrink-0 z-[1]',
        'border-t md:border-t-0 border-border',
        'fixed md:relative bottom-0 md:bottom-auto',
        'bg-background md:bg-transparent',
        'min-h-auto md:min-h-[calc(100vh-73px)]'
      )}
    >
      <div
        className={cn(
          'sticky top-0',
          'flex md:block justify-evenly md:justify-start',
          'p-1 lg:p-4'
        )}
      >
        {navigation.map((props) => (
          <NavItem key={props.route} {...props} />
        ))}
      </div>
    </div>
  )
}
export default React.memo(TokenNavigation)
