import { Trans, useLingui } from '@lingui/react/macro'
import { useState } from 'react'

import { Link as DesignSystemLink } from '@/components/design-system-v1/link'
import { Pagination } from '@/components/design-system-v1/pagination'
import { Tabs, TabsList, TabsTrigger } from '@/components/design-system-v1/tabs'
import {
  DocumentationSpecimenCell,
  DocumentationSpecimenGrid,
} from './documentation-specimen-layout'

export const NavigationComponentSpecimen = ({ itemId }: { itemId: string }) => {
  const { t } = useLingui()
  const [page, setPage] = useState(2)

  if (itemId === 'link') {
    return (
      <DocumentationSpecimenGrid>
        <DocumentationSpecimenCell label={<Trans>Inline</Trans>}>
          <p className="text-sm text-muted-foreground">
            <Trans>Read the</Trans>{' '}
            <DesignSystemLink href="#navigation">
              <Trans>component guidance</Trans>
            </DesignSystemLink>
            .
          </p>
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell label={<Trans>Standalone</Trans>}>
          <DesignSystemLink treatment="standalone" href="#navigation">
            <Trans>Open navigation guidance</Trans>
          </DesignSystemLink>
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell label={<Trans>Return</Trans>}>
          <DesignSystemLink treatment="return" href="#navigation">
            <Trans>Back to navigation</Trans>
          </DesignSystemLink>
        </DocumentationSpecimenCell>
      </DocumentationSpecimenGrid>
    )
  }

  if (itemId === 'tabs') {
    return (
      <Tabs defaultValue="overview">
        <TabsList aria-label={t`Position sections`}>
          <TabsTrigger value="overview">
            <Trans>Overview</Trans>
          </TabsTrigger>
          <TabsTrigger value="holdings">
            <Trans>Holdings</Trans>
          </TabsTrigger>
          <TabsTrigger value="governance">
            <Trans>Governance</Trans>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    )
  }

  if (itemId === 'pagination') {
    return (
      <div className="w-full">
        <Pagination
          currentPage={page}
          pageCount={8}
          visibleCount={25}
          totalCount={186}
          onPageChange={setPage}
        />
      </div>
    )
  }

  return null
}
