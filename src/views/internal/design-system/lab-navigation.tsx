import { LayoutDashboard } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

const CATEGORIES = [
  {
    id: 'foundations',
    name: 'Foundations',
    to: '/internal/design-system/foundations',
  },
  {
    id: 'components',
    name: 'Components',
    to: '/internal/design-system/components',
  },
  {
    id: 'studies',
    name: 'Studies',
    to: '/internal/design-system/studies',
  },
  {
    id: 'screens',
    name: 'Screens',
    to: '/internal/design-system/screens',
  },
] as const

const LabNavigation = () => (
  <nav
    aria-label="Design system lab categories"
    className="flex items-center justify-between gap-1"
  >
    <div className="flex min-w-0 items-center gap-0.5">
      {CATEGORIES.map((category) => (
        <NavLink
          key={category.id}
          data-testid={`design-system-nav-${category.id}`}
          to={category.to}
          className={({ isActive }) =>
            cn(
              'flex min-h-11 items-center rounded-md px-2 text-xs text-foreground hover:bg-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-3 sm:text-sm',
              isActive && 'bg-muted text-primary'
            )
          }
        >
          {category.name}
        </NavLink>
      ))}
    </div>

    <NavLink
      data-testid="design-system-nav-status"
      aria-label="Project status"
      to="/internal/design-system/status"
      className={({ isActive }) =>
        cn(
          'flex min-h-11 shrink-0 items-center gap-2 rounded-md px-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-3',
          isActive && 'bg-muted text-foreground'
        )
      }
    >
      <LayoutDashboard className="h-4 w-4" />
      <span className="hidden sm:inline">Status</span>
    </NavLink>
  </nav>
)

export default LabNavigation
