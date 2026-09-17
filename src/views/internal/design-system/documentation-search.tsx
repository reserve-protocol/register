import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useLingui } from '@lingui/react/macro'
import { useLocation, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  DOCUMENTATION_DESTINATION_MESSAGES,
  searchDocumentation,
  translateDocumentationText,
  type DocumentationDestination,
} from './documentation-presentation'
import { useDocumentationSection } from './documentation-section-observer'

const DESTINATIONS: DocumentationDestination[] = [
  'canonical',
  'workbench',
  'records',
  'legacy',
]

const DocumentationSearch = ({
  inputId,
  onNavigate,
}: {
  inputId: string
  onNavigate?: () => void
}) => {
  const { t } = useLingui()
  const navigate = useNavigate()
  const { pathname, search } = useLocation()
  const { navigateToSection, sections } = useDocumentationSection()
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)
  const results = useMemo(
    () => (query.trim() ? searchDocumentation(query, t).slice(0, 12) : []),
    [query, t]
  )
  const activeResult = results[activeIndex]
  const hasQuery = query.trim().length > 0
  const activeResultId =
    activeIndex >= 0 ? `${inputId}-result-${activeIndex}` : undefined

  const select = (route: string) => {
    const [pathAndSearch, hash = ''] = route.split('#')
    if (
      pathAndSearch === `${pathname}${search}` &&
      hash &&
      sections.some(({ id }) => id === hash)
    )
      navigateToSection(hash)
    else navigate(route)
    setQuery('')
    setActiveIndex(-1)
    onNavigate?.()
  }

  return (
    <div className="relative">
      <label className="sr-only" htmlFor={inputId}>
        {t`Search design system`}
      </label>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground"
      />
      <input
        id={inputId}
        role="combobox"
        aria-label={t`Search design system`}
        aria-autocomplete="list"
        aria-expanded={hasQuery}
        aria-controls={`${inputId}-results`}
        aria-activedescendant={activeResultId}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value)
          setActiveIndex(-1)
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' && results.length > 0) {
            event.preventDefault()
            setActiveIndex((current) => (current + 1) % results.length)
          }
          if (event.key === 'ArrowUp' && results.length > 0) {
            event.preventDefault()
            setActiveIndex((current) =>
              current <= 0 ? results.length - 1 : current - 1
            )
          }
          if (event.key === 'Enter' && activeResult) {
            event.preventDefault()
            select(activeResult.route)
          }
          if (event.key === 'Escape') {
            setQuery('')
            setActiveIndex(-1)
          }
        }}
        placeholder={t`Search`}
        className="h-11 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
      />
      {hasQuery && (
        <div
          id={`${inputId}-results`}
          role={results.length > 0 ? 'listbox' : 'status'}
          className={cn(
            'absolute inset-x-0 top-12 z-40 max-h-[min(26rem,60vh)] overflow-y-auto border border-border bg-background shadow-lg',
            results.length > 0 ? 'py-2' : 'px-3 py-3'
          )}
        >
          {results.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {t`No results found.`}
            </p>
          )}
          {DESTINATIONS.map((destination) => {
            const grouped = results.filter(
              (result) => result.destination === destination
            )
            if (grouped.length === 0) return null

            return (
              <div
                key={destination}
                data-testid={`documentation-search-group-${destination}`}
              >
                <p className="px-3 pb-1 pt-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {t(DOCUMENTATION_DESTINATION_MESSAGES[destination])}
                </p>
                {grouped.map((result) => {
                  const index = results.indexOf(result)
                  return (
                    <button
                      key={`${result.destination}:${result.sourceKey}:${result.route}`}
                      id={`${inputId}-result-${index}`}
                      role="option"
                      aria-selected={index === activeIndex}
                      type="button"
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => select(result.route)}
                      className={cn(
                        'block min-h-11 w-full px-3 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
                        index === activeIndex && 'bg-muted'
                      )}
                    >
                      <span className="block text-sm font-medium">
                        {translateDocumentationText(result.label, t)}
                      </span>
                      <span className="mt-0.5 block text-xs leading-4 text-muted-foreground">
                        {translateDocumentationText(result.description, t)}
                      </span>
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default DocumentationSearch
