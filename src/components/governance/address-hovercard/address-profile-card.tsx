import Copy from '@/components/ui/copy'
import { Skeleton } from '@/components/ui/skeleton'
import BlockiesAvatar from '@/components/utils/blockies-avatar'
import { useEnsName } from '@/hooks/use-ens-name'
import useRToken from '@/hooks/useRToken'
import { cn } from '@/lib/utils'
import { indexDTFAtom } from '@/state/dtf/atoms'
import {
  rTokenGovernanceAtom,
  rTokenManagersAtom,
  rTokenStateAtom,
} from '@/state/rtoken/atoms/rTokenStateAtom'
import { formatCurrency, formatPercentage, shortenAddress } from '@/utils'
import { ROUTES } from '@/utils/constants'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { Trans, useLingui } from '@lingui/react/macro'
import {
  useIndexDtfVoterState,
  useYieldDtfVoterState,
} from '@reserve-protocol/react-sdk'
import dayjs from 'dayjs'
import { useAtomValue } from 'jotai'
import {
  ArrowUpRight,
  CalendarDays,
  Clock,
  FileText,
  Globe,
  Landmark,
  Lock,
  Shield,
  Users,
  Vault,
  Vote,
  Wallet,
  Zap,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { Address } from 'viem'
import {
  buildAddressProfile,
  getIndexAddressRoles,
  getYieldAddressRoles,
  type AddressRole,
  type DtfType,
  type VoterSource,
} from './address-profile'
import { useGovernanceAccount } from './use-governance-account'
import { useIsSafeMultisig } from './use-is-safe-multisig'

type YieldVoterParams = NonNullable<Parameters<typeof useYieldDtfVoterState>[0]>

const formatDate = (timestamp: number | null) =>
  timestamp ? dayjs.unix(timestamp).format('MMM D, YYYY') : null

const Chip = ({ icon, children }: { icon?: ReactNode; children: ReactNode }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-2.5 py-1 text-xs font-medium">
    {icon}
    {children}
  </span>
)

const Stat = ({
  icon,
  label,
  value,
  sub,
  loading,
}: {
  icon: ReactNode
  label: ReactNode
  value: ReactNode
  sub?: ReactNode
  loading?: boolean
}) => (
  <div className="flex min-w-0 flex-col items-start gap-1.5">
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-foreground">
      {icon}
    </span>
    <span className="text-xs text-legend">{label}</span>
    {loading ? (
      <Skeleton className="h-5 w-12" />
    ) : (
      <span className="text-xl font-medium leading-none tabular-nums">{value}</span>
    )}
    {/* WHY: captions take up to two lines; the space is always there, so the card keeps its height when the data lands. */}
    <span className="min-h-8 text-xs text-legend">{!loading && sub}</span>
  </div>
)

const RowSkeleton = () => (
  <div className="flex h-5 items-center gap-2.5">
    <Skeleton className="h-3.5 w-3.5 rounded-full" />
    <Skeleton className="h-3.5 w-24" />
    <Skeleton className="ml-auto h-3.5 w-28" />
  </div>
)

const Row = ({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: ReactNode
  value: ReactNode
}) => (
  <div className="flex items-center gap-2.5 text-sm">
    <span className="text-legend">{icon}</span>
    <span className="text-legend">{label}</span>
    <span className="ml-auto font-medium tabular-nums">{value}</span>
  </div>
)

const useRoleLabels = () => {
  const { t } = useLingui()
  return {
    admin: t`Admin of this DTF`,
    guardian: t`Guardian of this DTF`,
    'optimistic-proposer': t`Optimistic proposer`,
    'auction-launcher': t`Auction launcher`,
    'brand-manager': t`Brand manager`,
    'fee-recipient': t`Fee recipient`,
    pauser: t`Pauser`,
    freezer: t`Freezer`,
    'long-freezer': t`Long freezer`,
  } satisfies Record<AddressRole, string>
}

type AddressProfileViewProps = {
  address: Address
  chainId: number
  dtfAddress: string
  dtfType: DtfType
  roles: AddressRole[]
  voter: VoterSource | undefined
  voterLoading: boolean
  // Set when the vote token cannot be resolved, so the stat does not sit on a skeleton forever.
  hideVotingPower?: boolean
  fresh?: boolean
  className?: string
}

export const AddressProfileView = ({
  address,
  chainId,
  dtfAddress,
  dtfType,
  roles,
  voter,
  voterLoading,
  hideVotingPower,
  fresh,
  className,
}: AddressProfileViewProps) => {
  const { t } = useLingui()
  const roleLabels = useRoleLabels()
  const name = useEnsName(address)
  const hasEns = name !== shortenAddress(address)
  const { data: account, isLoading, isError } = useGovernanceAccount(
    address,
    true,
    fresh
  )
  const isSafe = useIsSafeMultisig(chainId, address, true)
  const profile = buildAddressProfile({
    roles,
    dtfType,
    chainId,
    dtfAddress,
    account,
    voter,
  })
  const outcomes = [
    profile.thisDtf.executed > 0 && (
      <Trans key="executed">{profile.thisDtf.executed} executed</Trans>
    ),
    profile.thisDtf.defeated > 0 && (
      <Trans key="defeated">{profile.thisDtf.defeated} defeated</Trans>
    ),
    profile.thisDtf.vetoed > 0 && (
      <Trans key="vetoed">{profile.thisDtf.vetoed} vetoed</Trans>
    ),
  ].filter(Boolean)
  const isPartial = !!account && (account.truncated || account.degradedChains.length > 0)

  return (
    <div
      className={cn('flex w-[340px] max-w-full flex-col overflow-hidden', className)}
      data-testid="address-profile-card"
    >
      <div className="flex flex-col gap-3 bg-secondary p-4">
        <div className="flex items-center gap-3">
          <BlockiesAvatar
            address={address}
            size={44}
            className="rounded-full ring-2 ring-card"
          />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-base font-medium">{name}</span>
            <div className="flex items-center gap-1.5 text-sm text-legend">
              {hasEns && <span>{shortenAddress(address)}</span>}
              <Copy value={address} size={13} />
              <a
                href={getExplorerLink(address, chainId, ExplorerDataType.ADDRESS)}
                target="_blank"
                rel="noreferrer"
                className="text-legend hover:text-foreground"
                aria-label={t`View on block explorer`}
              >
                <ArrowUpRight size={14} />
              </a>
            </div>
          </div>
        </div>
        {(profile.roles.length > 0 || isSafe) && (
          <div className="flex flex-wrap gap-1.5">
            {profile.roles.map((role) => (
              <Chip key={role} icon={<Shield size={13} strokeWidth={1.75} />}>
                {roleLabels[role]}
              </Chip>
            ))}
            {isSafe && (
              <Chip icon={<Vault size={13} strokeWidth={1.75} />}>
                <Trans>Safe multisig</Trans>
              </Chip>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 bg-card p-4">
        <div
          className={cn(
            'grid gap-3',
            hideVotingPower ? 'grid-cols-2' : 'grid-cols-3'
          )}
        >
          {!hideVotingPower && (
            <Stat
              icon={<Zap size={15} strokeWidth={1.75} />}
              label={<Trans>Voting power</Trans>}
              value={profile.votingWeight === null ? '—' : formatPercentage(profile.votingWeight)}
              loading={voterLoading}
              sub={
                profile.delegatedPower ? (
                  <Trans>
                    {formatCurrency(profile.delegatedPower, 2, { notation: 'compact' })}{' '}
                    delegated
                  </Trans>
                ) : null
              }
            />
          )}
          <Stat
            icon={<FileText size={15} strokeWidth={1.75} />}
            label={<Trans>Proposals</Trans>}
            value={profile.thisDtf.proposals}
            loading={isLoading}
            sub={
              outcomes.length > 0 ? (
                <span className="flex flex-col">{outcomes.map((item, i) => <span key={i}>{item}</span>)}</span>
              ) : profile.thisDtf.proposals === 1 && profile.allReserve.proposals === 1 ? (
                <Trans>First proposal</Trans>
              ) : null
            }
          />
          <Stat
            icon={<Vote size={15} strokeWidth={1.75} />}
            label={<Trans>Votes cast</Trans>}
            value={profile.thisDtf.votes}
            loading={isLoading}
          />
        </div>

        <div className="flex flex-col gap-2.5 border-t border-border pt-4">
          {isLoading && (
            // WHY: five rows is the full profile of a proposer or delegate, the addresses this card is opened on.
            Array.from({ length: 5 }, (_, index) => <RowSkeleton key={index} />)
          )}
          {isError && (
            <span className="text-sm text-legend">
              <Trans>Governance history is unavailable right now.</Trans>
            </span>
          )}
          {!!profile.delegators && (
            <Row
              icon={<Users size={14} />}
              label={<Trans>Delegators</Trans>}
              value={profile.delegators}
            />
          )}
          {profile.votingPowerSince && (
            <Row
              icon={<Lock size={14} />}
              label={<Trans>Voting power since</Trans>}
              value={formatDate(profile.votingPowerSince)}
            />
          )}
          {account && (
            <Row
              icon={<Globe size={14} />}
              label={<Trans>Across Reserve</Trans>}
              value={
                <Trans>
                  {account.totals.proposals} proposals · {account.totals.votes} votes
                </Trans>
              }
            />
          )}
          {profile.firstActionAt && (
            <Row
              icon={<CalendarDays size={14} />}
              label={<Trans>First action</Trans>}
              value={formatDate(profile.firstActionAt)}
            />
          )}
          {profile.lastActionAt && (
            <Row
              icon={<Clock size={14} />}
              label={<Trans>Last action</Trans>}
              value={formatDate(profile.lastActionAt)}
            />
          )}
          {isPartial && (
            <span className="text-xs text-legend">
              <Trans>Some history may be missing.</Trans>
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Link
            to={`${ROUTES.EXPLORER_GOVERNANCE}?proposer=${address}&period=all`}
            className="flex h-10 items-center justify-center gap-1.5 rounded-full border border-border text-sm font-medium text-foreground hover:bg-secondary"
          >
            <Landmark size={14} strokeWidth={1.75} />
            <Trans>Proposals</Trans>
          </Link>
          <Link
            to={`${ROUTES.PORTFOLIO}?account=${address}`}
            className="flex h-10 items-center justify-center gap-1.5 rounded-full border border-border text-sm font-medium text-foreground hover:bg-secondary"
          >
            <Wallet size={14} strokeWidth={1.75} />
            <Trans>Portfolio</Trans>
          </Link>
        </div>
      </div>
    </div>
  )
}

export const IndexAddressProfile = ({
  address,
  fresh,
  className,
}: {
  address: Address
  fresh?: boolean
  className?: string
}) => {
  const dtf = useAtomValue(indexDTFAtom)
  const chainId = dtf?.chainId ?? 1
  const { data: voter } = useIndexDtfVoterState(
    dtf?.stToken?.id
      ? { chainId, stToken: dtf.stToken.id, account: address }
      : undefined
  )

  return (
    <AddressProfileView
      address={address}
      chainId={chainId}
      dtfAddress={dtf?.id ?? ''}
      dtfType="index"
      roles={getIndexAddressRoles(
        dtf as Parameters<typeof getIndexAddressRoles>[0],
        address
      )}
      voter={
        voter && {
          ownPower: Number(voter.balance.formatted),
          votingPower: Number(voter.votingPower.formatted),
          votingWeight: voter.votingWeight,
          isSelfDelegated: voter.isSelfDelegated,
        }
      }
      voterLoading={!voter && !!dtf?.stToken}
      fresh={fresh}
      className={className}
    />
  )
}

export const YieldAddressProfile = ({
  address,
  fresh,
  className,
}: {
  address: Address
  fresh?: boolean
  className?: string
}) => {
  const rToken = useRToken()
  const managers = useAtomValue(rTokenManagersAtom)
  const governance = useAtomValue(rTokenGovernanceAtom)
  const { stTokenSupply } = useAtomValue(rTokenStateAtom)
  const chainId = rToken?.chainId ?? 1
  const stToken = rToken?.stToken?.address
  const { data: voter } = useYieldDtfVoterState(
    stToken
      ? ({
          chainId,
          stToken: stToken as Address,
          account: address,
        } as YieldVoterParams)
      : undefined
  )
  const votingPower = voter ? Number(voter.votingPower.formatted) : 0

  return (
    <AddressProfileView
      address={address}
      chainId={chainId}
      dtfAddress={rToken?.address ?? ''}
      dtfType="yield"
      roles={getYieldAddressRoles(
        {
          ...managers,
          guardians: governance.guardians,
          governor: governance.governor,
          timelock: governance.timelock,
        },
        address
      )}
      voter={
        voter && {
          ownPower: Number(voter.stTokenBalance.formatted),
          votingPower,
          votingWeight: stTokenSupply ? (votingPower / stTokenSupply) * 100 : 0,
          isSelfDelegated: voter.isSelfDelegated,
        }
      }
      voterLoading={!voter && !!stToken}
      fresh={fresh}
      className={className}
    />
  )
}
