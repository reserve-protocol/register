import ChainLogo from '@/components/icons/ChainLogo'
import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import { getFolioRoute } from '@/utils'
import { ChainId } from '@/utils/chains'
import { ArrowRight, ArrowUpRight, CalendarRange, Coins } from 'lucide-react'
import { Link } from 'react-router-dom'
import bloombergCover from '../../../assets/featured-bloomberg.png'
import virtualsCover from '../../../assets/featured-virtuals.png'
import coindeskCover from '../../../assets/featured-coindesk.png'
import useCampaignRewards from '@/views/index-dtf/overview/hooks/use-campaign'

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

const CAMPAIGN_URL = 'https://reserve.merkl.xyz/'

const IndexDTFFeatured = () => {
  const { data: campaignData } = useCampaignRewards()

  return (
    <div className="bg-secondary rounded-4xl p-1">
      <div className="grid grid-cols-[350px_350px_350px] lg:grid-cols-3 gap-1 overflow-x-auto md:px-0 ">
        {FEATURED.map((dtf) => {
          const data = campaignData?.[dtf.address.toLowerCase()]

          return (
            <Link
              to={getFolioRoute(dtf.address, dtf.chainId)}
              key={dtf.address}
              className="p-2 bg-card rounded-4xl flex flex-col min-w-[350px]"
            >
              <img
                alt="featured dtf"
                className="w-full rounded-3xl mb-1"
                src={dtf.cover}
              />
              <div className="flex items-center gap-2 md:gap-3 flex-grow rounded-3xl bg-card p-2 lg:p-4 py-2  lg:py-5">
                <div className="relative ">
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
                <Button size="icon-rounded" variant="muted">
                  <ArrowRight size={16} />
                </Button>
              </div>
              <Button
                size="lg"
                onClick={(e) => {
                  e.preventDefault()
                  window.open(data?.url ?? '', '_blank')
                }}
                className="gap-1 mt-2 rounded-2xl w-full bg-[#FFBE45] hover:bg-[#FFBE45]/90  text-black"
              >
                <Coins size={16} />
                <span>{data?.apr.toFixed(2)}% APR</span>
                <ArrowUpRight size={16} />
              </Button>
            </Link>
          )
        })}
      </div>
      <div className="p-4 flex items-center gap-1  max-[1140px]:justify-center text-[#805F23]">
        <p className="mr-auto hidden min-[1140px]:block">
          The campaign includes{' '}
          <a href={CAMPAIGN_URL} className="underline" target="_blank">
            11 additional DTFs
          </a>{' '}
          beyond the featured. You claim rewards in the{' '}
          <a href={CAMPAIGN_URL} className="underline" target="_blank">
            Reserve x Merkl UI
          </a>
          .
        </p>
        <div className="flex items-center gap-1 ">
          <CalendarRange size={16} />
          Campaign ends:
          <span className="font-bold">April 1, 2025</span>
        </div>
      </div>
    </div>
  )
}

export default IndexDTFFeatured
