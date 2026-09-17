import { Trans, useLingui } from '@lingui/react/macro'
import { Link, useLocation } from 'react-router-dom'

import { cn } from '@/lib/utils'
import { useDocumentationSection } from './documentation-section-observer'

interface DocumentationTocItem {
  id: string
  label: string
}

const DocumentationToc = ({
  items,
}: {
  items: readonly DocumentationTocItem[]
}) => {
  const { t } = useLingui()
  const { pathname, search } = useLocation()
  const { activeSectionPath } = useDocumentationSection()

  return (
    <aside
      data-testid="documentation-table-of-contents"
      aria-label={t`On this page`}
      className="sticky top-6 hidden self-start xl:block"
    >
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <Trans>On this page</Trans>
      </p>
      <nav className="mt-3 border-l border-border pl-3">
        {items.map((item) => (
          <Link
            key={item.id}
            aria-current={
              activeSectionPath.includes(item.id) ? 'location' : undefined
            }
            to={{ pathname, search, hash: `#${item.id}` }}
            className={cn(
              'flex min-h-11 items-center py-2 text-xs text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              activeSectionPath.includes(item.id) && 'text-foreground'
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}

export default DocumentationToc
