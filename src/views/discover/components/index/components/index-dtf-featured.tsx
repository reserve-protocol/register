import ChainLogo from '@/components/icons/ChainLogo'
import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import { getFolioRoute } from '@/utils'
import { ChainId } from '@/utils/chains'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import bloombergCover from '../../../assets/featured-bloomberg.png'
import virtualsCover from '../../../assets/featured-virtuals.png'
import coindeskCover from '../../../assets/featured-coindesk.png'

const FEATURED = [
  {
    symbol: 'BGCI',
    name: 'Bloomberg Galaxy Crypto Index',
    address: '0x23418De10d422AD71C9D5713a2B8991a9c586443',
    chainId: ChainId.Base,
    icon: 'https://ipfs.satsuma.xyz/ipfs/QmX1dZeXd4YjYv8kZ5i9Ao2w2iauGKHaGi2hdc1m3kBCAF',
    cover: bloombergCover,
  },
  {
    symbol: 'VTF',
    name: 'Virtuals Index',
    address: '0x47686106181b3CEfe4eAf94C4c10b48Ac750370b',
    chainId: ChainId.Base,
    icon: 'https://ipfs.satsuma.xyz/ipfs/QmSKEg4GqeupnBk6vCaFV4TCxUFmQEggBpUhUQsC8uC228',
    cover: virtualsCover,
  },
  {
    symbol: 'DFX',
    name: 'CoinDesk DeFi Select Index',
    address: '0x188D12Eb13a5Eadd0867074ce8354B1AD6f4790b',
    chainId: ChainId.Mainnet,
    icon: 'https://ipfs.satsuma.xyz/ipfs/QmWnKyhHbJzT5vBAycvbEk8gKFoH46VXTT4Q5gEXtYXAtP',
    cover: coindeskCover,
  },
]

const IndexDTFFeatured = () => {
  return (
    <div className="grid grid-cols-[350px_350px_350px] xl:grid-cols-3 gap-4 overflow-x-auto px-2 md:px-0">
      {FEATURED.map((dtf) => (
        <Link
          to={getFolioRoute(dtf.address, dtf.chainId)}
          key={dtf.address}
          className="p-1 bg-muted rounded-4xl flex flex-col min-w-[350px]"
        >
          <img
            alt="featured dtf"
            className="w-full rounded-3xl"
            src={dtf.cover}
          />
          <div className="flex items-center gap-3 flex-grow rounded-3xl bg-card p-6">
            <div className="relative">
              <TokenLogo src={dtf.icon} size="xl" />
              <ChainLogo
                chain={dtf.chainId}
                className="absolute -bottom-1 -right-1"
              />
            </div>
            <div className="mr-auto">
              <h4 className="font-semibold">{dtf.name}</h4>
              <span className="text-legend">${dtf.symbol}</span>
            </div>
            <Button size="icon-rounded" className="hidden xl:block">
              <ArrowRight size={16} />
            </Button>
          </div>
        </Link>
      ))}
    </div>
  )
}

export default IndexDTFFeatured
