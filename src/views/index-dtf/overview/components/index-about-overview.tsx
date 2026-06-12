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
import { BrickWall, Download, ImagePlus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTrackIndexDTFClick } from '../../hooks/useTrackIndexDTFPage'
import SectionAnchor from '@/components/section-anchor'
import { Trans } from '@lingui/react/macro'

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

  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="rounded-full border border-foreground p-2 mr-auto">
        <BrickWall size={14} strokeWidth={1.5} />
      </div>

      {!data ? (
        <Skeleton className="w-60 h-6" />
      ) : (
        <BrandManagerEditButton />
      )}
    </div>
  )
}

const Mandate = () => {
  const data = useAtomValue(indexDTFAtom)
  const brandData = useAtomValue(indexDTFBrandAtom)

  if (!data || !brandData) {
    return <Skeleton className="w-full h-20" />
  }

  return (
    <div>
      <div className="flex items-center gap-1">
        <h2 className="text-2xl font-light mb-1">
          <Trans>About this DTF</Trans>
        </h2>
        <SectionAnchor id="about" />
      </div>
      <p className="text-legend">
        {brandData.dtf?.description || data.mandate}
      </p>
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

const AboutLinks = () => {
  const brandData = useAtomValue(indexDTFBrandAtom)

  return (
    <div className="flex items-center gap-4 text-sm mt-4">
      {brandData?.socials?.website && (
        <Link
          to={brandData.socials.website}
          target="_blank"
          className="underline text-muted-foreground hover:text-foreground"
        >
          <Trans>Website</Trans>
        </Link>
      )}
      <Link
        to={`../${ROUTES.FACTSHEET}`}
        className="underline text-muted-foreground hover:text-foreground"
      >
        <Trans>Performance Sheet</Trans>
      </Link>
      {brandData?.socials?.twitter && (
        <Link
          to={brandData.socials.twitter}
          target="_blank"
          className="underline text-muted-foreground hover:text-foreground"
        >
          <Trans>X Account</Trans>
        </Link>
      )}
    </div>
  )
}

const IndexAboutOverview = () => (
  <div id="about" className="group/section">
    <div className="p-4 sm:p-6">
      <Header />
      <Mandate />
      <AboutLinks />
      <DownloadableResources />
    </div>
  </div>
)

export default IndexAboutOverview
