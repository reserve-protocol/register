import {
  SEARCH_SHORTCUT,
  searchMenuOpenAtom,
} from '@/components/command-menu'
import {
  themeModeAtom,
  toggleThemeAtom,
} from '@/components/dark-mode-toggle/atoms'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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
import { EllipsisVertical, Globe, Moon, Search, Sun } from 'lucide-react'
import { ReactNode } from 'react'

const itemClassName =
  'p-4 gap-2 flex items-center rounded-3xl bg-card border border-transparent cursor-pointer focus:bg-card focus:border-primary'

const ItemIcon = ({ children }: { children: ReactNode }) => (
  <div className="p-1 rounded-full border border-foreground">{children}</div>
)

// Header menu grouping Search/Theme/Language
const HeaderActionsMenu = () => {
  const { t } = useLingui()
  const [locale, setLocale] = useAtom(localeAtom)
  const mode = useAtomValue(themeModeAtom)
  const toggleTheme = useSetAtom(toggleThemeAtom)
  const setSearchOpen = useSetAtom(searchMenuOpenAtom)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t`More options`}
          className="inline-flex xl:hidden items-center justify-center h-8 w-8 rounded-md border cursor-pointer hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <EllipsisVertical size={16} strokeWidth={1.5} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-72 rounded-3xl bg-secondary p-1 flex flex-col gap-1"
      >
        <DropdownMenuItem
          className={itemClassName}
          // WHY: defer so the dropdown's closing focus-restore doesn't steal
          // focus from the command dialog input
          onSelect={() => setTimeout(() => setSearchOpen(true), 0)}
        >
          <ItemIcon>
            <Search size={16} />
          </ItemIcon>
          <div className="mr-auto">
            <span className="font-bold text-base">
              <Trans>Search</Trans>
            </span>
            <p className="text-sm text-legend">
              <Trans>Search for DTFs</Trans>
            </p>
          </div>
          <span className="hidden md:inline text-xs text-legend">
            {SEARCH_SHORTCUT}
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className={itemClassName}
          onSelect={(e) => {
            // Keep the menu open so the theme change is visible
            e.preventDefault()
            toggleTheme()
          }}
        >
          <ItemIcon>
            {mode === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
          </ItemIcon>
          <div className="mr-auto">
            <span className="font-bold text-base">
              <Trans>Theme</Trans>
            </span>
            <p className="text-sm text-legend">
              {mode === 'dark' ? t`Dark` : t`Light`}
            </p>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger
            className={cn(
              itemClassName,
              'data-[state=open]:bg-card data-[state=open]:border-primary'
            )}
          >
            <ItemIcon>
              <Globe size={16} />
            </ItemIcon>
            <div className="mr-auto">
              <span className="font-bold text-base">
                <Trans>Language</Trans>
              </span>
              <p className="text-sm text-legend">{LOCALE_LABELS[locale]}</p>
            </div>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="min-w-[10rem]">
            <DropdownMenuRadioGroup
              value={locale}
              onValueChange={(value) => setLocale(value as SupportedLocale)}
            >
              {SUPPORTED_LOCALES.map((supported) => (
                <DropdownMenuRadioItem
                  key={supported}
                  value={supported}
                  className="cursor-pointer"
                >
                  {LOCALE_LABELS[supported]}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default HeaderActionsMenu
