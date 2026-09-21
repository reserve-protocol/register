import { useRef, useState, type Dispatch } from 'react'
import { Button } from '@/components/button'
import { FieldMessage } from '@/components/design-system-v1/field'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import type { SourceRecord } from './fixtures'
import type { WorkspaceState, WorkspaceEvent } from './model'
import { basketCsv, parseBasketCsv } from './weights-model'

export function WeightsCsv({
  record,
  state,
  dispatch,
  enabled,
}: {
  record: SourceRecord
  state: WorkspaceState
  dispatch: Dispatch<WorkspaceEvent>
  enabled: boolean
}) {
  const upload = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')
  const [imported, setImported] = useState(false)
  return (
    <div className="min-w-0 max-w-md space-y-3">
      {' '}
      <div className="flex flex-wrap gap-2">
        <Button
          tone="secondary"
          type="button"
          onClick={() => upload.current?.click()}
          disabled={!enabled}
        >
          Select a CSV file to upload
        </Button>
        <Button
          tone="quiet"
          type="button"
          onClick={() => {
            const url = URL.createObjectURL(
              new Blob([basketCsv(record.tokens, state.draft)], {
                type: 'text/csv',
              })
            )
            const anchor = document.createElement('a')
            anchor.href = url
            anchor.download = `${record.symbol}-weights.csv`
            anchor.click()
            window.setTimeout(() => URL.revokeObjectURL(url), 1000)
          }}
        >
          CSV Template
        </Button>
        <input
          ref={upload}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          data-testid="current-csv-input"
          onChange={async (event) => {
            const file = event.target.files?.[0]
            event.target.value = ''
            if (!file || !enabled) return
            setImported(false)
            try {
              if (file.size > 1024 * 1024)
                throw new Error('Please upload a CSV file less than 1MB.')
              const units = parseBasketCsv(await file.text(), record.tokens)
              dispatch({ type: 'import', units })
              setError('')
              setImported(true)
            } catch (error) {
              setError(
                error instanceof Error
                  ? error.message
                  : 'Failed to read CSV file'
              )
            }
          }}
        />
      </div>
      {error && <FieldMessage role="alert">{error}</FieldMessage>}
      {imported && (
        <p role="status" className={type.supporting}>
          all eight token values imported. Review before saving.
        </p>
      )}
    </div>
  )
}
