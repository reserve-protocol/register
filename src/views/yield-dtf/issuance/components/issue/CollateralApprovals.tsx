import ERC20 from 'abis/ERC20'
import USDT from 'abis/USDT'
import TransactionButton from '@/components/ui/transaction-button'
import OverviewIcon from 'components/icons/OverviewIcon'
import TokenItem from 'components/token-item'
import useContractWrite from 'hooks/useContractWrite'
import useRToken from 'hooks/useRToken'
import useWatchTransaction from 'hooks/useWatchTransaction'
import { useAtomValue } from 'jotai'
import { useEffect, useMemo, useState } from 'react'
import { CheckCircle, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { chainIdAtom } from 'state/atoms'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { Token } from 'types'
import { formatCurrency } from 'utils'
import { ChainId } from 'utils/chains'
import { BIGINT_MAX } from 'utils/constants'
import { Address, formatUnits } from 'viem'
import { quantitiesAtom } from '@/views/yield-dtf/issuance/atoms'

interface CollateralApprovalProps {
  collateral: Token
  amount?: bigint
  allowance: boolean
  loading: boolean
  className?: string
}

const CollateralApproval = ({
  amount,
  allowance,
  collateral,
  loading,
  className,
}: CollateralApprovalProps) => {
  const chainId = useAtomValue(chainIdAtom)
  const rToken = useRToken()

  const approveCall = useMemo(() => {
    if (!rToken || loading || !amount || allowance) {
      return undefined
    }

    if (collateral.symbol === 'USDT' && chainId === ChainId.Mainnet) {
      return {
        abi: USDT,
        address: collateral.address,
        functionName: 'approve',
        args: [rToken?.address || '0x', BIGINT_MAX],
        enabled: !!rToken && !loading && !!amount && !allowance,
      }
    }

    return {
      abi: ERC20,
      address: collateral.address,
      functionName: 'approve',
      args: [
        rToken?.address || '0x',
        collateral.symbol === 'wcUSDCv3' ||
        collateral.symbol === 'wcUSDTv3' ||
        collateral.symbol === 'wcUSDbCv3'
          ? BIGINT_MAX
          : amount
            ? (amount * 120n) / 100n
            : 0n,
      ],
      enabled: !!rToken && !loading && !!amount && !allowance,
    }
  }, [rToken, loading, amount, allowance, collateral])

  const { write, hash, isLoading, reset } = useContractWrite(approveCall as any)
  const { status } = useWatchTransaction({
    hash,
    label: `Approve ${collateral.symbol}`,
  })

  useEffect(() => {
    if (status === 'error') {
      reset()
    }
  }, [status])

  return (
    <div className={cn('flex items-center', className)}>
      <div>
        <TokenItem symbol={collateral.symbol} />
      </div>
      {!amount ? (
        <Loader2 className="ml-2 h-3.5 w-3.5 animate-spin" />
      ) : (
        <span className="ml-2 text-xs text-legend">
          ({formatCurrency(Number(formatUnits(amount, collateral.decimals)), 6)}
          )
        </span>
      )}
      {!!amount && (
        <div className="ml-auto text-xs">
          {isLoading && !hash && (
            <span className="text-warning">Sign in wallet</span>
          )}
          {hash && status !== 'success' && (
            <span className="text-legend">Pending</span>
          )}
          {(status === 'success' || allowance) && (
            <span className="text-success">Confirmed</span>
          )}
          {!hash && !isLoading && !allowance && (
            <TransactionButton
              text="Approve"
              onClick={write}
              disabled={!write}
              size="sm"
            />
          )}
        </div>
      )}
    </div>
  )
}

const CollateralApprovals = ({
  hasAllowance,
  pending,
}: {
  hasAllowance: boolean
  pending: Address[]
}) => {
  const rToken = useRToken()
  const [isVisible, setVisible] = useState(true)
  const quantities = useAtomValue(quantitiesAtom)
  const isFetching = !hasAllowance && !pending.length

  return (
    <div className="border border-input rounded-md max-h-[280px] overflow-auto px-2 py-4 mt-4">
      <div
        className="flex items-center cursor-pointer"
        onClick={() => setVisible(!isVisible)}
      >
        <OverviewIcon />
        <span className="ml-2">Collateral approvals</span>
        <div className="ml-2">
          {hasAllowance && !!quantities && (
            <CheckCircle color="#75FBC3" size={16} />
          )}
          {!quantities && <Loader2 className="h-4 w-4 animate-spin" />}
          {!hasAllowance && pending.length && (
            <span className="text-warning">({pending.length})</span>
          )}
        </div>
        <div className="mx-auto" />
        {isVisible ? <ChevronUp /> : <ChevronDown />}
      </div>
      {isVisible && (
        <div>
          <Separator className="-mx-2 mt-4" />
          {rToken?.collaterals.map((collateral) => (
            <CollateralApproval
              className="mt-4"
              key={collateral.address}
              collateral={collateral}
              loading={isFetching}
              amount={quantities ? quantities[collateral.address] : undefined}
              allowance={pending.indexOf(collateral.address) === -1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default CollateralApprovals
