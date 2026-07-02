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
  SUPPORTED_LOCALES,
  localeAtom,
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

// Header menu grouping Search/Theme/Language
const HeaderActionsMenu = ({
  surface = 'default',
}: {
  surface?: HeaderControlSurface
}) => {
  const { t } = useLingui()
  const [locale, setLocale] = useAtom(localeAtom)
  const mode = useAtomValue(themeModeAtom)
  const setThemeMode = useSetAtom(setThemeModeAtom)
  const setSearchOpen = useSetAtom(searchMenuOpenAtom)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <HeaderControlButton
          aria-label={t`More options`}
          surface={surface}
          className="gap-1 px-3 xl:hidden"
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
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="flex w-screen flex-col gap-[1px] !p-0 !rounded-none border-x-0 bg-secondary shadow-[0_18px_45px_rgba(0,0,0,0.12)] sm:w-72 sm:border-x"
      >
        <div className="bg-background p-3 pt-5">
          <PanelLabel>
            <Trans>Search</Trans>
          </PanelLabel>
          {/* WHY: DropdownMenuItem closes the menu and restores focus before the
              deferred open, so the command dialog keeps focus on its input. */}
          <DropdownMenuItem
            className="mt-3 flex h-9 w-full cursor-pointer items-center justify-center gap-1.5 rounded-full border border-border bg-card px-3 text-sm font-medium text-legend transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onSelect={() => setTimeout(() => setSearchOpen(true), 0)}
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
        <div className="bg-background p-3 pt-5">
          <PanelLabel>
            <Trans>Theme</Trans>
          </PanelLabel>
          <div className="mt-3 grid grid-cols-2 rounded-full bg-muted p-0.5">
            <button
              type="button"
              onClick={() => setThemeMode('light')}
              className={cn(
                'flex h-8 items-center justify-center gap-1.5 rounded-full text-sm font-medium text-legend transition-colors',
                mode === 'light' && 'bg-card text-foreground'
              )}
            >
              <Sun size={14} strokeWidth={1.5} />
              <Trans>Light</Trans>
            </button>
            <button
              type="button"
              onClick={() => setThemeMode('dark')}
              className={cn(
                'flex h-8 items-center justify-center gap-1.5 rounded-full text-sm font-medium text-legend transition-colors',
                mode === 'dark' && 'bg-card text-foreground'
              )}
            >
              <Moon size={14} strokeWidth={1.5} />
              <Trans>Dark</Trans>
            </button>
          </div>
        </div>
        <div className="bg-background p-3 pt-5">
          <PanelLabel>
            <Trans>Language</Trans>
          </PanelLabel>
          <div className="mt-3 grid grid-cols-2 gap-1">
            {SUPPORTED_LOCALES.map((supported) => (
              <button
                key={supported}
                type="button"
                onClick={() => setLocale(supported as SupportedLocale)}
                className={cn(
                  'h-9 rounded-full border px-3 text-sm font-medium text-legend transition-colors hover:bg-muted',
                  locale === supported
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-transparent'
                )}
              >
                {LOCALE_LABELS[supported]}
              </button>
            ))}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default HeaderActionsMenu
