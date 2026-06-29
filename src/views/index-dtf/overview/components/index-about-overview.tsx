import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  indexDTFAtom,
  indexDTFBrandAtom,
  isBrandManagerAtom,
} from '@/state/dtf/atoms'
import { getFileNameFromUrl } from '@/utils'
import { ROUTES } from '@/utils/constants'
import { useAtomValue } from 'jotai'
import { Download, ImagePlus } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTrackIndexDTFClick } from '../../hooks/useTrackIndexDTFPage'
import SectionAnchor from '@/components/section-anchor'
import { Trans } from '@lingui/react/macro'
import { cn } from '@/lib/utils'
import DtfCover from './landing-mint/dtf-cover'
import IndexAboutMeta from './index-about-meta'

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
    <div className="flex justify-center mb-4 mt-2">
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
  const shouldCollapse =
    description.length > 420 || descriptionParagraphs.length > 2
  const excerpt = shouldCollapse
    ? `${description.replace(/\s+/g, ' ').trim().slice(0, 560).trim()}...`
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

const DownloadableResources = () => {
  const data = useAtomValue(indexDTFAtom)
  const brandData = useAtomValue(indexDTFBrandAtom)
  const files = brandData?.dtf?.files?.filter((file) => file.url) ?? []

  if (!files.length) return null

  const dtfName = data?.token.name ?? 'this DTF'

  return (
    <div className="border-y mt-4 py-4">
      <h3 className="font-medium">
        <Trans>Downloadable resources</Trans>
      </h3>
      <p className="text-legend mb-1">
        <Trans>
          More information on what {dtfName} is, what it’s all about,
          methodology and thesis.
        </Trans>
      </p>
      <div className="flex flex-wrap items-center gap-x-7 gap-y-2 py-2">
        {files.map((file) => (
          <a
            key={file.url}
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-primary hover:underline"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
              <Download size={16} strokeWidth={1.5} />
            </div>
            {file.name || getFileNameFromUrl(file.url)}
          </a>
        ))}
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
    <div className="p-2">
      <Header />
      {showCover && <DtfCover className="rounded-xl" />}
      <div className={cn('p-3 sm:p-4', showCover && 'mt-2 sm:mt-3')}>
        <Mandate anchorId={id} />
        <IndexAboutMeta />
        <DownloadableResources />
      </div>
    </div>
  </div>
)

export default IndexAboutOverview
