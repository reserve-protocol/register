import { Button } from '@/components/ui/button'
import { getFolioRoute } from '@/utils'
import { ChainId } from '@/utils/chains'
import { ArrowRight, Sparkle } from 'lucide-react'
import { Link } from 'react-router-dom'
import krakenLogoWhite from '../../../assets/kraken-white.png'
import lcapBg from '../../../assets/lcap-bg.png'
import lcapLogo from '../../../assets/lcap-logo.png'
import TokenLogo from '@/components/token-logo'

const cmcLogo =
  'https://l5394zf57b.ufs.sh/f/mupND8QUUvXxhO6t9I2BbMt4sV2Y6jmzwPSZ3Hrav0gfieuo'
const cmcBanner =
  'https://l5394zf57b.ufs.sh/f/mupND8QUUvXxIC8FNf6xZOd2tbVAjQ406SzW5e3InqXoRl1x'

export function IndexDTFFeatured() {
  return (
    <>
      <div className="w-full relative overflow-hidden">
        <div className="rounded-3xl bg-gradient-to-b from-[#2444D4] to-[#2444D4]/20 p-1 flex flex-row  gap-1">
          <img
            src="https://l5394zf57b.ufs.sh/f/mupND8QUUvXxIC8FNf6xZOd2tbVAjQ406SzW5e3InqXoRl1x"
            alt="CMC Banner"
            className="sm:rounded-3xl w-[404px] h-[404px] hidden md:flex object-cover"
          />

          <div className="bg-card flex-grow relative rounded-3xl flex flex-col p-4 sm:p-6 justify-center">
            <TokenLogo
              src={cmcLogo}
              size="xl"
              className="mb-6 md:mb-auto absolute top-4 sm:top-0 right-4 sm:right-0 sm:relative"
            />
            <div className="flex items-center gap-2 text-[#2444D4] bg-[#2444D4] border border-[#2444D4] bg-opacity-10 rounded-full w-fit px-3 py-1 sm:py-2 mb-6">
              <Sparkle className="w-3 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm">Introducing</span>
            </div>
            <h1 className="text-2xl sm:text-5xl md:text-3xl lg:text-4xl xl:text-5xl  text-[#2444D4] animate-fade-in mb-4 sm:mb-6 ">
              CoinMarketCap 20 Index DTF:
              <br />
              Crypto's S&P 500
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl mb-4 sm:mb-6 ">
              Ride the market, don’t chase it
            </p>
            <div className="flex items-center flex-row flex-wrap-reverse  gap-2 ">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto rounded-lg bg-[#2444D4] px-4 text-white"
              >
                <Link
                  to={getFolioRoute(
                    '0x2f8a339b5889ffac4c5a956787cda593b3c36867',
                    ChainId.BSC
                  )}
                >
                  Discover $CMC20 <ArrowRight className="ml-2" size={16} />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default IndexDTFFeatured
