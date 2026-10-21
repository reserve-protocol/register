import { useCallback, useSyncExternalStore } from 'react'
import {
  migrationRecordKey,
  readMigrationRecord,
  writeMigrationRecord,
  type MigrationRecord,
  type MigrationTarget,
} from './migration-record'

const EVENT = 'register:vote-lock-migration'
const snapshots = new Map<string, { raw: string | null; record: MigrationRecord }>()

const subscribe = (onChange: () => void) => {
  window.addEventListener(EVENT, onChange)
  window.addEventListener('storage', onChange)
  return () => {
    window.removeEventListener(EVENT, onChange)
    window.removeEventListener('storage', onChange)
  }
}

// useSyncExternalStore needs a stable snapshot per stored value.
const getSnapshot = (target: MigrationTarget) => {
  const key = migrationRecordKey(target)
  let raw: string | null = null
  try {
    raw = localStorage.getItem(key)
  } catch {
    raw = null
  }
  const cached = snapshots.get(key)
  if (cached && cached.raw === raw) return cached.record
  const record = readMigrationRecord(target)
  snapshots.set(key, { raw, record })
  return record
}

const EMPTY: MigrationRecord = {}

export const useMigrationRecord = (target: MigrationTarget | undefined) => {
  const record = useSyncExternalStore(
    subscribe,
    () => (target ? getSnapshot(target) : EMPTY),
    () => EMPTY
  )
  const update = useCallback(
    (change: (current: MigrationRecord) => MigrationRecord) => {
      if (!target) return
      writeMigrationRecord(target, change(readMigrationRecord(target)))
      window.dispatchEvent(new Event(EVENT))
    },
    // Targets are rebuilt each render; their identity is the storage key.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [target && migrationRecordKey(target)]
  )
  return [record, update] as const
}

let version = 0
const subscribeVersion = (onChange: () => void) =>
  subscribe(() => {
    version += 1
    onChange()
  })

// Re-renders whenever any migration record changes, for callers that read several records at once.
export const useMigrationRecordsVersion = () =>
  useSyncExternalStore(subscribeVersion, () => version, () => 0)
