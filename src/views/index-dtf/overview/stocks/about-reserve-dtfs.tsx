import { useTrackIndexDTFClick } from '@/views/index-dtf/hooks/useTrackIndexDTFPage'
import { Trans, useLingui } from '@lingui/react/macro'

// PLACEHOLDER copy — investor references describe backers of Reserve (the
// platform), not of any individual DTF. Needs legal/compliance sign-off on
// phrasing before this ships beyond local work.
const AboutReserveDtfs = () => {
  const { t } = useLingui()
  const { trackClick } = useTrackIndexDTFClick('overview', 'overview')

  return (
    <div data-testid="stocks-about-reserve" className="rounded-3xl bg-card p-4">
      <div className="mb-1 flex items-center gap-2 px-2 pt-2">
        <img
          src="/imgs/reserve-brand.png"
          alt={t`Reserve logo`}
          draggable={false}
          className="h-6 w-6 shrink-0"
        />
        <h3 className="font-medium">
          <Trans>About Reserve</Trans>
        </h3>
      </div>
      <div className="space-y-4 px-2 pb-2 text-sm leading-relaxed text-muted-foreground">
        <p>
          <Trans>
            Reserve has been operating since 2018 with backing from{' '}
            <span className="whitespace-nowrap">
              <strong className="font-semibold text-foreground">
                Coinbase
              </strong>
              ,{' '}
              <strong className="font-semibold text-foreground">
                Sam Altman
              </strong>{' '}
              and{' '}
              <strong className="font-semibold text-foreground">
                Peter Thiel
              </strong>
            </span>
            . We exist to help you own your share of the world’s wealth.
          </Trans>
        </p>
        <p>
          <a
            href="https://www.reserve.org"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              trackClick('about-reserve-learn-more', {
                url: 'https://www.reserve.org',
              })
            }}
            className="font-medium text-primary transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Trans>Learn more about the Reserve project</Trans>
          </a>
        </p>
      </div>
    </div>
  )
}

export default AboutReserveDtfs
