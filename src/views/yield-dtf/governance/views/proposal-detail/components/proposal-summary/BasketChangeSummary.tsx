import AsteriskIcon from 'components/icons/AsteriskIcon'
import TokenLogo from 'components/icons/TokenLogo'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import { ArrowDown, ArrowRight, ArrowUp, Plus, X } from 'lucide-react'
import 'react-json-view-lite/dist/index.css'
import { collateralYieldAtom } from 'state/atoms'
import { formatPercentage } from 'utils'
import { collateralDisplay } from 'utils/constants'
import { ProposalCall } from '@/views/yield-dtf/governance/atoms'
import {
  BasketItem,
  DiffItem,
  useBasketChangesSummary,
} from '@/views/yield-dtf/governance/hooks'
import Spinner from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

const useBasketApy = (
  basket: BasketItem,
  chainId: number,
  symbols: Record<string, string>
) => {
  const apys = useAtomValue(collateralYieldAtom)[chainId]

  return Object.keys(basket).reduce((acc, token) => {
    return (
      acc +
      (apys[symbols[token]?.toLowerCase()] || 0) *
        (Number(basket[token].share) / 100)
    )
  }, 0)
}

interface IStatusBox {
  status: DiffItem['status']
  className?: string
}

const StatusBox = ({ status, className }: IStatusBox) => {
  const statusMap = {
    added: {
      label: 'Add',
      icon: <Plus size={16} color="#2150A9" />,
    },
    removed: {
      label: 'Remove',
      icon: <X size={16} color="#FF0000" />,
    },
    increased: {
      label: 'Increase',
      icon: <ArrowUp size={16} color="#11BB8D" />,
    },
    reduced: {
      label: 'Reduce',
      color: 'warning',
      icon: <ArrowDown size={16} color="#FF8A00" />,
    },
    unchanged: {
      label: 'No change',
      icon: <AsteriskIcon />,
    },
  }

  return (
    <div
      className={cn(
        'flex items-center px-2.5 py-1 h-fit border border-border text-xs sm:text-sm font-medium gap-1 rounded-xl',
        className
      )}
    >
      {statusMap[status].icon}
      <span className={status === 'unchanged' ? 'text-muted-foreground' : ''}>
        {statusMap[status].label}
      </span>
    </div>
  )
}

const BasketDiffItem = ({ item }: { item: DiffItem }) => {
  const rToken = useRToken()
  const apys = useAtomValue(collateralYieldAtom)[rToken?.chainId ?? 1] || {}

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-2 w-full">
      <div className="flex items-center gap-1">
        <TokenLogo className="mr-2" symbol={item.symbol} />
        <div className="text-xs">
          <span className="font-bold">
            {collateralDisplay[item.symbol.toLowerCase()] || item.symbol}
          </span>
          <div className="flex items-center gap-1">
            <span className="font-medium">{item.targetUnit}</span>|
            <span className="text-legend">APY:</span>{' '}
            <span className="font-medium">
              {formatPercentage(apys[item.symbol.toLowerCase()])}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-start sm:justify-center font-medium">
        <StatusBox
          className="flex sm:hidden mr-auto"
          status={item.status}
        />

        <span
          className={cn(
            'min-w-[52px] text-right',
            item.status === 'added' || item.status === 'unchanged'
              ? 'text-muted-foreground'
              : ''
          )}
        >
          {item.status === 'added' ? 'N/A' : formatPercentage(item.oldWeight)}
        </span>
        <div className="mx-2 bg-muted h-5 w-5 flex justify-center items-center rounded">
          <ArrowRight size={12} />
        </div>
        <span
          className={cn(
            'min-w-[52px]',
            item.status === 'unchanged' ? 'text-muted-foreground' : ''
          )}
        >
          {formatPercentage(item.newWeight)}
        </span>
      </div>
      <StatusBox
        className="hidden sm:flex ml-auto"
        status={item.status}
      />
    </div>
  )
}

const BasketAPYDiff = ({
  snapshot = {},
  proposal = {},
  meta = {},
}: {
  snapshot?: BasketItem
  proposal?: BasketItem
  meta?: Record<string, string>
}) => {
  const rToken = useRToken()
  const proposedApy = useBasketApy(proposal, rToken?.chainId ?? 1, meta)
  const currentApy = useBasketApy(snapshot, rToken?.chainId ?? 1, meta)

  return (
    <div className="flex items-center pt-4 mt-2 border-t border-border font-medium">
      <span className="mr-auto">30-day blended APY:</span>
      <span className="text-legend ml-4 mr-1">
        {formatPercentage(currentApy)}
      </span>
      <ArrowRight size={16} />
      <span className="ml-1">{formatPercentage(proposedApy)}</span>
    </div>
  )
}

const BasketChangeSummary = ({
  call,
  snapshotBlock,
}: {
  call: ProposalCall
  snapshotBlock?: number
}) => {
  const rToken = useRToken()
  const { data, isLoading } = useBasketChangesSummary(
    call.data,
    rToken?.address,
    rToken?.chainId,
    snapshotBlock
  )

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 items-center my-6">
        <Spinner size={20} />
        <span className="text-legend">Loading summary...</span>
      </div>
    )
  }

  return (
    <div className="mt-2">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2 text-muted-foreground text-xs">
        <span>Collateral token</span>
        <span className="mr-0 sm:mr-auto ml-auto">
          Old weight / New weight
        </span>
        <span className="ml-auto hidden sm:block">Change</span>
      </div>
      <div className="flex flex-col gap-4 sm:gap-2 w-full">
        {data?.diff.map((item) => (
          <BasketDiffItem key={item.address} item={item} />
        ))}
      </div>
      <BasketAPYDiff
        proposal={data?.proposalBasket}
        snapshot={data?.snapshotBasket}
        meta={data?.tokensMeta}
      />
    </div>
  )
}

export default BasketChangeSummary
