import { useLingui } from '@lingui/react/macro'
import TokenLogo from 'components/icons/TokenLogo'
import { ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Address } from 'viem'
import { DutchTrade } from '../atoms'
import useAuctionPrices from '../hooks/useAuctionPrices'
import AuctionActions from './AuctionActions'
import AuctionItem from './AuctionItem'

interface Props {
  data: DutchTrade
}

const DutchAuction = ({ data }: Props) => {
  const { t } = useLingui()
  const [currentPrice, currentPriceRaw, nextPrice] = useAuctionPrices(
    data.id as Address,
    data.buyingTokenDecimals
  )

  return (
    <Card className="p-4 flex items-center mb-4">
      <div className="flex-grow">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <AuctionItem
            title={t`Selling`}
            icon={<TokenLogo width={16} symbol={data.sellingTokenSymbol} />}
            symbol={data.sellingTokenSymbol}
            amount={data.amount}
          />
          <AuctionItem
            title={t`Buying (current price)`}
            icon={<TokenLogo width={16} symbol={data.buyingTokenSymbol} />}
            symbol={data.buyingTokenSymbol}
            forSymbol={data.sellingTokenSymbol}
            amount={currentPrice}
            price={currentPrice ? currentPrice / data.amount : 0}
          />
          <AuctionItem
            title={t`Next block bid amount`}
            icon={<ArrowRight size={16} />}
            symbol={data.buyingTokenSymbol}
            forSymbol={data.sellingTokenSymbol}
            amount={nextPrice}
            price={nextPrice ? nextPrice / data.amount : 0}
          />
          <AuctionItem
            title={t`Final price`}
            icon={<ArrowRight size={16} />}
            symbol={data.buyingTokenSymbol}
            forSymbol={data.sellingTokenSymbol}
            amount={data.amount * data.worstCasePrice}
            price={data.worstCasePrice}
          />
        </div>
        <Separator className="my-4" />
        <AuctionActions data={data} currentPrice={currentPriceRaw} />
      </div>
    </Card>
  )
}

export default DutchAuction
