import { Trans, useLingui } from '@lingui/react/macro'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useAtom, useAtomValue } from 'jotai'
import {
  revenueRouterCurrentAtom,
  revenueRouterDraftAtom,
  revenueRouterReadErrorAtom,
} from '../revenue-router-atoms'
import {
  DestinationInput,
  getDestinationErrors,
  MAX_REVENUE_DESTINATIONS,
  toDestinationInputs,
} from '../utils/revenue-router'

const FIELDS = ['holder', 'recipient', 'multiplier'] as const

export default function RevenueDestinationsProposal() {
  const { t } = useLingui()
  const current = useAtomValue(revenueRouterCurrentAtom)
  const readError = useAtomValue(revenueRouterReadErrorAtom)
  const [draft, setDraft] = useAtom(revenueRouterDraftAtom)
  const rows = draft?.proposed ?? toDestinationInputs(current ?? [])
  const rowErrors = getDestinationErrors(rows)
  const labels = {
    holder: t`Holder`,
    recipient: t`Recipient`,
    multiplier: t`Multiplier (×)`,
  }
  const errorMessages = {
    holder: t`Use a unique holder address, not zero, eUSD or the router.`,
    recipient: t`Use a valid address, not zero, eUSD or the router.`,
    multiplier: t`Use a positive number with up to 18 decimals, at most 79228162514.264337593543950335.`,
  }

  const update = (proposed: DestinationInput[]) => {
    const baseline = draft?.baseline ?? current
    if (baseline) setDraft({ baseline, proposed })
  }
  const updateRow = (
    index: number,
    field: keyof DestinationInput,
    value: string
  ) => update(rows.map((d, i) => (i === index ? { ...d, [field]: value } : d)))

  return (
    <Card
      className="p-6 bg-secondary min-w-0"
      data-testid="yield-revenue-destinations"
    >
      <span className="text-lg font-semibold">
        <Trans>eUSD revenue router destinations</Trans>
      </span>
      <Separator className="my-6 -mx-6 w-[calc(100%+3rem)]" />
      {readError && !draft ? (
        <p role="alert" className="text-sm text-destructive">
          <Trans>Unable to load current destinations.</Trans>
        </p>
      ) : !draft && current === undefined ? (
        <p role="status" className="text-sm text-legend">
          <Trans>Loading current destinations…</Trans>
        </p>
      ) : (
        <>
          <p className="text-sm text-legend mb-4">
            <Trans>
              Currently configured: {current?.length ?? 0} /{' '}
              {MAX_REVENUE_DESTINATIONS}
            </Trans>
          </p>
          {!rows.length && (
            <p className="text-sm mb-4">
              <Trans>
                No destinations. The router cannot forward revenue with an empty
                list.
              </Trans>
            </p>
          )}
          <div className="space-y-4">
            {rows.map((row, index) => (
              <div
                key={index}
                className="min-w-0 border border-border rounded-xl p-4 space-y-3"
                data-testid="yield-revenue-destination-row"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">
                    <Trans>Destination {index + 1}</Trans>
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={t`Remove destination ${index + 1}`}
                    onClick={() => update(rows.filter((_, i) => i !== index))}
                  >
                    <Trans>Remove</Trans>
                  </Button>
                </div>
                {FIELDS.map((field) => {
                  const showError = !!row[field] && rowErrors[index].has(field)
                  const errorId = `destination-${index}-${field}-error`
                  return (
                    <label key={field} className="block text-sm text-legend">
                      {labels[field]}
                      <Input
                        className="mt-1"
                        value={row[field]}
                        data-testid={`destination-${field}`}
                        placeholder={field === 'multiplier' ? '1' : '0x…'}
                        inputMode={
                          field === 'multiplier' ? 'decimal' : undefined
                        }
                        maxLength={field === 'multiplier' ? 32 : 42}
                        aria-invalid={showError}
                        aria-describedby={showError ? errorId : undefined}
                        onChange={(e) =>
                          updateRow(index, field, e.target.value)
                        }
                      />
                      {showError && (
                        <span
                          id={errorId}
                          className="block text-xs text-destructive mt-1"
                        >
                          {errorMessages[field]}
                        </span>
                      )}
                    </label>
                  )
                })}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-4">
            <Button
              size="sm"
              disabled={rows.length >= MAX_REVENUE_DESTINATIONS}
              data-testid="destination-add"
              onClick={() =>
                update([
                  ...rows,
                  { holder: '', recipient: '', multiplier: '1' },
                ])
              }
            >
              <Trans>Add destination</Trans>
            </Button>
            {draft && (
              <Button
                size="sm"
                variant="ghost"
                data-testid="destinations-discard"
                onClick={() => setDraft(null)}
              >
                <Trans>Discard changes</Trans>
              </Button>
            )}
          </div>
        </>
      )}
      <Separator className="my-6 -mx-6 w-[calc(100%+3rem)] bg-border-dark" />
      <p className="text-legend text-xs">
        <Trans>
          Each holder's eUSD balance × multiplier sets its recipient's share of
          the router's revenue. Multipliers are not percentages; 1 means 1×.
          Only add holders whose balances third parties cannot inflate. Changed
          or removed destinations are removed first, then new values are added,
          in one proposal.
        </Trans>
      </p>
    </Card>
  )
}
