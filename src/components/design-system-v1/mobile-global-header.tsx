import { v1Typography } from '@/components/design-system-v1/typography'
import { Languages, Moon, Search, Sun } from 'lucide-react'
import {
  useEffect,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react'

import { Button } from '@/components/button'
import { cn } from '@/lib/utils'
import { PopupChevron } from './popup-chevron'
import { popupItemGeometry, popupItemTypography } from './popup-item-geometry'
import { SearchFieldLauncher } from './search-field'
import { SegmentedControl, SegmentedControlItem } from './segmented-control'

export type MobileGlobalHeaderSurface = 'default' | 'transparent'

export interface MobileGlobalHeaderProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'children'
> {
  account: ReactNode
  brand: ReactNode
  navigation: ReactNode
  surface?: MobileGlobalHeaderSurface
  utilities: ReactNode
}

/**
 * Closed mobile application header. This owner is intentionally limited to
 * layout and surface treatment; each interactive slot keeps its own canonical
 * Button, IconButton, or menu contract.
 */
export const MobileGlobalHeader = ({
  account,
  brand,
  className,
  navigation,
  surface = 'default',
  utilities,
  ...props
}: MobileGlobalHeaderProps) => (
  <header
    data-surface={surface}
    className={cn(
      'relative flex h-14 items-center px-4 [container-type:inline-size]',
      surface === 'default'
        ? 'bg-card after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-border'
        : 'bg-transparent',
      className
    )}
    {...props}
  >
    <div className="min-w-0 shrink">{brand}</div>
    <div className="ml-auto flex shrink-0 items-center gap-1">
      {utilities}
      {account}
      {navigation}
    </div>
  </header>
)

export type MobileUtilityTheme = 'light' | 'dark'
export type MobileUtilityLanguage = 'en' | 'es' | 'ko' | 'zh'

export interface MobileUtilityPanelMessages {
  darkThemeActionLabel: string
  darkThemeLabel: string
  languageAccessibleNames: Record<MobileUtilityLanguage, string>
  languageActionLabel: (languageName: string) => string
  languageLabels: Record<MobileUtilityLanguage, string>
  languageOptionsLabel: string
  languageSectionLabel: string
  languageSummaryLabel: (languageName: string) => string
  lightThemeActionLabel: string
  lightThemeLabel: string
  panelLabel: string
  searchActionLabel: string
  searchSectionLabel: string
  themeControlLabel: string
  themeSectionLabel: string
  triggerLabel: string
}

export interface MobileUtilityPanelProps {
  defaultOpen?: boolean
  language?: MobileUtilityLanguage
  messages: MobileUtilityPanelMessages
  onLanguageChange?: (language: MobileUtilityLanguage) => void
  onSearch?: () => void
  onThemeChange?: (theme: MobileUtilityTheme) => void
  theme?: MobileUtilityTheme
}

/**
 * Preserves the existing mobile decision to group search, theme, and language
 * under one trigger while composing each job from its canonical control owner.
 */
export const MobileUtilityPanel = ({
  defaultOpen = false,
  language,
  messages,
  onLanguageChange,
  onSearch,
  onThemeChange,
  theme,
}: MobileUtilityPanelProps) => {
  const [open, setOpen] = useState(defaultOpen)
  const [languageOpen, setLanguageOpen] = useState(false)
  const panelId = useId()
  const languageOptionsId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [internalTheme, setInternalTheme] =
    useState<MobileUtilityTheme>('light')
  const [internalLanguage, setInternalLanguage] =
    useState<MobileUtilityLanguage>('en')
  const currentTheme = theme ?? internalTheme
  const currentLanguage = language ?? internalLanguage
  const ThemeIcon = currentTheme === 'dark' ? Moon : Sun
  const selectTheme = (nextTheme: MobileUtilityTheme) => {
    setInternalTheme(nextTheme)
    onThemeChange?.(nextTheme)
  }
  const selectLanguage = (nextLanguage: MobileUtilityLanguage) => {
    setInternalLanguage(nextLanguage)
    onLanguageChange?.(nextLanguage)
    setLanguageOpen(false)
  }
  const openSearch = () => {
    setOpen(false)
    setLanguageOpen(false)
    setTimeout(() => onSearch?.(), 0)
  }

  useEffect(() => {
    if (!open) return

    const dismissOutside = (event: PointerEvent) => {
      if (rootRef.current?.contains(event.target as Node)) return
      setOpen(false)
      setLanguageOpen(false)
    }
    const dismissWithEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      setLanguageOpen(false)
      triggerRef.current?.focus()
    }

    document.addEventListener('pointerdown', dismissOutside)
    document.addEventListener('keydown', dismissWithEscape)
    return () => {
      document.removeEventListener('pointerdown', dismissOutside)
      document.removeEventListener('keydown', dismissWithEscape)
    }
  }, [open])

  return (
    <div ref={rootRef} className="contents">
      <Button
        ref={triggerRef}
        aria-controls={panelId}
        aria-expanded={open}
        aria-label={messages.triggerLabel}
        className="gap-1 px-2 [&>svg]:size-3.5"
        size="compact"
        tone="secondary"
        onClick={() => {
          setOpen(!open)
          if (open) setLanguageOpen(false)
        }}
      >
        <Search aria-hidden="true" />
        <ThemeIcon aria-hidden="true" />
        <Languages aria-hidden="true" />
      </Button>
      {open ? (
        <div
          aria-label={messages.panelLabel}
          className="absolute inset-x-0 top-full z-50 max-h-[calc(100dvh-3.5rem)] overflow-y-auto border-b border-border bg-card p-4 text-card-foreground shadow-sm outline-none"
          id={panelId}
          role="region"
        >
          <div className="space-y-4">
            <UtilitySection label={messages.searchSectionLabel}>
              <SearchFieldLauncher
                aria-label={messages.searchActionLabel}
                onClick={openSearch}
              >
                {messages.searchActionLabel}
              </SearchFieldLauncher>
            </UtilitySection>

            <UtilitySection label={messages.themeSectionLabel}>
              <SegmentedControl
                aria-label={messages.themeControlLabel}
                onValueChange={(nextTheme) =>
                  selectTheme(nextTheme as MobileUtilityTheme)
                }
                presentation="contained"
                size="default"
                value={currentTheme}
                width="full"
              >
                <SegmentedControlItem
                  aria-label={messages.lightThemeActionLabel}
                  className="gap-1.5"
                  value="light"
                >
                  <Sun aria-hidden="true" className="size-4" />
                  {messages.lightThemeLabel}
                </SegmentedControlItem>
                <SegmentedControlItem
                  aria-label={messages.darkThemeActionLabel}
                  className="gap-1.5"
                  value="dark"
                >
                  <Moon aria-hidden="true" className="size-4" />
                  {messages.darkThemeLabel}
                </SegmentedControlItem>
              </SegmentedControl>
            </UtilitySection>

            <UtilitySection label={messages.languageSectionLabel}>
              <div>
                <Button
                  aria-controls={languageOptionsId}
                  aria-expanded={languageOpen}
                  aria-label={messages.languageSummaryLabel(
                    messages.languageAccessibleNames[currentLanguage]
                  )}
                  className="group h-11 min-h-0 w-full justify-between gap-3 py-0 pl-5 pr-[18px] text-base font-light data-[state=open]:rounded-t-lg data-[state=open]:rounded-b-none"
                  data-state={languageOpen ? 'open' : 'closed'}
                  leadingIcon={
                    <Languages
                      aria-hidden="true"
                      className="text-muted-foreground"
                    />
                  }
                  onClick={() => setLanguageOpen((currentOpen) => !currentOpen)}
                  size="default"
                  tone="secondary"
                  trailingIcon={<PopupChevron />}
                >
                  <span className="min-w-0 flex-1 truncate text-left">
                    {messages.languageLabels[currentLanguage]}
                  </span>
                </Button>
                {languageOpen ? (
                  <div
                    aria-label={messages.languageOptionsLabel}
                    className="grid gap-1 rounded-b-lg border border-t-0 border-border bg-card p-2"
                    id={languageOptionsId}
                    role="group"
                  >
                    {(
                      Object.keys(
                        messages.languageLabels
                      ) as MobileUtilityLanguage[]
                    )
                      .filter(
                        (languageChoice) => languageChoice !== currentLanguage
                      )
                      .map((languageChoice) => (
                        <button
                          key={languageChoice}
                          aria-label={messages.languageActionLabel(
                            messages.languageAccessibleNames[languageChoice]
                          )}
                          className={cn(
                            'flex min-h-11 w-full cursor-pointer items-center rounded text-foreground outline-none transition-colors duration-120 hover:bg-foreground/5 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
                            popupItemGeometry.itemInset,
                            popupItemTypography.singleLine
                          )}
                          onClick={() => selectLanguage(languageChoice)}
                          type="button"
                        >
                          {messages.languageLabels[languageChoice]}
                        </button>
                      ))}
                  </div>
                ) : null}
              </div>
            </UtilitySection>
          </div>
        </div>
      ) : null}
    </div>
  )
}

const UtilitySection = ({
  children,
  label,
}: {
  children: ReactNode
  label: string
}) => (
  <section aria-label={label} className="space-y-2">
    <UtilitySectionLabel>{label}</UtilitySectionLabel>
    {children}
  </section>
)

const UtilitySectionLabel = ({ children }: { children: ReactNode }) => (
  <p className={`${v1Typography.label} text-muted-foreground`}>{children}</p>
)
