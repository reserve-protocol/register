import { t } from '@lingui/macro'
import AuctionsIcon from 'components/icons/AuctionsIcon'
import GovernanceIcon from 'components/icons/GovernanceIcon'
import IssuanceIcon from 'components/icons/IssuanceIcon'
import ManagerIcon from 'components/icons/ManagerIcon'
import StakeIcon from 'components/icons/StakeIcon'
import TokenLogo from 'components/icons/TokenLogo'
import { navigationIndexAtom } from 'components/section-navigation/atoms'
import useSectionNavigate from 'components/section-navigation/useSectionNavigate'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import React, { useEffect, useState } from 'react'
import { ChevronDown, ChevronRight } from 'react-feather'
import { NavLink, useNavigate } from 'react-router-dom'
import { Box, Flex, Text } from 'theme-ui'
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

const RTokenIcon = () => {
  const token = useRToken()

  return <TokenLogo symbol={token?.symbol} />
}

const navigation: NavigationItem[] = [
  {
    icon: <RTokenIcon />,
    label: t`Overview`,
    route: ROUTES.OVERVIEW,
    subnav: [
      { label: t`Intro`, id: 'intro' },
      { label: t`Backing & Risk`, id: 'backing' },
      { label: t`Earn`, id: 'earn' },
      { label: t`Revenue & Usage`, id: 'revenue' },
      { label: t`Transactions`, id: 'transactions' },
    ],
  },
  {
    icon: <IssuanceIcon />,
    label: t`Issuance`,
    route: ROUTES.ISSUANCE,
  },
  {
    icon: <StakeIcon />,
    label: t`Staking`,
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
]

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
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
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
    <Box pt={3} pl={6} as="ul" sx={{ listStyleType: 'none' }}>
      {items.map(({ label, id }, currentIndex) => {
        const isActive = active === currentIndex

        return (
          <Box
            mb="2"
            sx={{ color: isActive ? 'accent' : 'text' }}
            as="li"
            onClick={(e) => handleSubnav(e, currentIndex)}
            key={id}
          >
            {label}
          </Box>
        )
      })}
    </Box>
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
      <Box
        variant="layout.verticalAlign"
        p={[3, 2]}
        sx={{
          textDecoration: 'none',
          backgroundColor: isActive ? 'contentBackground' : 'background',
          borderRadius: '8px',
          color: isActive ? 'accent' : 'text',
        }}
      >
        <Flex
          sx={{
            width: '20px',
            fontSize: 3,
            justifyContent: 'center',
            color: 'text',
          }}
        >
          {icon}
        </Flex>
        <Text sx={{ fontWeight: 700, display: ['none', 'block'] }} ml="2">
          {label}
        </Text>
        {!!subnav && (
          <Box ml="auto" variant="layout.verticalAlign" onClick={handleExpand}>
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </Box>
        )}
      </Box>
      {!!subnav && expanded && (
        <SubNavigation items={subnav} route={route} currentRoute={isActive} />
      )}
    </>
  )
}

const NavItem = (props: NavigationItem) => (
  <NavLink
    style={{
      marginBottom: '4px',
      textDecoration: 'none',
      display: 'block',
    }}
    to={props.route}
  >
    {({ isActive }) => <NavContent {...props} isActive={isActive} />}
  </NavLink>
)

const TokenNavigation = () => (
  <Box
    sx={{
      width: ['100%', '220px'],
      borderRight: ['none', '1px solid'],
      borderTop: ['1px solid', 'none'],
      borderColor: ['border', 'border'],
      position: ['fixed', 'relative'],
      bottom: [0, undefined],
      flexShrink: 0,
      zIndex: 1,
      backgroundColor: ['background', 'none'],
    }}
  >
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        display: ['flex', 'block'],
        justifyContent: ['space-evenly', 'none'],
      }}
      padding={[2, 3]}
    >
      {navigation.map((props) => (
        <NavItem key={props.route} {...props} />
      ))}
    </Box>
  </Box>
)

export default React.memo(TokenNavigation)
