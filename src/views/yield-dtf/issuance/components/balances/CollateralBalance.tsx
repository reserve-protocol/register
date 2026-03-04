import { Trans } from '@lingui/macro'
import TokenBalance from 'components/token-balance'
import { useAtomValue } from 'jotai'
import { Circle } from 'lucide-react'
import { balancesAtom } from 'state/atoms'
import { cn } from '@/lib/utils'
import { Token } from 'types'
import { formatCurrency } from 'utils'
import { formatUnits } from 'viem'
import { quantitiesAtom } from '@/views/yield-dtf/issuance/atoms'

interface Props {
  token: Token
  className?: string
}

const CollateralBalance = ({ token, className }: Props) => {
  const quantities = useAtomValue(quantitiesAtom)
  const balances = useAtomValue(balancesAtom)

  if (!quantities || !quantities[token.address]) {
    return (
      <TokenBalance
        symbol={token.symbol}
        balance={+(balances[token.address]?.balance ?? '0')}
        className={className}
      />
    )
  }

  const current = +(balances[token.address]?.balance ?? 0)
  const required = +formatUnits(quantities[token.address], token.decimals)
  const isValid =
    current && balances[token.address].value >= quantities[token.address]

  return (
    <div className={className}>
      <div className="flex items-center">
        <TokenBalance
          symbol={token.symbol}
          balance={+(balances[token.address]?.balance ?? '0')}
        />
        <div className="ml-auto">
          <Circle
            size={8}
            fill={isValid ? '#11BB8D' : '#FF0000'}
            stroke="none"
          />
        </div>
      </div>
      <div className="text-right text-xs mb-1 ml-auto">
        <span className="text-legend">
          <Trans>Required:</Trans>
        </span>{' '}
        <span className="font-medium">{formatCurrency(required, 6)}</span>
      </div>
      {!isValid && (
        <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${Math.min((current / required) * 100, 100)}%` }}
          />
        </div>
      )}
    </div>
  )
}

export default CollateralBalance
