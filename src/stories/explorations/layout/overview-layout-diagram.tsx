import { cn } from '@/lib/utils'
import { v1Typography as typography } from '@/components/design-system-v1/typography'
import { v1LayoutRecipes as layout } from '@/components/ui/v1-layout-recipes'

export type OverviewLayoutArgs = {
  viewport: '1600' | '1440' | '1372' | '1371' | '1280' | '1024' | '390'
  frameCap: '1400' | '1600'
  gutter: '24' | '0'
  supportWidth: '480' | '432'
  expandedNavigation: boolean
  about: 'video' | 'text'
  cover: boolean
}

const viewportClasses = {
  '1600': 'w-[1600px]',
  '1440': 'w-[1440px]',
  '1372': 'w-[1372px]',
  '1371': 'w-[1371px]',
  '1280': 'w-[1280px]',
  '1024': 'w-[1024px]',
  '390': 'w-[390px]',
} as const

export function OverviewLayoutDiagram(args: OverviewLayoutArgs) {
  const viewport = Number(args.viewport)
  const gutter = viewport >= 640 ? Number(args.gutter) : 0
  const frameWidth = Math.min(Number(args.frameCap), viewport - gutter * 2)
  const desktopNavigation = viewport >= 1024
  const navigationSpace = desktopNavigation ? 74 : 0
  const hasSupport =
    frameWidth - navigationSpace >= 768 + 2 + Number(args.supportWidth)
  const primaryWidth =
    frameWidth -
    navigationSpace -
    (hasSupport ? Number(args.supportWidth) + 2 : 0)
  const phone = viewport < 640
  const aboutFirst = !hasSupport && (!phone || args.about === 'video')

  return (
    <figure className={cn('m-0 space-y-4', !phone && 'p-4')} data-wide-docs>
      <figcaption className={cn(typography.supporting, phone && 'px-4 pt-4')}>
        Proposed layout · {viewport}px viewport · {frameWidth}px frame ·{' '}
        {primaryWidth}px primary ·{' '}
        {hasSupport
          ? `${args.supportWidth}px support`
          : 'support content moves into the main flow'}
      </figcaption>
      <div
        className={cn('max-w-full overflow-x-auto bg-muted', !phone && 'p-4')}
        data-testid="overview-layout-review-frame"
      >
        <div
          className={cn(
            viewportClasses[args.viewport],
            gutter === 24 && 'px-6'
          )}
          data-testid="overview-layout-viewport"
        >
          <div
            className={cn(
              'mx-auto grid bg-secondary',
              layout.seam.major,
              args.frameCap === '1400' ? 'max-w-[1400px]' : 'max-w-[1600px]'
            )}
            data-testid="overview-layout-shell"
          >
            <div
              className={cn(
                'flex items-center justify-between bg-card',
                typography.label,
                phone ? 'min-h-14 p-4' : 'min-h-[76px] px-6 py-4'
              )}
            >
              <span>Global navigation</span>
              {!phone && (
                <span className="font-light text-muted-foreground">
                  Same frame as the page
                </span>
              )}
            </div>
            <div
              className={cn(
                'grid items-start',
                layout.seam.major,
                desktopNavigation && 'grid-cols-[72px_minmax(0,1fr)]'
              )}
            >
              {desktopNavigation && (
                <div
                  className="relative h-full bg-card"
                  data-testid="overview-layout-navigation"
                >
                  <div
                    className={cn(
                      'px-2 py-6 text-center',
                      typography.auxiliary
                    )}
                  >
                    DTF
                    <br />
                    navigation
                    <br />
                    72px
                  </div>
                  {args.expandedNavigation && (
                    <div
                      className={cn(
                        'absolute inset-y-0 left-0 z-10 w-64 bg-card p-6 shadow-sm',
                        typography.supporting
                      )}
                      data-testid="overview-layout-expanded-navigation"
                    >
                      Expanded DTF navigation · 256px
                      <p className="mt-2 text-muted-foreground">
                        Overlays content. Primary width stays the same.
                      </p>
                    </div>
                  )}
                </div>
              )}
              <div
                className={cn(
                  'grid min-w-0 items-start',
                  layout.seam.major,
                  hasSupport &&
                    (args.supportWidth === '480'
                      ? 'grid-cols-[minmax(768px,1fr)_480px]'
                      : 'grid-cols-[minmax(768px,1fr)_432px]')
                )}
              >
                <div
                  className={cn('grid min-w-0', layout.seam.major)}
                  data-testid="overview-layout-primary"
                >
                  <Region
                    title="Performance"
                    detail="DTF identity, price, range controls and chart"
                    spacious
                  />
                  {aboutFirst &&
                    (phone ? (
                      <AboutRegion
                        about={args.about}
                        cover={args.cover}
                        inline
                      />
                    ) : (
                      <SupportingRegions
                        about={args.about}
                        cover={args.cover}
                        inline
                      />
                    ))}
                  <Region
                    title="Holdings"
                    detail="Exposure and collateral; component responds to its own width"
                    spacious
                  />
                  {!hasSupport && !aboutFirst && (
                    <SupportingRegions
                      about={args.about}
                      cover={args.cover}
                      inline
                    />
                  )}
                  {!hasSupport && aboutFirst && phone && <ContextRegions />}
                  <Region title="Fees and statistics" />
                  <Region
                    title="Governance"
                    detail="When this DTF has governance participation"
                  />
                  <Region title="Creator notes" detail="When supplied" />
                  <Region title="Transactions" />
                  <Region title="Disclosure" />
                </div>
                {hasSupport && (
                  <div
                    className={cn('grid', layout.seam.major)}
                    data-testid="overview-layout-support"
                  >
                    <Region
                      title="Trade"
                      detail="Balance and existing swap or eligibility surface"
                      spacious
                    />
                    <SupportingRegions about={args.about} cover={args.cover} />
                  </div>
                )}
              </div>
            </div>
            {!hasSupport && (
              <div
                className={cn('bg-card p-4', typography.supporting)}
                data-testid="overview-layout-bottom-controls"
              >
                {desktopNavigation
                  ? 'Buy / Sell and chat entry points'
                  : 'DTF switching, page navigation, Buy / Sell and chat entry points'}
                <p className="mt-1 text-muted-foreground">
                  Floating controls reserve clearance above the device safe
                  area.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <p
        className={cn(
          typography.supporting,
          'text-muted-foreground',
          phone && 'px-4 pb-4'
        )}
      >
        Region diagram: widths and 2px beige seams are exact; section heights
        are illustrative. Trading uses the existing overlay approach when its
        column is absent.
      </p>
    </figure>
  )
}

function SupportingRegions({
  about,
  cover,
  inline = false,
}: Pick<OverviewLayoutArgs, 'about' | 'cover'> & { inline?: boolean }) {
  return (
    <>
      <AboutRegion about={about} cover={cover} inline={inline} />
      <ContextRegions />
    </>
  )
}

function AboutRegion({
  about,
  cover,
  inline = false,
}: Pick<OverviewLayoutArgs, 'about' | 'cover'> & { inline?: boolean }) {
  return (
    <>
      {cover && about === 'text' && !inline && (
        <Region
          title="Cover"
          detail="Optional; no reserved space when absent"
        />
      )}
      <Region
        title="About this DTF"
        detail={
          about === 'video'
            ? 'Compact video library'
            : cover && inline
              ? 'Written description, cover and resources'
              : 'Written description and resources'
        }
      />
    </>
  )
}

function ContextRegions() {
  return (
    <>
      <Region title="Ask Reserve AI" />
      <Region title="About Reserve" />
    </>
  )
}

function Region({
  title,
  detail,
  spacious = false,
}: {
  title: string
  detail?: string
  spacious?: boolean
}) {
  return (
    <section
      className={cn(
        'bg-card',
        layout.inset.ordinaryContent,
        spacious && 'min-h-48'
      )}
      aria-label={title}
    >
      <h3 className={typography.itemTitle}>{title}</h3>
      {detail && (
        <p className={cn('mt-2 text-muted-foreground', typography.supporting)}>
          {detail}
        </p>
      )}
    </section>
  )
}
