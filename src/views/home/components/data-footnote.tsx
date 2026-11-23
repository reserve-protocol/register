import { Skeleton } from '@/components/ui/skeleton'
import { Trans, useLingui } from '@lingui/react/macro'
import { useUglycashMetrics } from '../hooks/use-uglycash-metrics'
import { Reveal } from './home-card'

const LastUpdated = () => {
  const { i18n } = useLingui()
  const { data, isError } = useUglycashMetrics()
  if (isError && !data) return null

  const updatedAt =
    data &&
    new Date(data.generatedAt).toLocaleString(i18n.locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  return (
    <div className="mt-1 h-5">
      <Reveal
        ready={!!data}
        skeleton={
          <div className="flex h-5 items-center">
            <Skeleton className="h-3.5 w-48" />
          </div>
        }
      >
        <p>
          <Trans>Last updated {updatedAt}</Trans>
        </p>
      </Reveal>
    </div>
  )
}

const DataFootnote = () => (
  <div className="mt-6 px-4 text-sm text-legend md:px-8">
    <p>
      <Trans>
        eUSD on UGLYCASH is held in custody by Best Friend Finance, so these
        transactions happen primarily offchain.
      </Trans>
    </p>
    <LastUpdated />
  </div>
)

export default DataFootnote
