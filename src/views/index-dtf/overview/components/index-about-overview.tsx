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
import { Download, ImagePlus } from 'lucide-react'
import { Fragment, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTrackIndexDTFClick } from '../../hooks/useTrackIndexDTFPage'
import SectionAnchor from '@/components/section-anchor'
import { Trans, useLingui } from '@lingui/react/macro'
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

// Per-token resources for the AI DTF suite, hardcoded in Register and keyed by
// DTF address (lowercase) across every chain the token is deployed on:
//   - Tear Sheet: locale-specific PDF hosted on storage.reserve.org.
//   - LLM Markdown: single Markdown doc served from /public/dtf-llm.
const TEARSHEET_LOCALES: SupportedLocale[] = ['en', 'es', 'ko', 'zh']

const DTF_RESOURCE_TOKEN_BY_ADDRESS: Record<string, string> = {
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

const getDtfResourceUrls = (
  dtfAddress: string,
  locale: SupportedLocale
): { tearsheetUrl: string; referenceUrl: string } | null => {
  const tokenName = DTF_RESOURCE_TOKEN_BY_ADDRESS[dtfAddress.toLowerCase()]
  if (!tokenName) return null

  // Fall back to the default locale for any locale without a tearsheet (e.g. pseudo).
  const tearsheetLocale = TEARSHEET_LOCALES.includes(locale)
    ? locale
    : DEFAULT_LOCALE

  return {
    tearsheetUrl: `https://storage.reserve.org/${tokenName}_DTF_Tearsheet_${tearsheetLocale}.pdf`,
    referenceUrl: `/dtf-llm/${tokenName.toLowerCase()}-dtf.md`,
  }
}

const useDownloadableResources = () => {
  const { t } = useLingui()
  const data = useAtomValue(indexDTFAtom)
  const locale = useAtomValue(localeAtom)
  const brandData = useAtomValue(indexDTFBrandAtom)
  const files = brandData?.dtf?.files?.filter((file) => file.url) ?? []

  const hardcodedUrls = data?.id ? getDtfResourceUrls(data.id, locale) : null
  const resources = [
    ...(hardcodedUrls
      ? [
          { url: hardcodedUrls.tearsheetUrl, name: t`Tear Sheet` },
          // WHY: brand/technical term — same across locales, intentionally not translated.
          { url: hardcodedUrls.referenceUrl, name: 'LLM Markdown' },
        ]
      : []),
    ...files,
  ]

  return {
    resources,
    dtfName: data?.token.name ?? 'this DTF',
  }
}

const DownloadableResources = () => {
  const { resources, dtfName } = useDownloadableResources()

  if (!resources.length) return null

  return (
    <>
      <div className="border-t border-secondary" />
      <div className="rounded-3xl bg-card p-5 sm:p-6">
        <h3 className="font-medium mb-1">
          <Trans>Downloadable resources</Trans>
        </h3>
        <p className="text-legend mb-1">
          <Trans>
            More information on what {dtfName} is, what it’s all about,
            methodology and thesis.
          </Trans>
        </p>
        <div className="mt-2 flex items-center gap-x-4 gap-y-2 sm:mt-4 sm:flex-wrap sm:gap-x-5">
          {resources.map((file, index) => (
            <Fragment key={file.url}>
              {index > 0 && (
                <div className="h-6 w-px shrink-0 bg-border sm:hidden" />
              )}
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-w-0 flex-1 flex-row-reverse items-center justify-between gap-2 text-base font-medium text-primary hover:underline sm:flex-none sm:flex-row sm:justify-start sm:text-sm"
              >
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Download size={12} strokeWidth={2} />
                </div>
                <span className="truncate">
                  {file.name || getFileNameFromUrl(file.url)}
                </span>
              </a>
            </Fragment>
          ))}
        </div>
      </div>
    </>
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
      <Header />
      {showCover && <DtfCover className="m-2 rounded-xl" />}
      <div className={cn('p-5 sm:p-6', showCover && 'mt-0')}>
        <Mandate anchorId={id} />
        <IndexAboutMeta />
      </div>
      <DownloadableResources />
    </div>
  </div>
)

export default IndexAboutOverview
