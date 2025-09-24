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
        <TitleContainer title="Featured" className="mt-4" />
      </div>
      <div className="lcap-banner-wrapper w-full relative overflow-hidden">
        <style>{`
          @keyframes gradientShift {
            0%, 100% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
          }

          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-10px);
            }
          }

          @keyframes pulse {
            0%, 100% {
              opacity: 0.4;
            }
            50% {
              opacity: 0.8;
            }
          }

          .lcap-banner {
            background: linear-gradient(
              135deg,
              #0266CC 0%,
              #0254A5 20%,
              #024080 35%,
              #023060 50%,
              #024080 65%,
              #0254A5 80%,
              #0266CC 100%
            );
            background-size: 400% 400%;
            animation: gradientShift 15s ease infinite;
            position: relative;
          }

          .light .lcap-banner {
            background: linear-gradient(
              135deg,
              #0A5FB4 0%,
              #0850A0 20%,
              #064590 35%,
              #053A80 50%,
              #064590 65%,
              #0850A0 80%,
              #0A5FB4 100%
            );
            background-size: 400% 400%;
            animation: gradientShift 15s ease infinite;
          }

          .lcap-banner::after {
            content: '';
            position: absolute;
            top: -20%;
            left: -10%;
            right: -10%;
            bottom: -20%;
            background-image: url('https://reserve.org/assets/img/pages/home/eth_battle_bg.svg');
            background-size: 120% 120%;
            background-position: 20% 30%;
            background-repeat: no-repeat;
            opacity: 0.2;
            filter: invert(1) brightness(2);
            pointer-events: none;
            animation: floatPattern 20s ease-in-out infinite;
          }

          @keyframes floatPattern {
            0%, 100% {
              transform: translate(0, 0) scale(1.2);
            }
            33% {
              transform: translate(-5%, 5%) scale(1.25);
            }
            66% {
              transform: translate(5%, -5%) scale(1.15);
            }
          }

          .lcap-banner::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(
              90deg,
              transparent 0%,
              rgba(255, 255, 255, 0.1) 50%,
              transparent 100%
            );
            animation: shimmer 3s infinite;
          }

          @keyframes shimmer {
            0% {
              left: -100%;
            }
            100% {
              left: 200%;
            }
          }

          .lcap-logo {
            transition: transform 0.3s ease;
            filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.15))
                    drop-shadow(0 0 40px rgba(255, 255, 255, 0.1));
          }

          @media (min-width: 1024px) {
            .lcap-logo {
              animation: float 6s ease-in-out infinite;
            }
          }

          .lcap-logo:hover {
            transform: scale(1.05);
            filter: drop-shadow(0 0 25px rgba(255, 255, 255, 0.2))
                    drop-shadow(0 0 50px rgba(255, 255, 255, 0.15));
          }

          .lcap-banner-bg-pattern {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            opacity: 0.1;
            background-image:
              radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.2) 0%, transparent 50%),
              radial-gradient(circle at 80% 50%, rgba(255, 255, 255, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
            animation: pulse 4s ease-in-out infinite;
          }
        `}</style>

        <div className="lcap-banner w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 sm:rounded-4xl">
          <div className="lcap-banner-bg-pattern sm:rounded-4xl"></div>

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-row items-center justify-center gap-4 sm:gap-6 lg:gap-16">
              <div className="lcap-logo flex-shrink-0">
                <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 lg:w-56 lg:h-56 relative">
                  <img
                    src={lcapLogo}
                    alt="LCAP Token"
                    className="object-contain w-full h-full"
                  />
                </div>
              </div>

              <div className="flex-1 text-left lg:text-left space-y-2 sm:space-y-4 lg:space-y-6 max-w-3xl">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight animate-fade-in">
                  Broad market exposure
                  <br />
                  in a single token
                </h1>
                <div className="flex items-center justify-between flex-wrap gap-2 pt-2 sm:pt-0">
                  <Button
                    asChild
                    className="bg-white text-primary hover:bg-white/90 h-7 px-2 text-xs sm:h-10 sm:px-4 sm:text-sm font-bold transition-colors"
                  >
                    <Link
                      to={getFolioRoute(
                        '0x4da9a0f397db1397902070f93a4d6ddbc0e0e6e8',
                        ChainId.Base
                      )}
                    >
                      Discover $LCAP
                    </Link>
                  </Button>

                  <div className="flex items-center justify-center h-7">
                    <a
                      href="https://www.kraken.com/prices/large-cap-dtf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs lg:text-sm text-white/70 sm:text-white/80 hover:text-white transition-all cursor-pointer group"
                    >
                      <span className="font-medium hidden sm:inline">
                        also available on
                      </span>
                      <span className="font-medium sm:hidden">Also on</span>
                      <img
                        src={krakenLogo}
                        alt="Kraken"
                        height={20}
                        width={50}
                        className="h-[10px] sm:h-[12px] lg:h-[14px] w-auto"
                      />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default LcapBanner

// export default IndexDTFFeatured
