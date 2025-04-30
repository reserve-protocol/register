import TokenLogo from '@/components/token-logo'
import { cn } from '@/lib/utils'
import { ArrowLeftRight } from 'lucide-react'
import { Address } from 'viem'

type CollateralsProps = {
  orders?: {
    address: Address
    symbol: string
    amount: string
    value: string
    status: 'Filled' | 'Not Filled' | 'Pending'
  }[]
}

const mockCollaterals = [
  {
    address: '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf' as Address,
    symbol: 'cbBTC',
    amount: '0.0005',
    value: '3.50',
    status: 'Filled' as const,
  },
  {
    address: '0xCb327b99fF831bF8223cCEd12B1338FF3aA322Ff' as Address,
    symbol: 'bsdETH',
    amount: '0.001',
    value: '3.20',
    status: 'Pending' as const,
  },
  {
    address: '0x9B8Df6E244526ab5F6e6400d331DB28C8fdDdb55' as Address,
    symbol: 'uSOL',
    amount: '0.1',
    value: '2.50',
    status: 'Not Filled' as const,
  },
  {
    address: '0xd403D1624DAEF243FbcBd4A80d8A6F36afFe32b2' as Address,
    symbol: 'uLINK',
    amount: '0.5',
    value: '2.00',
    status: 'Filled' as const,
  },
  {
    address: '0xd6a34b430C05ac78c24985f8abEE2616BC1788Cb' as Address,
    symbol: 'uAVAX',
    amount: '0.1',
    value: '1.80',
    status: 'Pending' as const,
  },
  {
    address: '0x378c326A472915d38b2D8D41e1345987835FaB64' as Address,
    symbol: 'uXLM',
    amount: '10',
    value: '1.50',
    status: 'Not Filled' as const,
  },
  {
    address: '0xb0505e5a99abd03d94a1169e638B78EDfEd26ea4' as Address,
    symbol: 'uSUI',
    amount: '2',
    value: '1.20',
    status: 'Filled' as const,
  },
  {
    address: '0x0F813f4785b2360009F9aC9BF6121a85f109efc6' as Address,
    symbol: 'uDOT',
    amount: '1',
    value: '1.00',
    status: 'Pending' as const,
  },
  {
    address: '0x3EB097375fc2FC361e4a472f5E7067238c547c52' as Address,
    symbol: 'uLTC',
    amount: '0.05',
    value: '0.80',
    status: 'Not Filled' as const,
  },
  {
    address: '0x7bE0Cc2cADCD4A8f9901B4a66244DcDd9Bd02e0F' as Address,
    symbol: 'uBCH',
    amount: '0.05',
    value: '0.70',
    status: 'Filled' as const,
  },
  {
    address: '0xc3De830EA07524a0761646a6a4e4be0e114a3C83' as Address,
    symbol: 'UNI',
    amount: '1',
    value: '0.50',
    status: 'Pending' as const,
  },
  {
    address: '0x5ed25E305E08F58AFD7995EaC72563E6BE65A617' as Address,
    symbol: 'uNEAR',
    amount: '2',
    value: '0.30',
    status: 'Not Filled' as const,
  },
]

const Collaterals = ({ orders = mockCollaterals }: CollateralsProps) => {
  return (
    <div className="flex flex-col px-6 border border-border rounded-2xl overflow-y-auto max-h-[350px] min-w-[400px]">
      {orders.map((order) => (
        <div className="flex items-center justify-between gap-2 border-b border-border py-4 last:border-b-0 last:pb-0">
          <div className="flex items-center gap-2">
            <TokenLogo
              address={order.address}
              symbol={order.symbol}
              size="xl"
            />
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {order.amount} {order.symbol}
              </span>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <ArrowLeftRight size={12} />
                <span>{order.value} USDC</span>
              </div>
            </div>
          </div>
          <div
            className={cn(
              'text-sm font-medium',
              order.status === 'Not Filled' && 'text-destructive',
              order.status === 'Pending' && 'text-yellow-500',
              order.status === 'Filled' && 'text-primary'
            )}
          >
            {order.status}
          </div>
        </div>
      ))}
    </div>
  )
}

export default Collaterals
