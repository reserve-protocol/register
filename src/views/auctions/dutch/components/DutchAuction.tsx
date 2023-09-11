import TokenLogo from 'components/icons/TokenLogo'
import { ArrowRight } from 'react-feather'
import { Box, Card, Divider, Grid } from 'theme-ui'
import { Address } from 'viem'
import { DutchTrade } from '../atoms'
import useAuctionPrices from '../hooks/useAuctionPrices'
import AuctionActions from './AuctionActions'
import AuctionItem from './AuctionItem'

interface Props {
  data: DutchTrade
}

const DutchAuction = ({ data }: Props) => {
  const [currentPrice, nextPrice] = useAuctionPrices(data.id as Address)

  return (
    <Card p={2} sx={{ display: 'flex', alignItems: 'center' }} mb={3}>
      <Box sx={{ flexGrow: 1 }}>
        <Grid sx={{ flexGrow: 1 }} columns={[2, 4]}>
          <AuctionItem
            title="Selling"
            icon={<TokenLogo width={16} symbol={data.sellingTokenSymbol} />}
            symbol={data.sellingTokenSymbol}
            amount={data.amount}
          />
          <AuctionItem
            title="Buying (current price)"
            icon={<TokenLogo width={16} symbol={data.buyingTokenSymbol} />}
            symbol={data.buyingTokenSymbol}
            forSymbol={data.sellingTokenSymbol}
            amount={currentPrice}
            price={currentPrice ? currentPrice / data.amount : 0}
          />
          <AuctionItem
            title="Next block bid amount"
            icon={<ArrowRight size={16} />}
            symbol={data.buyingTokenSymbol}
            forSymbol={data.sellingTokenSymbol}
            amount={nextPrice}
            price={nextPrice ? nextPrice / data.amount : 0}
          />
          <AuctionItem
            title="Final price"
            icon={<ArrowRight size={16} />}
            symbol={data.buyingTokenSymbol}
            forSymbol={data.sellingTokenSymbol}
            amount={data.amount * data.worstCasePrice}
            price={data.worstCasePrice}
          />
        </Grid>
        <Divider my={2} sx={{ fontSize: 1 }} />
        <AuctionActions data={data} currentPrice={currentPrice} />
      </Box>
    </Card>
  )
}

export default DutchAuction
