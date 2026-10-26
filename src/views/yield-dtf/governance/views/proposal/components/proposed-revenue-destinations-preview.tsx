import { Trans, useLingui } from '@lingui/react/macro'
import { Button } from '@/components/ui/button'
import { useAtomValue, useSetAtom } from 'jotai'
import { formatUnits } from 'viem'
import {
  revenueRouterChangesAtom,
  revenueRouterDraftAtom,
} from '../revenue-router-atoms'
import PreviewBox from './PreviewBox'

export default function ProposedRevenueDestinationsPreview({
  className,
}: {
  className?: string
}) {
  const { t } = useLingui()
  const { removed, added } = useAtomValue(revenueRouterChangesAtom)
  const setDraft = useSetAtom(revenueRouterDraftAtom)
  if (!removed.length && !added.length) return null
  return (
    <PreviewBox
      title={t`eUSD revenue router destinations`}
      count={removed.length + added.length}
      className={`border border-border rounded-xl p-6 ${className ?? ''}`}
      testId="yield-revenue-destinations-preview"
    >
      {[
        { label: t`Remove`, destinations: removed },
        { label: t`Add`, destinations: added },
      ].map(({ label, destinations }) =>
        destinations.map((d) => (
          <div key={`${label}-${d.holder}`} className="text-sm mt-4 break-all">
            <span className="font-semibold">{label}</span>
            <p>
              <Trans>Holder</Trans>: {d.holder}
            </p>
            <p>
              <Trans>Recipient</Trans>: {d.recipient}
            </p>
            <p>
              <Trans>Multiplier</Trans>: {formatUnits(d.multiplier, 18)}×
            </p>
          </div>
        ))
      )}
      <Button
        variant="ghost"
        size="sm"
        className="mt-4"
        onClick={() => setDraft(null)}
      >
        <Trans>Discard destination changes</Trans>
      </Button>
    </PreviewBox>
  )
}
