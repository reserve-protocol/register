import { ChevronDown } from 'lucide-react'
import { useLingui } from '@lingui/react/macro'

import { translateDocumentationText } from './documentation-presentation'
import { useDocumentationSection } from './documentation-section-observer'

const DocumentationMobileSectionControl = () => {
  const { t } = useLingui()
  const { activeSectionId, navigateToSection, sections } =
    useDocumentationSection()

  if (!activeSectionId || !sections.length) return null

  return (
    <label className="relative min-w-0 flex-1">
      <span className="sr-only">{t`On this page`}</span>
      <select
        data-testid="documentation-mobile-section-control"
        aria-label={t`On this page`}
        value={activeSectionId}
        onChange={(event) => navigateToSection(event.target.value)}
        className="h-11 w-full min-w-0 appearance-none truncate border-0 bg-transparent py-0 pl-2 pr-8 text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {sections
          .filter((section) => section.path.length === 1)
          .map((section) => {
            const children = sections.filter(
              (candidate) =>
                candidate.path.length > 1 &&
                candidate.path[0] === section.path[0]
            )
            const label = translateDocumentationText(section.label, t)

            if (!children.length)
              return (
                <option key={section.id} value={section.id}>
                  {label}
                </option>
              )

            return (
              <optgroup key={section.id} label={label}>
                <option value={section.id}>{label}</option>
                {children.map((child) => (
                  <option key={child.id} value={child.id}>
                    {translateDocumentationText(child.label, t)}
                  </option>
                ))}
              </optgroup>
            )
          })}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      />
    </label>
  )
}

export default DocumentationMobileSectionControl
