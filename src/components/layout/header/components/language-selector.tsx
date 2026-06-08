import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  LOCALE_LABELS,
  SUPPORTED_LOCALES,
  localeAtom,
  type SupportedLocale,
} from '@/i18n'
import { cn } from '@/lib/utils'
import { useLingui } from '@lingui/react/macro'
import { useAtom } from 'jotai'
import { Globe } from 'lucide-react'

const LanguageSelector = ({ className }: { className?: string }) => {
  const { t } = useLingui()
  const [locale, setLocale] = useAtom(localeAtom)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t`Select language`}
          className={cn(
            'inline-flex items-center justify-center h-8 w-8 rounded-md cursor-pointer hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            className
          )}
        >
          <Globe size={16} strokeWidth={1.5} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10rem]">
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
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default LanguageSelector
