import dtfIndexAbi from '@/abis/dtf-index-abi'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { chainIdAtom } from '@/state/atoms'
import { Token } from '@/types'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { useAtomValue } from 'jotai'
import { ArrowUpRightIcon } from 'lucide-react'
import { useMemo } from 'react'
import { collapseAllNested, defaultStyles } from 'react-json-view-lite'
import { JsonView } from 'react-json-view-lite'
import { Link } from 'react-router-dom'
import { Address, decodeFunctionData, Hex } from 'viem'

type Trade = {
  id: bigint
  sell: Address
  buy: Address
  sellLimit: {
    spot: bigint
    low: bigint
    high: bigint
  }
  buyLimit: {
    spot: bigint
    low: bigint
    high: bigint
  }
  prices: {
    start: bigint
    end: bigint
  }
  ttl: bigint
}

interface BasketProposalPreviewProps {
  calldatas: Hex[] | undefined
  address: Address | undefined
  basket: Token[] | undefined
  shares: Record<string, string>
  prices: Record<string, number>
}

const useDecodedTrades = (calldatas: Hex[] | undefined): Trade[] => {
  return useMemo(() => {
    if (!calldatas) return []

    return calldatas.map((calldata) => {
      const { args } = decodeFunctionData({
        abi: dtfIndexAbi,
        data: calldata,
      })

      const [id, sell, buy, sellLimit, buyLimit, prices, ttl] = args

      return {
        id: id as bigint,
        sell: sell as Address,
        buy: buy as Address,
        sellLimit: sellLimit as {
          spot: bigint
          low: bigint
          high: bigint
        },
        buyLimit: buyLimit as {
          spot: bigint
          low: bigint
          high: bigint
        },
        prices: prices as {
          start: bigint
          end: bigint
        },
        ttl: ttl as bigint,
      }
    })
  }, [calldatas])
}

const TABS = {
  BASKET: 'basket',
  TRADES: 'trades',
  RAW: 'raw',
}

const Header = ({ address }: { address: Address }) => {
  const chainId = useAtomValue(chainIdAtom)

  return (
    <div className="mx-4 py-4 flex items-center flex-wrap gap-2 border-b">
      <h1 className="text-xl font-bold text-primary">Folio</h1>
      <Link
        target="_blank"
        className="mr-auto"
        to={getExplorerLink(address, chainId, ExplorerDataType.ADDRESS)}
      >
        <Button
          size="icon-rounded"
          className="bg-primary/10 text-primary h-6 w-6 p-0 hover:text-white"
        >
          <ArrowUpRightIcon size={18} strokeWidth={1.5} />
        </Button>
      </Link>

      <TabsList className="h-9">
        <TabsTrigger value={TABS.BASKET} className="w-max h-7">
          Summary
        </TabsTrigger>
        <TabsTrigger value={TABS.TRADES} className="w-max h-7">
          Trades
        </TabsTrigger>
        <TabsTrigger value={TABS.RAW} className="w-max h-7">
          Raw
        </TabsTrigger>
      </TabsList>
    </div>
  )
}

const BasketPreview = () => {
  return <div>Basket preview</div>
}

const TradesPreview = () => {
  return <div>Trades preview</div>
}

// TODO: Get signature and params from calldata
const RawPreview = ({
  trades,
  calldatas,
}: {
  trades: Trade[]
  calldatas: Hex[] | undefined
}) => {
  if (!calldatas) return <Skeleton className="h-24 rounded-3xl" />

  const totalTrades = trades.length

  return (
    <div className="p-4">
      {trades.map((trade, i) => (
        <div className="flex flex-col gap-2" key={trade.id.toString()}>
          <h4 className="text-primary text-lg font-semibold">
            {i + 1}/{totalTrades}
          </h4>
          <div>
            <span className="text-legend text-sm block">Signature</span>
            <span className="font-semibold">
              approveTrade(tradeId: uint256, sell: address, buy: address,
              sellLimit: IFolio.Range, buyLimit: IFolio.Range, prices:
              IFolio.Range, ttl: uint256)
            </span>
          </div>
          <div>
            <span className="text-legend text-sm">Parameters</span>
            <JsonView
              shouldExpandNode={collapseAllNested}
              style={defaultStyles}
              data={trade}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

const BasketProposalPreview = ({
  calldatas,
  basket,
  shares,
  prices,
  address,
}: BasketProposalPreviewProps) => {
  const trades = useDecodedTrades(calldatas)

  return (
    <Tabs
      defaultValue="basket"
      className="flex flex-col gap-4 p-2 pt-4 rounded-3xl bg-background"
    >
      <Header address={address ?? '0x'} />
      <TabsContent className="m-0" value={TABS.BASKET}>
        <BasketPreview />
      </TabsContent>
      <TabsContent className="m-0" value={TABS.TRADES}>
        <TradesPreview />
      </TabsContent>
      <TabsContent className="m-0" value={TABS.RAW}>
        <RawPreview trades={trades} calldatas={calldatas} />
      </TabsContent>
    </Tabs>
  )
}

export default BasketProposalPreview
