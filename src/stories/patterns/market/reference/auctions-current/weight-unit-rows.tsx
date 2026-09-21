import type { Dispatch } from 'react'
import { Controller, type Control } from 'react-hook-form'
import {
  Field,
  FieldLabel,
  FieldDescription,
  TextInput,
} from '@/components/design-system-v1/field'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { cn } from '@/lib/utils'
import { AssetName } from './assets'
import {
  CURRENT_BASKET_UNITS,
  INITIAL_UNITS,
  UNIT_PRICES,
  type SourceRecord,
} from './fixtures'
import { validDecimal, type WorkspaceState, type WorkspaceEvent } from './model'
import { allocations } from './weights-model'
import { WeightError } from './weights-messages'

export function WeightUnitRows({
  id,
  record,
  state,
  dispatch,
  enabled,
  control,
}: {
  id: string
  record: SourceRecord
  state: WorkspaceState
  dispatch: Dispatch<WorkspaceEvent>
  enabled: boolean
  control: Control<{ units: string[]; limits: string[] }>
}) {
  const shares = allocations(state.draft, UNIT_PRICES)
  const currentShares = allocations(CURRENT_BASKET_UNITS, UNIT_PRICES)
  return (
    <div className="space-y-5">
      {record.tokens.map((token, index) => (
        <Field
          key={token.address}
          className="grid gap-2 space-y-0 [@container(min-width:52rem)]:grid-cols-[minmax(0,1fr)_16rem_minmax(0,1fr)] [@container(min-width:52rem)]:items-center [@container(min-width:52rem)]:gap-x-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 [@container(min-width:52rem)]:flex-col [@container(min-width:52rem)]:items-start [@container(min-width:52rem)]:gap-1">
            <FieldLabel htmlFor={`${id}-units-${index}`}>
              <AssetName token={token} chainId={record.chainId} />
            </FieldLabel>
            <span
              id={`${id}-current-${index}`}
              data-testid={`current-basket-units-${index}`}
              className={cn(type.supporting, 'text-muted-foreground')}
            >
              <>Current units</>: {CURRENT_BASKET_UNITS[index]}
            </span>
          </div>
          <div className="min-w-0 space-y-2">
            <Controller
              control={control}
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
                  aria-describedby={`${id}-current-${index} ${id}-target-reference-${index} ${id}-allocation-${index}${!validDecimal(state.draft[index]) ? ` ${id}-units-error-${index}` : ''}`}
                  leading={
                    <span className={type.body}>
                      <>New units</>
                    </span>
                  }
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
            <FieldDescription
              id={`${id}-target-reference-${index}`}
              data-testid={`current-target-reference-${index}`}
            >
              <>Starting target</>: {INITIAL_UNITS[index]}
            </FieldDescription>
            <WeightError id={id} index={index} value={state.draft[index]} />
          </div>
          <FieldDescription
            id={`${id}-allocation-${index}`}
            className="flex flex-wrap gap-x-2 [@container(min-width:52rem)]:flex-col [@container(min-width:52rem)]:items-end [@container(min-width:52rem)]:gap-y-1"
          >
            <span>
              <>Current → target allocation</>
            </span>
            <span className="tabular-nums">
              {currentShares[index]} →{' '}
              <span className="text-foreground">{shares[index]}</span>
            </span>
          </FieldDescription>
        </Field>
      ))}
    </div>
  )
}
