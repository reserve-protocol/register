import { Trans, useLingui } from '@lingui/react/macro'
import { ArrowRight } from 'lucide-react'
import { useState, type ReactNode } from 'react'

import { Button } from '@/components/button'
import { Link as DesignSystemLink } from '@/components/design-system-v1/link'
import { Pagination } from '@/components/design-system-v1/pagination'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  type TabsSize,
  type TabsWidth,
} from '@/components/design-system-v1/tabs'
import {
  DocumentationSpecimenCell,
  DocumentationSpecimenGrid,
} from './documentation-specimen-layout'

export const NavigationComponentSpecimen = ({ itemId }: { itemId: string }) => {
  const { t } = useLingui()
  const [page, setPage] = useState(2)
  const [pageSize, setPageSize] = useState(25)

  if (itemId === 'link') {
    return (
      <DocumentationSpecimenGrid className="xl:grid-cols-2">
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
        <DocumentationSpecimenCell label={<Trans>External resource</Trans>}>
          <DesignSystemLink
            treatment="standalone"
            href="https://docs.reserve.org"
            external
            externalAnnouncement={t`, opens in a new tab`}
          >
            <Trans>Reserve documentation</Trans>
          </DesignSystemLink>
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell
          label={<Trans>Button-shaped navigation</Trans>}
          className="sm:col-span-2"
        >
          <Button asChild trailingIcon={<ArrowRight aria-hidden="true" />}>
            <a href="#pagination">
              <Trans>View pagination</Trans>
            </a>
          </Button>
        </DocumentationSpecimenCell>
      </DocumentationSpecimenGrid>
    )
  }

  if (itemId === 'tabs') {
    return (
      <DocumentationSpecimenGrid className="xl:grid-cols-2">
        <DocumentationSpecimenCell label={<Trans>Default · intrinsic</Trans>}>
          <DocumentationTabs size="default" />
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell label={<Trans>Compact · intrinsic</Trans>}>
          <DocumentationTabs size="compact" />
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell
          label={<Trans>Default · full width</Trans>}
          className="sm:col-span-2"
        >
          <DocumentationTabs size="default" width="full" />
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell
          label={<Trans>Important states</Trans>}
          className="sm:col-span-2"
        >
          <Tabs defaultValue="selected">
            <TabsList size="compact" aria-label={t`Tab state coverage`}>
              <TabsTrigger value="available">
                <Trans>Available</Trans>
              </TabsTrigger>
              <TabsTrigger value="selected">
                <Trans>Selected</Trans>
              </TabsTrigger>
              <TabsTrigger value="unavailable" disabled>
                <Trans>Unavailable</Trans>
              </TabsTrigger>
            </TabsList>
            <TabsContent
              value="available"
              className="mt-3 text-sm text-muted-foreground"
            >
              <Trans>Available panel</Trans>
            </TabsContent>
            <TabsContent
              value="selected"
              className="mt-3 text-sm text-muted-foreground"
            >
              <Trans>Selected panel</Trans>
            </TabsContent>
          </Tabs>
        </DocumentationSpecimenCell>
      </DocumentationSpecimenGrid>
    )
  }

  if (itemId === 'pagination') {
    return (
      <div className="w-full space-y-6">
        <DocumentationSpecimenCell
          label={<Trans>Middle page · optional page size</Trans>}
        >
          <Pagination
            currentPage={page}
            pageCount={8}
            visibleCount={pageSize}
            totalCount={186}
            onPageChange={setPage}
            pageSize={pageSize}
            pageSizeOptions={[10, 25, 50]}
            onPageSizeChange={setPageSize}
          />
        </DocumentationSpecimenCell>
        <DocumentationPaginationBoundary
          initialPage={1}
          label={<Trans>First page</Trans>}
        />
        <DocumentationPaginationBoundary
          initialPage={8}
          label={<Trans>Last page</Trans>}
        />
      </div>
    )
  }

  return null
}

const DocumentationTabs = ({
  size,
  width = 'intrinsic',
}: {
  size: TabsSize
  width?: TabsWidth
}) => (
  <Tabs defaultValue="overview">
    <TabsList
      size={size}
      width={width}
      aria-label={`${size} ${width} position sections`}
    >
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
    <TabsContent
      value="overview"
      className="mt-3 text-sm text-muted-foreground"
    >
      <Trans>Overview panel</Trans>
    </TabsContent>
    <TabsContent
      value="holdings"
      className="mt-3 text-sm text-muted-foreground"
    >
      <Trans>Holdings panel</Trans>
    </TabsContent>
    <TabsContent
      value="governance"
      className="mt-3 text-sm text-muted-foreground"
    >
      <Trans>Governance panel</Trans>
    </TabsContent>
  </Tabs>
)

const DocumentationPaginationBoundary = ({
  initialPage,
  label,
}: {
  initialPage: number
  label: ReactNode
}) => {
  const [currentPage, setCurrentPage] = useState(initialPage)

  return (
    <DocumentationSpecimenCell label={label}>
      <Pagination
        currentPage={currentPage}
        pageCount={8}
        visibleCount={initialPage === 8 ? 11 : 25}
        totalCount={186}
        onPageChange={setCurrentPage}
      />
    </DocumentationSpecimenCell>
  )
}
