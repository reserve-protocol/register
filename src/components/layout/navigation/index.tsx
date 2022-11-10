import { t, Trans } from '@lingui/macro'
import AuctionsIcon from 'components/icons/AuctionsIcon'
import DiscussionsIcon from 'components/icons/DiscussionsIcon'
import GovernanceIcon from 'components/icons/GovernanceIcon'
import HomeIcon from 'components/icons/HomeIcon'
import IssuanceIcon from 'components/icons/IssuanceIcon'
import ManagerIcon from 'components/icons/ManagerIcon'
import OverviewIcon from 'components/icons/OverviewIcon'
import StakeIcon from 'components/icons/StakeIcon'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai/utils'
import { useMemo } from 'react'
import { NavLink } from 'react-router-dom'
import { isManagerAtom } from 'state/atoms'
import { Box, Link, NavLinkProps, Text } from 'theme-ui'
import { ROUTES } from 'utils/constants'

interface Item {
  path: string
  title: string
  Icon: React.ElementType
}

interface NavItemProps extends Item, Omit<NavLinkProps, 'title'> {
  rTokenAddress: string
  to?: any
}

const MenuItem = ({ title, Icon }: Omit<Item, 'path'>) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexGrow: 1,
        alignItems: 'center',
        paddingLeft: [0, 0, 4],
        justifyContent: ['center', 'center', 'inherit'],
      }}
      my={[10, 10, 10]}
    >
      <Icon />
      <Text sx={{ display: ['none', 'none', 'inherit'] }} ml={3}>
        {title}
      </Text>
    </Box>
  )
}

const NavItem = ({
  path,
  title,
  Icon,
  rTokenAddress,
  ...props
}: NavItemProps) => (
  <NavLink
    style={({ isActive }) => ({
      paddingLeft: '5px',
      textDecoration: 'none',
      opacity: isActive ? '100%' : '80%',
      color: 'inherit',
      lineHeight: '32px',
      boxShadow: isActive
        ? 'inset 0 12px 0px var(--theme-ui-colors-background), inset 0 -12px 0px var(--theme-ui-colors-background), inset 4px 0px 0px currentColor'
        : 'none',
      display: 'flex',
    })}
    to={`${path}?token=${rTokenAddress}`}
    {...props}
  >
    <MenuItem title={title} Icon={Icon} />
  </NavLink>
)

// Sidebar Navigation
const Navigation = () => {
  const currentToken = useRToken()
  const isManager = useAtomValue(isManagerAtom)
  const PAGES = useMemo(() => {
    const items = [
      { path: ROUTES.HOME, title: t`Home`, Icon: HomeIcon },
      { path: ROUTES.OVERVIEW, title: t`Overview`, Icon: OverviewIcon },
      { path: ROUTES.ISSUANCE, title: t`Mint + Redeem`, Icon: IssuanceIcon },
      { path: ROUTES.INSURANCE, title: t`Stake + Unstake`, Icon: StakeIcon },
      { path: ROUTES.AUCTIONS, title: t`Auctions`, Icon: AuctionsIcon },
    ]

    if (isManager) {
      items.push({
        path: ROUTES.MANAGEMENT,
        title: t`Manager`,
        Icon: ManagerIcon,
      })
    }

    return items
  }, [isManager])

  const externalPages = useMemo(
    () => [
      {
        path: currentToken?.meta?.governance?.discussion ?? '',
        title: t`Governance Discussions`,
        Icon: DiscussionsIcon,
      },
      {
        path: currentToken?.meta?.governance?.voting ?? '',
        title: t`Governance Voting`,
        Icon: GovernanceIcon,
      },
    ],
    [currentToken?.meta?.governance?.voting]
  )

  const pages = useMemo(() => {
    const tokenSymbol =
      currentToken?.symbol && currentToken.symbol.length > 8
        ? `${currentToken.symbol.substring(0, 8)}...`
        : currentToken?.symbol
    PAGES[1].title = `${tokenSymbol || ''} Overview`

    if (currentToken?.isRSV) {
      return [...PAGES.slice(0, 3)]
    }

    return PAGES
  }, [currentToken])

  return (
    <Box mt={5}>
      {pages.map((item) => (
        <NavItem
          key={item.path}
          {...item}
          rTokenAddress={currentToken?.address ?? ''}
        />
      ))}

      {currentToken && !currentToken.isRSV && !currentToken.unlisted && (
        <>
          <Text
            variant="legend"
            sx={{
              fontSize: 1,
              display: ['none', 'none', 'block'],
              paddingLeft: 5,
              marginTop: 3,
              marginBottom: 2,
            }}
          >
            <Trans>External Links</Trans>
          </Text>
          {externalPages.map((item, index) => (
            <Link
              href={item.path}
              target="_blank"
              key={index}
              sx={{
                transition: 'none',
                display: 'flex',
                lineHeight: '32px',
                paddingLeft: '5px',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <MenuItem {...item} />
            </Link>
          ))}
        </>
      )}
    </Box>
  )
}

export default Navigation
