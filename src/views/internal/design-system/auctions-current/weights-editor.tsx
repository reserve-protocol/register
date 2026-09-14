import { useId, type Dispatch } from 'react'
import { Trans } from '@lingui/react/macro'
import { ChevronDown, Pencil } from 'lucide-react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/button'
import {
  Field,
  FieldLabel,
  TextInput,
} from '@/components/design-system-v1/field'
import {
  Collapsible,
  CollapsibleContent,
} from '@/components/design-system-v1/collapsible'
import { CollapsibleTrigger } from '@/components/ui/collapsible'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { cn } from '@/lib/utils'
import { INITIAL_UNITS, type SourceRecord } from './fixtures'
import {
  validDecimal,
  validDraft,
  type WorkspaceState,
  type WorkspaceEvent,
} from './model'
import { WeightUnitRows } from './weight-unit-rows'
import { WeightsCsv } from './weights-csv'
import { WeightError, WeightsDraftMessage } from './weights-messages'

const weightSchema = z.object({
  units: z
    .array(z.string().refine(validDecimal))
    .refine((values) => values.some((value) => /[1-9]/.test(value))),
  limits: z.array(
    z.string().refine((value) => value === '' || validDecimal(value))
  ),
})

export function WeightsEditor({
  record,
  state,
  dispatch,
  enabled,
  onDone,
}: {
  record: SourceRecord
  state: WorkspaceState
  dispatch: Dispatch<WorkspaceEvent>
  enabled: boolean
  onDone: () => void
}) {
  const id = useId()
  const form = useForm({
    resolver: zodResolver(weightSchema),
    mode: 'onChange',
    values: { units: state.draft, limits: state.draftLimits },
  })
  return (
    <FormProvider {...form}>
      <form
        data-testid="current-weight-editor"
        className="min-w-0 space-y-6"
        onSubmit={form.handleSubmit(() => {
          if (enabled && validDraft(state)) {
            dispatch({ type: 'save' })
            onDone()
          }
        })}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-xl space-y-2">
            <h4 className={type.itemTitle}>
              <Trans>Confirm target weights</Trans>
            </h4>
            <p className={cn(type.supporting, 'text-muted-foreground')}>
              <Trans>
                Current units show the holdings per DTF token, not the original
                proposal. New units start from the rebalance’s on-chain target.
              </Trans>
            </p>
          </div>
          <WeightsCsv
            record={record}
            state={state}
            dispatch={dispatch}
            enabled={enabled}
          />
        </div>
        <p className={cn(type.supporting, 'text-muted-foreground')}>
          Lab: weights and limits stay in this tab only. Reloading discards
          them. Prices and allocations below are illustrative, not transaction
          inputs.
        </p>
        <WeightUnitRows
          id={id}
          record={record}
          state={state}
          dispatch={dispatch}
          enabled={enabled}
          control={form.control}
        />
        <Collapsible className="space-y-4">
          <div className="space-y-2" data-testid="current-limits-disclosure">
            <CollapsibleTrigger asChild>
              <Button
                tone="secondary"
                className="group max-w-full whitespace-normal text-left"
                data-testid="current-limits-toggle"
                aria-describedby={`${id}-limits-description`}
                leadingIcon={<Pencil aria-hidden className="shrink-0" />}
                trailingIcon={
                  <ChevronDown
                    aria-hidden
                    className="shrink-0 transition-transform duration-120 group-data-[state=open]:rotate-180 motion-reduce:transition-none"
                  />
                }
              >
                <Trans>Max Auction Size per Token</Trans>
              </Button>
            </CollapsibleTrigger>
            <p
              id={`${id}-limits-description`}
              className={cn(type.supporting, 'text-muted-foreground')}
            >
              <Trans>
                Set the maximum auction size in USD for each token. Default:{' '}
                {'$1,000,000'}
              </Trans>
            </p>
          </div>
          <CollapsibleContent className="mt-0 px-0 pb-0">
            <div className="grid gap-4 py-2 [@container(min-width:52rem)]:grid-cols-2">
              {record.tokens.map((token, index) => (
                <Field key={token.address}>
                  <FieldLabel htmlFor={`${id}-limit-${index}`}>
                    {token.symbol}
                  </FieldLabel>
                  <Controller
                    control={form.control}
                    name={`limits.${index}`}
                    render={({ field }) => (
                      <TextInput
                        {...field}
                        id={`${id}-limit-${index}`}
                        data-testid={`current-limit-${index}`}
                        leading={<span className={type.body}>$</span>}
                        inputMode="decimal"
                        inputClassName="h-11"
                        placeholder="1,000,000"
                        disabled={!enabled}
                        value={state.draftLimits[index]}
                        invalid={
                          state.draftLimits[index] !== '' &&
                          !validDecimal(state.draftLimits[index])
                        }
                        aria-describedby={
                          state.draftLimits[index] !== '' &&
                          !validDecimal(state.draftLimits[index])
                            ? `${id}-limit-error-${index}`
                            : undefined
                        }
                        onChange={(event) => {
                          field.onChange(event)
                          dispatch({
                            type: 'limit',
                            index,
                            value: event.target.value,
                          })
                        }}
                      />
                    )}
                  />
                  <WeightError
                    id={id}
                    index={index}
                    value={state.draftLimits[index]}
                    limit
                  />
                </Field>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
        <WeightsDraftMessage draft={state.draft} enabled={enabled} />
        <div
          data-testid="current-weights-save-boundary"
          className="flex flex-wrap items-center justify-between gap-4"
        >
          <p className={cn(type.supporting, 'max-w-xl text-muted-foreground')}>
            <Trans>
              Saving prepares the target for launch. It does not change holdings
              or submit a transaction.
            </Trans>
          </p>
          <div className="ml-auto flex flex-wrap justify-end gap-2">
            <Button
              tone="secondary"
              type="button"
              data-testid="current-weights-discard"
              onClick={() => {
                dispatch({ type: 'discard' })
                onDone()
              }}
            >
              Back
            </Button>
            <Button
              type="submit"
              data-testid="current-weights-save"
              disabled={!enabled || !validDraft(state)}
            >
              Save Weights{' '}
              {
                state.draft.filter(
                  (value, index) => value !== INITIAL_UNITS[index]
                ).length
              }
              /{record.tokens.length} edited
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  )
}
