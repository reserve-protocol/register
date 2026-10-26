import { Trans, useLingui } from '@lingui/react/macro'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAtom, useAtomValue } from 'jotai'
import {
  revenueRouterChangesAtom,
  revenueRouterCurrentAtom,
  revenueRouterDraftAtom,
  revenueRouterReadErrorAtom,
} from '../revenue-router-atoms'
import {
  DestinationInput,
  MAX_REVENUE_DESTINATIONS,
  parseDestinations,
  toDestinationInputs,
} from '../utils/revenue-router'

export default function RevenueDestinationsProposal() {
  const { t } = useLingui()
  const current = useAtomValue(revenueRouterCurrentAtom)
  const readError = useAtomValue(revenueRouterReadErrorAtom)
  const [draft, setDraft] = useAtom(revenueRouterDraftAtom)
  const { stale } = useAtomValue(revenueRouterChangesAtom)
  const rows = draft?.proposed ?? toDestinationInputs(current ?? [])
  const invalid = !parseDestinations(rows)
  const update = (proposed: DestinationInput[]) => {
    if (current) setDraft({ baseline: draft?.baseline ?? current, proposed })
  }

  return (
    <Card
      className="p-6 bg-secondary min-w-0"
      data-testid="yield-revenue-destinations"
    >
      <h3 className="text-lg font-semibold">
        <Trans>eUSD revenue router destinations</Trans>
      </h3>
      <p className="text-sm text-legend my-4">
        <Trans>
          Each holder's eUSD balance × multiplier determines its recipient's
          relative revenue weight. Multipliers are not percentages; 1 means 1×.
          Only configure holders whose balances cannot be inflated by third
          parties.
        </Trans>
      </p>
      {readError ? (
        <p role="alert">
          <Trans>Unable to load current destinations. Retrying…</Trans>
        </p>
      ) : current === undefined ? (
        <p role="status">
          <Trans>Loading current destinations…</Trans>
        </p>
      ) : (
        <>
          <p className="text-sm text-legend mb-4">
            <Trans>
              Currently configured: {current.length} /{' '}
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
              <fieldset
                key={index}
                className="min-w-0 border border-border rounded-xl p-4 space-y-3"
                data-testid="yield-revenue-destination-row"
              >
                <legend className="px-1 text-sm">
                  <Trans>Destination {index + 1}</Trans>
                </legend>
                <label className="block text-sm">
                  <Trans>Holder</Trans>
                  <Input
                    className="mt-1"
                    value={row.holder}
                    data-testid="destination-holder"
                    maxLength={42}
                    onChange={(e) =>
                      update(
                        rows.map((d, i) =>
                          i === index ? { ...d, holder: e.target.value } : d
                        )
                      )
                    }
                  />
                </label>
                <label className="block text-sm">
                  <Trans>Recipient</Trans>
                  <Input
                    className="mt-1"
                    value={row.recipient}
                    data-testid="destination-recipient"
                    maxLength={42}
                    onChange={(e) =>
                      update(
                        rows.map((d, i) =>
                          i === index ? { ...d, recipient: e.target.value } : d
                        )
                      )
                    }
                  />
                </label>
                <label className="block text-sm">
                  <Trans>Multiplier (×)</Trans>
                  <Input
                    className="mt-1"
                    value={row.multiplier}
                    data-testid="destination-multiplier"
                    inputMode="decimal"
                    maxLength={32}
                    onChange={(e) =>
                      update(
                        rows.map((d, i) =>
                          i === index ? { ...d, multiplier: e.target.value } : d
                        )
                      )
                    }
                  />
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => update(rows.filter((_, i) => i !== index))}
                >
                  <Trans>Remove</Trans>
                </Button>
              </fieldset>
            ))}
          </div>
          <Button
            className="mt-4"
            size="sm"
            disabled={rows.length >= MAX_REVENUE_DESTINATIONS}
            data-testid="destination-add"
            onClick={() =>
              update([...rows, { holder: '', recipient: '', multiplier: '1' }])
            }
          >
            <Trans>Add destination</Trans>
          </Button>
        </>
      )}
      {invalid && (
        <p role="alert" className="text-sm text-destructive mt-4">
          <Trans>
            Use unique, valid holder addresses and valid recipients (not zero,
            eUSD, or the router). Multipliers must be positive, have at most 18
            decimals, and fit uint96 (maximum 79228162514.264337593543950335×).
          </Trans>
        </p>
      )}
      {stale && (
        <p role="alert" className="text-sm text-destructive mt-4">
          <Trans>
            Onchain destinations changed. Discard your edits and start from the
            refreshed list.
          </Trans>
        </p>
      )}
      {draft && (
        <Button
          variant="ghost"
          className="mt-4"
          data-testid="destinations-discard"
          onClick={() => setDraft(null)}
        >{t`Discard destination changes`}</Button>
      )}
      <p className="text-xs text-legend mt-4">
        <Trans>
          Edits generate removeDestinations followed by addDestinations in one
          atomic proposal. Recheck configuration before execution.
        </Trans>
      </p>
    </Card>
  )
}
