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
import lcapLogo from '../../../assets/lcap-logo.png'
import krakenLogo from '../../../assets/kraken-white.png'
import reserveLogo from '../../../assets/reserve-white.png'
import TitleContainer from '../../title-container'

const FEATURED = [
  {
    symbol: 'BGCI',
    name: 'Bloomberg Galaxy Crypto Index',
    address: '0x23418De10d422AD71C9D5713a2B8991a9c586443',
    chainId: ChainId.Base,
    icon: 'https://l5394zf57b.ufs.sh/f/mupND8QUUvXxatO12rMDmcrOHpGTwz5KhD49x3ZgtblqPMsQ',
    cover: bloombergCover,
  },
  {
    symbol: 'VTF',
    name: 'Virtuals Index',
    address: '0x47686106181b3CEfe4eAf94C4c10b48Ac750370b',
    chainId: ChainId.Base,
    icon: 'https://l5394zf57b.ufs.sh/f/mupND8QUUvXx5AQG85hN1x8WsPzKQYEGuJwIpDVehmXl4fqM',
    cover: virtualsCover,
  },
  {
    symbol: 'DFX',
    name: 'CoinDesk DeFi Select Index',
    address: '0x188D12Eb13a5Eadd0867074ce8354B1AD6f4790b',
    chainId: ChainId.Mainnet,
    icon: 'https://l5394zf57b.ufs.sh/f/mupND8QUUvXx5V0tDlhN1x8WsPzKQYEGuJwIpDVehmXl4fqM',
    cover: coindeskCover,
  },
]

const IndexDTFFeatured = () => {
  return (
    <div className="grid grid-cols-[350px_350px_350px] xl:grid-cols-3 gap-1 sm:gap-3 overflow-x-auto md:px-0">
      {FEATURED.map((dtf) => (
        <Link
          to={getFolioRoute(dtf.address, dtf.chainId)}
          key={dtf.address}
          className="p-1 bg-muted rounded-4xl flex flex-col min-w-[350px]"
        >
          <img
            alt="featured dtf"
            className="w-full rounded-3xl mb-1"
            src={dtf.cover}
          />
          <div className="flex items-center gap-2 md:gap-3 flex-grow rounded-3xl bg-card p-4 py-3 md:p-6 md:py-5">
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

export function LcapBanner() {
  return (
    <>
      <div className="container mt-10">
        <TitleContainer title="Presenting" className="mt-4" />
      </div>
      <div className="w-full relative overflow-hidden ">
        {/* Blue gradient background matching the reference */}
        <div className="bg-gradient-to-r from-[#0854A9] via-[#063B7A] to-[#042A5C] w-full px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
              {/* Left side - LCAP Logo */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 relative">
                  <img
                    src={lcapLogo}
                    alt="LCAP Token"
                    className="object-contain"
                  />
                </div>
              </div>

              {/* Center - Main content */}
              <div className="flex-1 text-center lg:text-left space-y-6">
                <div className="space-y-4">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight text-balance">
                    Serious crypto exposure
                    <br />
                    in a single token
                  </h1>

                  <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 text-lg md:text-xl text-white/90">
                    <span className="font-medium">$LCAP also available on</span>
                    <div className="h-8 md:h-10 relative">
                      <img
                        src={krakenLogo}
                        alt="Kraken"
                        height={40}
                        width={120}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right side - Additional visual space for balance */}
              <div className="hidden lg:block flex-shrink-0 w-24"></div>
            </div>
          </div>
        </div>
        {/* Subtle overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/10 pointer-events-none"></div>
      </div>
    </>
  )
}

export default LcapBanner

// export default IndexDTFFeatured
