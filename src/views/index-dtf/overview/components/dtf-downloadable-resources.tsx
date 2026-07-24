import { DEFAULT_LOCALE, localeAtom, type SupportedLocale } from '@/i18n'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { indexDTFAtom, indexDTFBrandAtom } from '@/state/dtf/atoms'
import { getFileNameFromUrl } from '@/utils'
import { isSafeHttpUrl } from '@/utils/url'
import { Trans, useLingui } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import { Download } from 'lucide-react'
import { useTrackIndexDTFClick } from '../../hooks/useTrackIndexDTFPage'

// Per-token resources for the AI DTF suite, hardcoded in Register and keyed by
// DTF address (lowercase) across every chain the token is deployed on:
//   - Tear Sheet: locale-specific PDF hosted on storage.reserve.org.
//   - LLM-ready Markdown: single Markdown doc served from /public/dtf-llm.
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
  const files =
    brandData?.dtf?.files?.filter((file) => isSafeHttpUrl(file.url)) ?? []

  const hardcodedUrls = data?.id ? getDtfResourceUrls(data.id, locale) : null
  const resources = [
    ...(hardcodedUrls
      ? [
          { url: hardcodedUrls.tearsheetUrl, name: t`Tear Sheet` },
          {
            url: hardcodedUrls.referenceUrl,
            name: t`Markdown file for your LLM`,
          },
        ]
      : []),
    ...files,
  ]

  return {
    resources,
    dtfName: data?.token.name ?? 'this DTF',
  }
}

// Hold the rendered footprint (heading + blurb + two download links) while
// the DTF is still loading so the about card doesn't grow when it lands.
const DownloadableResourcesSkeleton = ({
  className,
  showDivider,
}: {
  className?: string
  showDivider?: boolean
}) => (
  <>
    {showDivider && <div className="border-t border-secondary" />}
    <div className={cn('rounded-3xl bg-card sm:p-6', className)}>
      <div className="p-5 pb-2 sm:p-0">
        <Skeleton className="mb-2 h-5 w-52" />
        <Skeleton className="mb-1 h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="flex flex-col gap-2 p-2 sm:mt-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5 sm:p-0">
        {[0, 1].map((pill) => (
          <div
            key={pill}
            className="flex items-center gap-2.5 rounded-full border p-3 sm:gap-2 sm:rounded-none sm:border-none sm:p-0"
          >
            <Skeleton className="size-6 rounded-full" />
            <Skeleton className="h-4 w-28" />
          </div>
        ))}
      </div>
    </div>
  </>
)

const DownloadableResources = ({
  className,
  showDivider = true,
}: {
  className?: string
  showDivider?: boolean
}) => {
  const data = useAtomValue(indexDTFAtom)
  const { resources, dtfName } = useDownloadableResources()
  const { trackClick } = useTrackIndexDTFClick('overview', 'overview')

  if (!data) {
    return (
      <DownloadableResourcesSkeleton
        className={className}
        showDivider={showDivider}
      />
    )
  }

  if (!resources.length) return null

  return (
    <>
      {showDivider && <div className="border-t border-secondary" />}
      <div className={cn('rounded-3xl bg-card sm:p-6', className)}>
        <div className="p-5 pb-2 sm:p-0">
          <h3 className="mb-1 font-medium">
            <Trans>Downloadable resources</Trans>
          </h3>
          <p className="mb-1 text-legend">
            <Trans>
              More information on what {dtfName} is, what it’s all about,
              methodology and thesis.
            </Trans>
          </p>
        </div>
        <div className="flex flex-col gap-2 p-2 sm:mt-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5 sm:p-0">
          {resources.map((file) => (
            <a
              key={file.url}
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                trackClick('downloadable_resource', {
                  resource: file.name,
                  url: file.url,
                })
              }
              className="flex min-w-0 items-center justify-start gap-2.5 rounded-full border p-3 text-base font-medium text-primary hover:underline sm:flex-none sm:gap-2 sm:rounded-none sm:border-none sm:p-0 sm:text-sm"
            >
              <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Download size={12} strokeWidth={2} />
              </div>
              <span className="min-w-0">
                {file.name || getFileNameFromUrl(file.url)}
              </span>
            </a>
          ))}
        </div>
      </div>
    </>
  )
}

export default DownloadableResources
