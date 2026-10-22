import { isAddress, isHex, type Address, type Hex } from 'viem'

export type MigrationStepName = 'redeem' | 'approve' | 'deposit'

// Per-viewer resume state; a step only advances on a receipt read from chain, never on this record alone.
export type MigrationRecord = {
  redeem?: { hash: Hex; assets?: bigint }
  delegate?: Address
  approve?: { hash: Hex }
  deposit?: { hash: Hex }
  locked?: bigint
  // Safe steps confirm from on-chain effects: the wallet returns a Safe tx hash, never a mined one.
  pending?: { step: MigrationStepName; hash: Hex; viaSafe?: boolean; baseline?: bigint }
  completed?: boolean
  viaSafe?: boolean
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
const isStep = (value: unknown): value is MigrationStepName =>
  value === 'redeem' || value === 'approve' || value === 'deposit'
const isUint = (value: unknown): value is string =>
  typeof value === 'string' && /^\d+$/.test(value)
const asObject = (value: unknown) =>
  value && typeof value === 'object' ? (value as Record<string, unknown>) : undefined
const hashEntry = (value: unknown) => {
  const hash = asObject(value)?.hash
  return isTxHash(hash) ? { hash } : undefined
}

const parse = (raw: unknown): MigrationRecord => {
  const value = asObject(raw)
  if (!value) return {}
  const record: MigrationRecord = {}
  const redeem = hashEntry(value.redeem)
  if (redeem) {
    const assets = asObject(value.redeem)?.assets
    record.redeem = isUint(assets) ? { ...redeem, assets: BigInt(assets) } : redeem
  }
  if (typeof value.delegate === 'string' && isAddress(value.delegate, { strict: false })) {
    record.delegate = value.delegate
  }
  const approve = hashEntry(value.approve)
  if (approve) record.approve = approve
  const deposit = hashEntry(value.deposit)
  if (deposit) record.deposit = deposit
  const pending = asObject(value.pending)
  if (pending && isStep(pending.step) && isTxHash(pending.hash)) {
    record.pending = {
      step: pending.step,
      hash: pending.hash,
      ...(pending.viaSafe === true ? { viaSafe: true } : {}),
      ...(isUint(pending.baseline) ? { baseline: BigInt(pending.baseline) } : {}),
    }
  }
  if (isUint(value.locked)) record.locked = BigInt(value.locked)
  if (value.completed === true) record.completed = true
  if (value.viaSafe === true) record.viaSafe = true
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
