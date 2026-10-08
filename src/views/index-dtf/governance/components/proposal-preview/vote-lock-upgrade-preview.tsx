import { chainIdAtom } from '@/state/atoms'
import { shortenAddress } from '@/utils'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import {
  VOTE_LOCK_UPGRADE_TO,
  voteLockUpgradeAbi,
  type VoteLockUpgradeCall,
} from '@/views/index-dtf/governance/views/propose/upgrade-banners/vote-lock-upgrade'
import { Trans, useLingui } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import { ArrowUpRight, BadgeCheck, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { keccak256, toHex, type Address } from 'viem'
import { useReadContract } from 'wagmi'
import { dtfContractAliasAtom } from './atoms'

export type VoteLockUpgradeRow = VoteLockUpgradeCall & { target: Address }

// Voters see whether each upgrade lands on an implementation the version registry lists for 1.1.0.
const useRegisteredImplementations = (rows: VoteLockUpgradeRow[]) => {
  const chainId = useAtomValue(chainIdAtom)
  const vault = rows.find((r) => r.initializer === 'initializeAverageVotes')
  const fromCall = rows.find((r) => r.registry)?.registry
  const { data: vaultRegistry } = useReadContract({
    address: vault?.target,
    abi: voteLockUpgradeAbi,
    functionName: 'versionRegistry',
    chainId,
    query: { enabled: !fromCall && !!vault },
  })
  const registry = fromCall ?? vaultRegistry
  const { data } = useReadContract({
    address: registry,
    abi: voteLockUpgradeAbi,
    functionName: 'getImplementationsForVersion',
    args: [keccak256(toHex(VOTE_LOCK_UPGRADE_TO))],
    chainId,
    query: { enabled: !!registry },
  })

  return data?.map((address) => address.toLowerCase())
}

const VoteLockUpgradePreview = ({ rows }: { rows: VoteLockUpgradeRow[] }) => {
  const { t } = useLingui()
  const chainId = useAtomValue(chainIdAtom)
  const aliases = useAtomValue(dtfContractAliasAtom)
  const registered = useRegisteredImplementations(rows)

  const initializerLabel = (row: VoteLockUpgradeRow) => {
    if (row.initializer === 'initializeAverageVotes')
      return t`Turns on average-vote accounting`
    if (row.initializer === 'initializeVersionRegistry' && row.registry)
      return t`Links the version registry ${shortenAddress(row.registry)}`
    return row.initializer || t`No initializer`
  }

  return (
    <div
      className="flex flex-col gap-3 rounded-3xl bg-background m-1 p-4"
      data-testid="proposal-vote-lock-upgrade"
    >
      <h1 className="text-xl font-semibold text-primary">
        <Trans>Vote-lock upgrade to {VOTE_LOCK_UPGRADE_TO}</Trans>
      </h1>
      {rows.map((row) => {
        const isRegistered = registered?.includes(row.implementation.toLowerCase())
        return (
          <div
            key={`${row.target}-${row.implementation}`}
            className="rounded-2xl border bg-muted/70 p-3 text-sm flex flex-col gap-1"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium">
                {aliases?.[row.target.toLowerCase()] ?? shortenAddress(row.target)}
              </span>
              <Link
                to={getExplorerLink(row.implementation, chainId, ExplorerDataType.ADDRESS)}
                target="_blank"
                className="flex items-center gap-1 text-primary"
              >
                {shortenAddress(row.implementation)}
                <ArrowUpRight size={14} />
              </Link>
            </div>
            <span className="text-legend">{initializerLabel(row)}</span>
            {registered &&
              (isRegistered ? (
                <span className="flex items-center gap-1 text-primary">
                  <BadgeCheck size={14} />
                  <Trans>Registered {VOTE_LOCK_UPGRADE_TO} implementation</Trans>
                </span>
              ) : (
                <span
                  className="flex items-center gap-1 text-destructive"
                  data-testid="proposal-vote-lock-upgrade-unregistered"
                >
                  <TriangleAlert size={14} />
                  <Trans>Not a registered {VOTE_LOCK_UPGRADE_TO} implementation</Trans>
                </span>
              ))}
          </div>
        )
      })}
    </div>
  )
}

export default VoteLockUpgradePreview
