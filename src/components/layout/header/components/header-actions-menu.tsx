import { SEARCH_SHORTCUT, searchMenuOpenAtom } from '@/components/command-menu'
import {
  setThemeModeAtom,
  themeModeAtom,
} from '@/components/dark-mode-toggle/atoms'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  LOCALE_LABELS,
  localeAtom,
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from '@/i18n'
import { cn } from '@/lib/utils'
import { Trans, useLingui } from '@lingui/react/macro'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { Globe, Moon, Search, Sun } from 'lucide-react'
import { ReactNode } from 'react'
import HeaderControlButton, {
  type HeaderControlSurface,
} from './header-control-button'

const PanelLabel = ({ children }: { children: ReactNode }) => (
  <div className="px-3 text-xs font-semibold uppercase text-legend">
    {children}
  </div>
)

const MenuTrigger = ({
  surface,
  scrolled,
}: {
  surface: HeaderControlSurface
  scrolled: boolean
}) => {
  const mode = useAtomValue(themeModeAtom)
  const { t } = useLingui()

  return (
    <DropdownMenuTrigger asChild>
      <HeaderControlButton
        aria-label={t`More options`}
        surface={surface}
        className={cn(
          'gap-1 px-3 border-0 lg:border lg:border-border lg:bg-transparent xl:hidden',
          scrolled && 'border'
        )}
      >
        <Search size={14} strokeWidth={1.5} />
        {mode === 'dark' ? (
          <Moon size={14} strokeWidth={1.5} />
        ) : (
          <Sun size={14} strokeWidth={1.5} />
        )}
        <Globe size={14} strokeWidth={1.5} />
      </HeaderControlButton>
    </DropdownMenuTrigger>
  )
}

const SearchControl = () => {
  const setSearchOpen = useSetAtom(searchMenuOpenAtom)

  const handleSearch = () => {
    /* WHY: DropdownMenuItem closes the menu and restores focus before the
        deferred open, so the command dialog keeps focus on its input. */
    setTimeout(() => setSearchOpen(true), 0)
  }

  return (
    <div className="bg-background p-3 pt-5">
      <PanelLabel>
        <Trans>Search</Trans>
      </PanelLabel>
      <DropdownMenuItem
        className="mt-3 flex h-9 w-full cursor-pointer items-center justify-center gap-1.5 rounded-full border border-border bg-card px-3 text-sm font-medium text-legend transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        onSelect={handleSearch}
      >
        <Search size={14} strokeWidth={1.5} />
        <span>
          <Trans>Search for DTFs</Trans>
        </span>
        <span className="ml-auto hidden text-xs text-legend md:inline">
          {SEARCH_SHORTCUT}
        </span>
      </DropdownMenuItem>
    </div>
  )
}

const ThemeControl = () => {
  const mode = useAtomValue(themeModeAtom)
  const setThemeMode = useSetAtom(setThemeModeAtom)

  return (
    <div className="bg-background p-3 pt-5">
      <PanelLabel>
        <Trans>Theme</Trans>
      </PanelLabel>
      {/* WHY: menu items (not raw buttons) so Radix keyboard navigation
        reaches them; preventDefault keeps the menu open on toggle. */}
      <div className="mt-3 grid grid-cols-2 rounded-full bg-muted p-0.5">
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault()
            setThemeMode('light')
          }}
          className={cn(
            'flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-full text-sm font-medium text-legend transition-colors',
            mode === 'light' && 'bg-card text-foreground'
          )}
        >
          <Sun size={14} strokeWidth={1.5} />
          <Trans>Light</Trans>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault()
            setThemeMode('dark')
          }}
          className={cn(
            'flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-full text-sm font-medium text-legend transition-colors',
            mode === 'dark' && 'bg-card text-foreground'
          )}
        >
          <Moon size={14} strokeWidth={1.5} />
          <Trans>Dark</Trans>
        </DropdownMenuItem>
      </div>
    </div>
  )
}

const LanguageControl = () => {
  const [locale, setLocale] = useAtom(localeAtom)

  return (
    <div className="bg-background p-3 pt-5">
      <PanelLabel>
        <Trans>Language</Trans>
      </PanelLabel>
      <div className="mt-3 grid grid-cols-2 gap-1">
        {SUPPORTED_LOCALES.map((supported) => (
          <DropdownMenuItem
            key={supported}
            onSelect={(event) => {
              event.preventDefault()
              setLocale(supported as SupportedLocale)
            }}
            className={cn(
              'flex h-9 cursor-pointer items-center justify-center rounded-full border px-3 text-sm font-medium text-legend transition-colors hover:bg-muted',
              locale === supported
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-transparent'
            )}
          >
            {LOCALE_LABELS[supported]}
          </DropdownMenuItem>
        ))}
      </div>
    </div>
  )
}

// Header menu grouping Search/Theme/Language
const HeaderActionsMenu = ({
  surface = 'default',
  scrolled = false,
}: {
  surface?: HeaderControlSurface
  scrolled?: boolean
}) => (
  <DropdownMenu>
    <MenuTrigger surface={surface} scrolled={scrolled} />
    <DropdownMenuContent
      align="end"
      sideOffset={10}
      className="flex w-screen flex-col gap-[1px] !p-0 !rounded-none border-x-0 bg-secondary shadow-[0_18px_45px_rgba(0,0,0,0.12)] sm:w-72 sm:border-x"
    >
      <SearchControl />
      <ThemeControl />
      <SearchControl />
      <LanguageControl />
    </DropdownMenuContent>
  </DropdownMenu>
)

export default HeaderActionsMenu
