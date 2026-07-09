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

  // Almost nobody is a brand manager, so the loading state matches the common
  // final state: nothing. A skeleton here caused pure layout shift.
  if (!data || !isBrandManager) {
    return null
  }

  return (
    <div className="mb-4 mt-2 flex justify-center px-2">
      <BrandManagerEditButton />
    </div>
  )
}

// Mirror the rendered shape (title + a few paragraphs at PHOTON-ish length)
// so the about card doesn't grow when the description lands.
const MandateSkeleton = () => (
  <div className="flex flex-col gap-3 sm:gap-2">
    <Skeleton className="h-8 w-48" />
    <div className="space-y-2">
      {[3, 4, 3].map((lines, paragraph) => (
        <div key={paragraph} className="space-y-1.5 pt-1">
          {Array.from({ length: lines }, (_, line) => (
            <Skeleton
              key={line}
              className={cn('h-4', line === lines - 1 ? 'w-3/4' : 'w-full')}
            />
          ))}
        </div>
      ))}
    </div>
  </div>
)

const Mandate = ({ anchorId = 'about' }: { anchorId?: string }) => {
  const data = useAtomValue(indexDTFAtom)
  const brandData = useAtomValue(indexDTFBrandAtom)
  const [expanded, setExpanded] = useState(false)

  if (!data || !brandData) {
    return <MandateSkeleton />
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
