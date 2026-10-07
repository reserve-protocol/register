import { useAtom } from 'jotai'
import { atomWithStorage, createJSONStorage } from 'jotai/utils'
import { useCallback, useEffect, type SetStateAction } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import {
  migrationPreviewAddress,
  migrationPreviewLegacyVoteLock,
} from './preview-portfolio-data'

export type MigrationPreviewMode = 'affected' | 'disconnected' | 'unaffected'

type PreviewProgress = {
  step: number
  approvalRequired?: boolean
  rejected?: boolean
  pending?: { step: number; dueAt: number }
}

const MIGRATION_PREVIEW_PROGRESS_KEY = 'register.vote-lock-migration-preview.v2'

const migrationPreviewProgressAtom = atomWithStorage<
  Record<string, PreviewProgress>
>(
  MIGRATION_PREVIEW_PROGRESS_KEY,
  {},
  createJSONStorage(() => window.sessionStorage),
  { getOnInit: true }
)

const migrationPreviewModeAtom = atomWithStorage<boolean>(
  'register.vote-lock-migration-preview-mode.v1',
  false,
  createJSONStorage(() => window.sessionStorage),
  { getOnInit: true }
)

const validStep = (value: unknown) =>
  typeof value === 'number' &&
  Number.isInteger(value) &&
  value >= 0 &&
  value <= 3
    ? value
    : 0

export function migrationPreviewTargetKey(chainId: number, vault: string) {
  return `${chainId}:${vault.toLowerCase()}:${migrationPreviewAddress.toLowerCase()}`
}

export function migrationPreviewTargetKeyForRoute(
  chain: string | undefined,
  tokenId: string | undefined
) {
  const chainId = chain === 'bsc' ? 56 : chain === 'mainnet' ? 1 : 8453
  const vault =
    chainId === migrationPreviewLegacyVoteLock.chainId &&
    tokenId?.toLowerCase() ===
      migrationPreviewLegacyVoteLock.dtfs[0].address.toLowerCase()
      ? migrationPreviewLegacyVoteLock.stTokenAddress
      : (tokenId ?? 'current')
  return migrationPreviewTargetKey(chainId, vault)
}

const validProgress = (
  value: PreviewProgress | undefined
): PreviewProgress => ({
  step: validStep(value?.step),
  approvalRequired:
    typeof value?.approvalRequired === 'boolean'
      ? value.approvalRequired
      : undefined,
  rejected: value?.rejected === true,
  pending:
    value?.pending &&
    validStep(value.pending.step) === value.pending.step &&
    value.pending.step < 3 &&
    Number.isFinite(value.pending.dueAt)
      ? value.pending
      : undefined,
})

export function readStoredMigrationPreviewApproval(targetKey: string) {
  if (typeof window === 'undefined') return undefined
  try {
    const stored = window.sessionStorage.getItem(MIGRATION_PREVIEW_PROGRESS_KEY)
    if (!stored) return undefined
    const progress = JSON.parse(stored) as Record<string, PreviewProgress>
    return validProgress(progress?.[targetKey]).approvalRequired
  } catch {
    return undefined
  }
}

export function useMigrationPreviewProgress(targetKey: string) {
  const [progress, setProgress] = useAtom(migrationPreviewProgressAtom)
  const currentProgress = validProgress(progress[targetKey])
  const updateProgress = useCallback(
    (update: (current: PreviewProgress) => PreviewProgress) => {
      setProgress((current) => ({
        ...current,
        [targetKey]: update(validProgress(current[targetKey])),
      }))
    },
    [setProgress, targetKey]
  )
  const setStep = useCallback(
    (value: SetStateAction<number>) => {
      updateProgress((current) => {
        const nextStep =
          typeof value === 'function' ? value(current.step) : value
        return {
          ...current,
          step: Math.max(current.step, validStep(nextStep)),
        }
      })
    },
    [updateProgress]
  )

  return { ...currentProgress, setStep, updateProgress }
}

export function useMigrationPreviewStep(targetKey: string) {
  const { step, setStep } = useMigrationPreviewProgress(targetKey)
  return [step, setStep] as const
}

export function useMigrationPreviewMode(): MigrationPreviewMode | null {
  const [searchParams] = useSearchParams()
  const { pathname } = useLocation()
  const [affectedSession, setAffectedSession] = useAtom(
    migrationPreviewModeAtom
  )
  const mode = searchParams.get('voteLockMigration')
  const previewDtfPath = `/base/index-dtf/${migrationPreviewLegacyVoteLock.dtfs[0].address.toLowerCase()}`
  const isPersistedPreviewRoute =
    pathname.toLowerCase() === '/portfolio' ||
    pathname.toLowerCase() === previewDtfPath ||
    pathname.toLowerCase().startsWith(`${previewDtfPath}/`)

  useEffect(() => {
    if (
      import.meta.env.DEV &&
      mode === 'affected' &&
      isPersistedPreviewRoute &&
      !affectedSession
    ) {
      setAffectedSession(true)
    }
  }, [affectedSession, isPersistedPreviewRoute, mode, setAffectedSession])

  if (!import.meta.env.DEV) return null

  if (mode === 'affected' || mode === 'disconnected' || mode === 'unaffected') {
    return mode
  }

  return affectedSession && isPersistedPreviewRoute ? 'affected' : null
}
