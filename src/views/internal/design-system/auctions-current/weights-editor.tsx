import { useId, type Dispatch } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/button'
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldMessage,
  TextInput,
} from '@/components/design-system-v1/field'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/design-system-v1/collapsible'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { cn } from '@/lib/utils'
import { AssetName } from './assets'
import { INITIAL_UNITS, UNIT_PRICES, type SourceRecord } from './fixtures'
import {
  validDecimal,
  validDraft,
  type WorkspaceState,
  type WorkspaceEvent,
} from './model'
import { allocations } from './weights-model'
import { WeightsCsv } from './weights-csv'

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
  const shares = allocations(state.draft, UNIT_PRICES)
  const currentShares = allocations(INITIAL_UNITS, UNIT_PRICES)
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
            <h4 className={type.itemTitle}>Manage weights before proceeding</h4>
            <p className={cn(type.supporting, 'text-muted-foreground')}>
              Lab: weights and limits stay in this tab only. Reloading discards
              them. Prices and allocations below are illustrative, not
              transaction inputs.
            </p>
          </div>
          <WeightsCsv
            record={record}
            state={state}
            dispatch={dispatch}
            enabled={enabled}
          />
        </div>
        <div className="grid gap-x-8 gap-y-6 [@container(min-width:52rem)]:grid-cols-2">
          {record.tokens.map((token, index) => (
            <Field key={token.address}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <FieldLabel htmlFor={`${id}-units-${index}`}>
                  <AssetName token={token} chainId={record.chainId} />
                </FieldLabel>
                <span className={cn(type.supporting, 'text-muted-foreground')}>
                  Current units: {INITIAL_UNITS[index]}
                </span>
              </div>
              <Controller
                control={form.control}
                name={`units.${index}`}
                render={({ field }) => (
                  <TextInput
                    {...field}
                    id={`${id}-units-${index}`}
                    data-testid={`current-units-${index}`}
                    inputMode="decimal"
                    inputClassName="h-11"
                    value={state.draft[index]}
                    disabled={!enabled}
                    invalid={!validDecimal(state.draft[index])}
                    aria-describedby={`${id}-allocation-${index}`}
                    leading={<span className={type.body}>New units</span>}
                    onChange={(event) => {
                      field.onChange(event)
                      dispatch({
                        type: 'units',
                        index,
                        value: event.target.value,
                      })
                    }}
                  />
                )}
              />
              <FieldDescription id={`${id}-allocation-${index}`}>
                % of Basket: {currentShares[index]} → {shares[index]}
              </FieldDescription>
            </Field>
          ))}
        </div>
        <Collapsible className="-mx-4">
          <CollapsibleTrigger>Max Auction Size per Token</CollapsibleTrigger>
          <CollapsibleContent>
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
                </Field>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
        {!enabled && (
          <FieldMessage role="status">
            Lab: reconnect the launcher on the correct network with available
            data to save. Your draft is retained.
          </FieldMessage>
        )}
        <div className="flex flex-wrap justify-end gap-2">
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
      </form>
    </FormProvider>
  )
}
