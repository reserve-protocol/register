import { FieldMessage } from '@/components/design-system-v1/field'
import { validDecimal } from './model'

export function WeightError({
  id,
  index,
  value,
  limit = false,
}: {
  id: string
  index: number
  value: string
  limit?: boolean
}) {
  if (validDecimal(value) || (limit && value === '')) return null
  const suffix = `${limit ? 'limit' : 'units'}-error-${index}`
  return (
    <FieldMessage
      id={`${id}-${suffix}`}
      data-testid={`current-${suffix}`}
      role="status"
    >
      {limit
        ? 'enter a non-negative number with up to 18 decimal places, or leave this limit empty.'
        : 'enter a non-negative number with up to 18 decimal places.'}
    </FieldMessage>
  )
}

export function WeightsDraftMessage({
  draft,
  enabled,
}: {
  draft: string[]
  enabled: boolean
}) {
  return (
    <>
      {draft.every(validDecimal) &&
        !draft.some((value) => /[1-9]/.test(value)) && (
          <FieldMessage role="status">
            at least one token must have units greater than zero.
          </FieldMessage>
        )}
      {!enabled && (
        <FieldMessage role="status">
          reconnect the launcher on the correct network with available data to
          save. Your draft is retained.
        </FieldMessage>
      )}
    </>
  )
}
