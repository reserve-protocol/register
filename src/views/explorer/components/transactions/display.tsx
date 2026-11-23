import { cn } from '@/lib/utils'
import { msg } from '@lingui/core/macro'
import type { MessageDescriptor } from '@lingui/core'
import { useLingui } from '@lingui/react/macro'
import {
  ArrowLeftRight,
  ArrowUpRight,
  Minus,
  Plus,
  type LucideIcon,
} from 'lucide-react'
import { formatCurrency, shortenAddress } from 'utils'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { formatEther } from 'viem'
import { type TransactionRecord } from './useTransactionData'

const TYPE_LABELS: Record<string, MessageDescriptor> = {
  MINT: msg`Mint`,
  REDEEM: msg`Redeem`,
  TRANSFER: msg`Transfer`,
  BURN: msg`Melt`,
  ISSUE: msg`Issue`,
  ISSUE_START: msg`Start Issue`,
  CLAIM: msg`Claim`,
  CANCEL_ISSUANCE: msg`Cancel Issue`,
  STAKE: msg`Stake`,
  UNSTAKE: msg`Unstake`,
  WITHDRAW: msg`Withdraw`,
  DEPOSIT: msg`Deposit`,
  WITHDRAWAL: msg`Withdraw`,
  UNSTAKE_CANCELLED: msg`Unstake Cancelled`,
}

const TYPE_ICONS: Record<string, LucideIcon> = {
  MINT: Plus,
  ISSUE: Plus,
  ISSUE_START: Plus,
  STAKE: Plus,
  DEPOSIT: Plus,
  REDEEM: Minus,
  BURN: Minus,
  UNSTAKE: Minus,
  WITHDRAW: Minus,
  WITHDRAWAL: Minus,
}

const RSR_AMOUNT_TYPES = new Set([
  'STAKE',
  'UNSTAKE',
  'WITHDRAW',
  'DEPOSIT',
  'WITHDRAWAL',
])

export const getAmount = (tx: TransactionRecord) =>
  `${formatCurrency(+formatEther(tx.amount))} ${
    RSR_AMOUNT_TYPES.has(tx.type) ? 'RSR' : tx.token.symbol
  }`

export const getUsd = (tx: TransactionRecord) => {
  if (tx.amountUSD === null || tx.amountUSD === undefined) return '—'
  return isNaN(+tx.amountUSD)
    ? `$${tx.amountUSD}`
    : `$${formatCurrency(+tx.amountUSD)}`
}

export const getWallet = (tx: TransactionRecord) =>
  tx.type === 'MINT' || tx.type === 'ISSUE' ? tx.to.id : tx.from.id

export const getTxLink = (tx: TransactionRecord) =>
  getExplorerLink(tx.hash, tx.chain, ExplorerDataType.TRANSACTION)

export const TypeLabel = ({
  type,
  compact,
}: {
  type: string
  compact?: boolean
}) => {
  const { t } = useLingui()
  const Icon = TYPE_ICONS[type] ?? ArrowLeftRight
  const label = TYPE_LABELS[type] ? t(TYPE_LABELS[type]) : type

  return (
    <span
      className={cn(
        'flex items-center gap-2.5 font-semibold',
        compact && 'gap-1.5'
      )}
    >
      {!compact && (
        <span
          aria-hidden
          className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-muted"
        >
          <Icon size={15} strokeWidth={2.2} />
        </span>
      )}
      <span className="capitalize">{label}</span>
      {compact && <Icon size={15} className="text-legend" aria-hidden />}
    </span>
  )
}

export const ExternalLink = ({
  href,
  children,
  className,
}: {
  href: string
  children: React.ReactNode
  className?: string
}) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    className={cn(
      'inline-flex items-center gap-1.5 text-foreground hover:text-primary',
      className
    )}
  >
    {children}
    <ArrowUpRight size={14} className="shrink-0 text-legend" aria-hidden />
  </a>
)

export const WalletLink = ({ tx }: { tx: TransactionRecord }) => (
  <ExternalLink href={`https://debank.com/profile/${getWallet(tx)}`}>
    {shortenAddress(getWallet(tx))}
  </ExternalLink>
)
