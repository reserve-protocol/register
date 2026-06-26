import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  indexDTFAtom,
  indexDTFBrandAtom,
  isBrandManagerAtom,
} from '@/state/dtf/atoms'
import { getFileNameFromUrl } from '@/utils'
import { ROUTES } from '@/utils/constants'
import { DEFAULT_LOCALE, localeAtom, type SupportedLocale } from '@/i18n'
import { useAtomValue } from 'jotai'
import { BrickWall, Download, ImagePlus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTrackIndexDTFClick } from '../../hooks/useTrackIndexDTFPage'
import SectionAnchor from '@/components/section-anchor'
import { Trans, useLingui } from '@lingui/react/macro'

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
      <p className="text-legend whitespace-pre-line">
        {brandData.dtf?.description || data.mandate}
      </p>
    </div>
  )
}

// Locale-specific tearsheets hosted on storage.reserve.org, one PDF per locale.
// Keyed by DTF address (lowercase) across every chain the token is deployed on.
const TEARSHEET_LOCALES: SupportedLocale[] = ['en', 'es', 'ko', 'zh']

const TEARSHEET_TOKEN_BY_ADDRESS: Record<string, string> = {
  // PHOTON
  '0x5039ece83dc4e0621ebec391128339bd859a84d0': 'PHOTON',
  '0xa0fe4e0aeca5479705ce996615b2eacb6b6a10fb': 'PHOTON',
  // BUILDOUT
  '0x1ec1d815488936ec8add5cb76ac4563ceef09de3': 'BUILDOUT',
  '0xd7ce7a841310982acd976d1a6fe7bb6063c5689d': 'BUILDOUT',
  // ROBOTS
  '0x09a823930fab5b1fda6e519b1ee33e7da9bda0e5': 'ROBOTS',
  '0x75617e7653f86f074cc30b9fd4ebf52ba9b62247': 'ROBOTS',
  // POWER
  '0x3ce752a0eb838084562c9d7a0e1df24a8ae9542d': 'POWER',
  '0x290bcc0fd5096cc3261ae2021841c7bc67cb0f51': 'POWER',
  // NEOCLOUD
  '0x9429a7332b5a3bcde2781b65ac1a9ebd9f466e12': 'NEOCLOUD',
  '0xf571fe3f0d74521bc7310b111faea931c748f27b': 'NEOCLOUD',
}

const getTearsheetUrl = (
  dtfAddress: string,
  locale: SupportedLocale
): string | null => {
  const tokenName = TEARSHEET_TOKEN_BY_ADDRESS[dtfAddress.toLowerCase()]
  if (!tokenName) return null

  // Fall back to the default locale for any locale without a tearsheet (e.g. pseudo).
  const target = TEARSHEET_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE
  return `https://storage.reserve.org/${tokenName}_DTF_Tearsheet_${target}.pdf`
}

const DownloadableResources = () => {
  const { t } = useLingui()
  const data = useAtomValue(indexDTFAtom)
  const locale = useAtomValue(localeAtom)
  const brandData = useAtomValue(indexDTFBrandAtom)
  const files = brandData?.dtf?.files?.filter((file) => file.url) ?? []

  const tearsheetUrl = data?.id ? getTearsheetUrl(data.id, locale) : null
  const resources = [
    ...(tearsheetUrl ? [{ url: tearsheetUrl, name: t`Tear Sheet` }] : []),
    ...files,
  ]

  if (!resources.length) return null

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
        {resources.map((file) => (
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
