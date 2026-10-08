import { isAddress, isHex, type Address, type Hex } from 'viem'

export type MigrationStepName = 'redeem' | 'approve' | 'deposit'

// Per-viewer progress so a holder can resume after a reload. Hashes are re-read from chain before any step
// advances; this never stands in for a receipt.
export type MigrationRecord = {
  redeem?: { hash: Hex; assets?: bigint }
  delegate?: Address
  approve?: { hash: Hex }
  deposit?: { hash: Hex }
  locked?: bigint
  pending?: { step: MigrationStepName; hash: Hex }
  completed?: boolean
  acknowledged?: boolean
}

export type MigrationTarget = {
  chainId: number
  oldVoteLock: Address
  account: Address
}

const PREFIX = 'register.vote-lock-migration.v1'

export const migrationRecordKey = ({ chainId, oldVoteLock, account }: MigrationTarget) =>
  `${PREFIX}:${chainId}:${oldVoteLock.toLowerCase()}:${account.toLowerCase()}`

const isTxHash = (value: unknown): value is Hex =>
  typeof value === 'string' && isHex(value) && value.length === 66
const hashEntry = (value: unknown) =>
  value && typeof value === 'object' && isTxHash((value as { hash?: unknown }).hash)
    ? { hash: (value as { hash: Hex }).hash }
    : undefined

const parse = (raw: unknown): MigrationRecord => {
  if (!raw || typeof raw !== 'object') return {}
  const value = raw as Record<string, any>
  const record: MigrationRecord = {}
  const redeem = hashEntry(value.redeem)
  if (redeem) {
    record.redeem =
      typeof value.redeem.assets === 'string' && /^\d+$/.test(value.redeem.assets)
        ? { ...redeem, assets: BigInt(value.redeem.assets) }
        : redeem
  }
  if (typeof value.delegate === 'string' && isAddress(value.delegate, { strict: false })) {
    record.delegate = value.delegate
  }
  const approve = hashEntry(value.approve)
  if (approve) record.approve = approve
  const deposit = hashEntry(value.deposit)
  if (deposit) record.deposit = deposit
  if (
    value.pending &&
    ['redeem', 'approve', 'deposit'].includes(value.pending.step) &&
    isTxHash(value.pending.hash)
  ) {
    record.pending = { step: value.pending.step, hash: value.pending.hash }
  }
  if (typeof value.locked === 'string' && /^\d+$/.test(value.locked)) {
    record.locked = BigInt(value.locked)
  }
  if (value.completed === true) record.completed = true
  if (value.acknowledged === true) record.acknowledged = true
  return record
}

export const readMigrationRecord = (target: MigrationTarget): MigrationRecord => {
  try {
    const raw = localStorage.getItem(migrationRecordKey(target))
    return raw ? parse(JSON.parse(raw)) : {}
  } catch {
    return {}
  }
}

export const writeMigrationRecord = (target: MigrationTarget, record: MigrationRecord) => {
  try {
    localStorage.setItem(
      migrationRecordKey(target),
      JSON.stringify(record, (_, value) =>
        typeof value === 'bigint' ? value.toString() : value
      )
    )
  } catch {
    // Storage can be unavailable (private mode); the flow still works within the session.
  }
}

export const clearMigrationRecord = (target: MigrationTarget) => {
  try {
    localStorage.removeItem(migrationRecordKey(target))
  } catch {
    // See writeMigrationRecord.
  }
}

// The vaults this account started migrating, so a surface can keep a position its source no longer lists.
export const listMigrationTargets = (
  account: Address
): { chainId: number; oldVoteLock: Address }[] => {
  const suffix = `:${account.toLowerCase()}`
  const targets: { chainId: number; oldVoteLock: Address }[] = []
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key?.startsWith(`${PREFIX}:`) || !key.endsWith(suffix)) continue
      const [chainId, oldVoteLock] = key.slice(PREFIX.length + 1, -suffix.length).split(':')
      if (Number.isInteger(Number(chainId)) && isAddress(oldVoteLock, { strict: false })) {
        targets.push({ chainId: Number(chainId), oldVoteLock: oldVoteLock as Address })
      }
    }
  } catch {
    return []
  }
  return targets
}
