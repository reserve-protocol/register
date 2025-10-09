import { Button } from '@/components/ui/button'
import { getFolioRoute } from '@/utils'
import { ChainId } from '@/utils/chains'
import { Sparkle } from 'lucide-react'
import { Link } from 'react-router-dom'
import krakenLogoWhite from '../../../assets/kraken-white.png'
import lcapBg from '../../../assets/lcap-bg.png'
import lcapLogo from '../../../assets/lcap-logo.png'

const KrakenLogo = () => (
  <svg
    className="h-3 sm:h-[15px] w-auto"
    viewBox="0 0 85 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clipPath="url(#clip0_23380_76849)">
      <path
        d="M74.2949 13.5804V1.23305H76.4047V2.81543C77.1001 1.61666 78.5625 0.873413 80.2168 0.873413C82.9261 0.873413 84.8921 2.31195 84.8921 6.02815V13.5804H82.7343V6.33984C82.7343 4.03818 81.6074 2.91133 79.7374 2.91133C77.6275 2.91133 76.4527 4.34986 76.4527 6.41176V13.5804H74.2949Z"
        fill="#7132F5"
      />
      <path
        d="M66.8625 13.9401C63.0504 13.9401 60.6289 11.3747 60.6289 7.3468C60.6289 3.48674 63.0983 0.873413 66.6707 0.873413C70.2191 0.873413 72.7125 3.27097 72.7125 6.69947C72.7125 7.68247 72.7125 7.89825 72.6646 8.11402H62.8825C63.0264 10.5355 64.5369 12.0221 66.8864 12.0221C68.5408 12.0221 69.6916 11.3027 70.2671 9.98412H72.4967C71.8494 12.4536 69.7635 13.9401 66.8625 13.9401ZM62.8825 6.33984H70.4349C70.3389 4.13408 68.9004 2.76748 66.6707 2.76748C64.5369 2.76748 63.1223 4.08614 62.8825 6.33984Z"
        fill="#7132F5"
      />
      <path
        d="M41.6222 13.9401C39.1288 13.9401 37.3066 12.5975 37.3066 10.2718C37.3066 7.9462 38.961 6.89127 40.903 6.53164L43.9239 5.95623C44.9548 5.76442 45.5542 5.50069 45.5542 4.56565C45.5542 3.48674 44.6431 2.76748 42.821 2.76748C41.3345 2.76748 40.0398 3.36687 39.872 4.73347H37.6423C37.7861 2.31195 39.9918 0.873413 42.8449 0.873413C46.2974 0.873413 47.712 2.59966 47.712 4.63757V10.9671C47.712 11.5425 47.9758 11.8303 48.4552 11.8303C48.8628 11.8303 49.1026 11.7343 49.3184 11.5905V13.3407C48.9827 13.6284 48.4073 13.8202 47.712 13.8202C46.705 13.8202 45.8419 13.1729 45.6261 12.1179C45.0507 12.9331 43.8519 13.9401 41.6222 13.9401ZM39.5364 10.1999C39.5364 11.4467 40.5912 12.046 42.0058 12.046C43.9958 12.046 45.5542 10.9191 45.5542 9.16895V7.17898C45.3145 7.44271 44.5712 7.65849 43.6841 7.82632L41.6702 8.20992C40.2316 8.47365 39.5364 9.09702 39.5364 10.1999Z"
        fill="#7132F5"
      />
      <path
        d="M30.8242 13.5804V1.23297H32.934V3.29487C33.5334 1.83236 34.6123 0.969238 36.3146 0.969238C36.6743 0.969238 37.0339 1.04117 37.2257 1.08912V3.29487C37.0339 3.24691 36.6263 3.17499 36.2187 3.17499C34.1088 3.17499 32.982 4.8293 32.982 7.46661V13.5804H30.8242Z"
        fill="#7132F5"
      />
      <path
        d="M27.0403 1.23303H29.8215L24.8346 6.12404L30.0852 13.5804H27.5677L23.372 7.61053L21.3102 9.57652V13.5804H19.1523V1.23303H21.3102V6.89126L27.0403 1.23303Z"
        fill="#7132F5"
      />
      <path
        d="M58.2044 1.23303H60.9855L55.9986 6.12404L61.2492 13.5804H58.7318L54.5361 7.61053L52.4742 9.57652V13.5804H50.3164V1.23303H52.4742V6.89126L58.2044 1.23303Z"
        fill="#7132F5"
      />
      <path
        d="M8.27527 0.873413C3.74147 0.873413 0.0664062 4.59667 0.0664062 9.18946V12.7532C0.0664062 13.4088 0.590867 13.9398 1.23828 13.9398C1.88569 13.9398 2.41399 13.4088 2.41399 12.7532V9.18946C2.41399 8.53196 2.93653 8.0009 3.58586 8.0009C4.23327 8.0009 4.75773 8.53196 4.75773 9.18946V12.7532C4.75773 13.4088 5.28219 13.9398 5.92961 13.9398C6.57894 13.9398 7.10339 13.4088 7.10339 12.7532V9.18946C7.10339 8.53196 7.62785 8.0009 8.27527 8.0009C8.9246 8.0009 9.45098 8.53196 9.45098 9.18946V12.7532C9.45098 13.4088 9.97542 13.9398 10.6229 13.9398C11.2702 13.9398 11.7948 13.4088 11.7948 12.7532V9.18946C11.7948 8.53196 12.3192 8.0009 12.9704 8.0009C13.6178 8.0009 14.1423 8.53196 14.1423 9.18946V12.7532C14.1423 13.4088 14.6667 13.9398 15.3161 13.9398C15.9635 13.9398 16.4879 13.4088 16.4879 12.7532V9.18946C16.4879 4.59667 12.811 0.873413 8.27527 0.873413Z"
        fill="#7132F5"
      />
    </g>
    <defs>
      <clipPath id="clip0_23380_76849">
        <rect
          width="84.9333"
          height="14"
          fill="white"
          transform="translate(0.0664062 0.5)"
        />
      </clipPath>
    </defs>
  </svg>
)

export function LcapBanner() {
  return (
    <>
      <div className="w-full relative overflow-hidden">
        <style>{`
          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-10px);
            }
          }

          .lcap-logo {
            filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.15))
                    drop-shadow(0 0 40px rgba(255, 255, 255, 0.1));
          }

          @media (min-width: 1024px) {
            .lcap-logo {
              animation: float 6s ease-in-out infinite;
            }
          }
        `}</style>
        <div className="rounded-4xl border sm:border-0 mx-1 sm:bg-secondary p-1 flex flex-row  gap-1">
          <div
            style={{ backgroundImage: `url(${lcapBg})` }}
            className="sm:rounded-4xl bg-cover bg-center relative text-white text-sm bg-no-repeat w-[404px] h-[404px] hidden md:flex items-center justify-center "
          >
            <div className="absolute top-6 left-6">$LCAP</div>
            <div className="absolute top-6 right-6">Now trading</div>
            <div className="absolute bottom-6 left-6">By CF Benchmarks</div>
            <div className="absolute bottom-6 right-6 flex items-center gap-1.5">
              a <img src={krakenLogoWhite} height={'11px'} width="60px" />{' '}
              company
            </div>
            <div className="lcap-logo flex-shrink-0">
              <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 lg:w-[180px] lg:h-[180px] relative">
                <img
                  src={lcapLogo}
                  alt="LCAP Token"
                  className="object-contain w-full h-full"
                />
              </div>
            </div>
          </div>

          <div className="sm:bg-card flex-grow rounded-4xl flex flex-col p-2 sm:p-6 justify-center">
            <div className="flex items-center gap-2 md:mb-auto bg-[#FFBE45] rounded-full w-fit px-3 py-2 mb-10">
              <Sparkle size={16} />
              <span className="text-sm">
                New <span className="hidden sm:inline">release</span>
              </span>
            </div>
            <h4 className="text-sm sm:text-xl mb-3 sm:mb-6">
              Introducing $LCAP
            </h4>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl  text-primary animate-fade-in mb-2 sm:mb-8">
              Broad market exposure
              <br />
              in a single token
            </h1>
            <div className="flex items-center flex-row flex-wrap-reverse  gap-2 ">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto rounded-2xl "
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

              <div className="flex items-center justify-center sm:ml-auto mb-4 sm:mb-0">
                <a
                  href="https://www.kraken.com/prices/cf-large-cap-index"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 sm:gap-2 text-sm transition-all cursor-pointer group"
                >
                  <span>also available on</span>
                  <KrakenLogo />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default LcapBanner
