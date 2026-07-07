import SectionAnchor from '@/components/section-anchor'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import {
  indexDTFAtom,
  indexDTFBrandAtom,
  isBrandManagerAtom,
} from '@/state/dtf/atoms'
import { ROUTES } from '@/utils/constants'
import { Trans } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import { ImagePlus } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTrackIndexDTFClick } from '../../hooks/useTrackIndexDTFPage'
import DownloadableResources from './dtf-downloadable-resources'
import IndexAboutMeta from './index-about-meta'
import DtfCover from './landing-mint/dtf-cover'

const BrandManagerEditButton = () => {
  const isBrandManager = useAtomValue(isBrandManagerAtom)
  const { trackClick } = useTrackIndexDTFClick('overview', 'overview')

  if (!isBrandManager) {
    return null
  }

  return (
    <Link
      to={`../${ROUTES.MANAGE}`}
      onClick={() => trackClick('brand_manager')}
    >
      <Button variant="outline" size="sm" className="gap-1 rounded-full">
        <ImagePlus size={14} />
        <Trans>Edit page</Trans>
      </Button>
    </Link>
  )
}

const Header = () => {
  const data = useAtomValue(indexDTFAtom)
  const isBrandManager = useAtomValue(isBrandManagerAtom)

  if (data && !isBrandManager) {
    return null
  }

  return (
    <div className="mb-4 mt-2 flex justify-center px-2">
      {!data ? <Skeleton className="w-60 h-6" /> : <BrandManagerEditButton />}
    </div>
  )
}

const Mandate = ({ anchorId = 'about' }: { anchorId?: string }) => {
  const data = useAtomValue(indexDTFAtom)
  const brandData = useAtomValue(indexDTFBrandAtom)
  const [expanded, setExpanded] = useState(false)

  if (!data || !brandData) {
    return <Skeleton className="w-full h-20" />
  }

  const description = brandData.dtf?.description || data.mandate
  const descriptionParagraphs = description
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
  // NOTE: threshold matches the 560-char excerpt slice below — a lower value
  // renders the full text with a no-op "Read more" for mid-length descriptions.
  const shouldCollapse =
    description.length > 560 || descriptionParagraphs.length > 2
  const flattened = description.replace(/\s+/g, ' ').trim()
  const excerpt = shouldCollapse
    ? // Short multi-paragraph texts collapse for layout, not length — no "…".
      flattened.length > 560
      ? `${flattened.slice(0, 560).trim()}...`
      : flattened
    : description

  return (
    <div className="flex flex-col gap-3 sm:gap-2">
      <div className="flex items-center gap-1">
        <h2 className="text-2xl font-light">
          <Trans>About this DTF</Trans>
        </h2>
        <SectionAnchor id={anchorId} />
      </div>
      <div className="text-legend">
        <div className="space-y-2">
          {shouldCollapse && !expanded ? (
            <>
              <p className="sm:hidden">
                {excerpt}{' '}
                <button
                  type="button"
                  className="font-medium text-primary"
                  onClick={() => setExpanded(true)}
                >
                  <Trans>Read more</Trans>
                </button>
              </p>
              <div className="hidden space-y-2 sm:block">
                {descriptionParagraphs.map((paragraph, index) => (
                  <p key={index} className="whitespace-pre-line">
                    {paragraph}
                  </p>
                ))}
              </div>
            </>
          ) : (
            descriptionParagraphs.map((paragraph, index) => (
              <p key={index} className="whitespace-pre-line">
                {paragraph}
              </p>
            ))
          )}
        </div>
        {shouldCollapse && expanded && (
          <button
            type="button"
            className="mt-2 text-sm font-medium text-primary sm:hidden"
            onClick={() => setExpanded(false)}
          >
            <Trans>Read less</Trans>
          </button>
        )}
      </div>
    </div>
  )
}

const IndexAboutOverview = ({
  className,
  id,
  showCover = false,
}: {
  className?: string
  id?: string
  showCover?: boolean
}) => (
  <div id={id} className={cn('group/section', className)}>
    <div>
      {showCover && (
        <DtfCover className="m-2 rounded-xl md:hidden" showBrandImage={false} />
      )}
      <Header />
      <div className={cn('p-5 sm:p-6', showCover && 'mt-0')}>
        <Mandate anchorId={id} />
        <IndexAboutMeta />
      </div>
      {showCover ? (
        <>
          <div className="hidden border-t border-secondary p-2 empty:hidden md:grid md:grid-cols-2 md:gap-2">
            <DtfCover className="rounded-xl" showBrandImage={false} />
            <DownloadableResources
              className="flex h-full flex-col justify-end"
              showDivider={false}
            />
          </div>
          <div className="md:hidden">
            <DownloadableResources />
          </div>
        </>
      ) : (
        <DownloadableResources />
      )}
    </div>
  </div>
)

export default IndexAboutOverview
