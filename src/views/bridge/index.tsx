import ChainLogo from '@/components/icons/ChainLogo'
import CopyValue from '@/components/old/button/CopyValue'
import TokenLogo from '@/components/token-logo'
import StackTokenLogo from '@/components/token-logo/stack-token-logo'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import { shortenAddress } from '@/utils'
import {
  EUSD_ADDRESS,
  RGUSD_ADDRESS,
  RSR_ADDRESS,
  USD3_ADDRESS,
} from '@/utils/addresses'
import { ChainId } from '@/utils/chains'
import {
  ArrowUpRight,
  ArrowUpRightIcon,
  ChevronsUpDown,
  Info,
  OctagonAlert,
} from 'lucide-react'
import bridgeGGLogo from './assets/bridgegg.png'
import SuperbridgeLogo from './assets/superbridge.avif'

const BRIDGE_TOKEN_LIST: {
  [key: string]: { symbol: string; logo: string; l1: string; l2: string }
} = {
  rsr: {
    symbol: 'RSR',
    logo: '/svgs/rsr.svg',
    l1: RSR_ADDRESS[ChainId.Mainnet],
    l2: RSR_ADDRESS[ChainId.Base],
  },
  eusd: {
    symbol: 'eUSD',
    logo: '/svgs/eusd.svg',
    l1: EUSD_ADDRESS[ChainId.Mainnet],
    l2: EUSD_ADDRESS[ChainId.Base],
  },
  usd3: {
    symbol: 'USD3',
    logo: '/svgs/usd3.svg',
    l1: USD3_ADDRESS[ChainId.Mainnet],
    l2: USD3_ADDRESS[ChainId.Base],
  },
  rgusd: {
    symbol: 'rgUSD',
    logo: '/svgs/rgusd.svg',
    l1: RGUSD_ADDRESS[ChainId.Mainnet],
    l2: RGUSD_ADDRESS[ChainId.Base],
  },
}

type Bridge = {
  name: string
  logo: string
  url: string
  listedTokens: string[]
}

const Hero = () => (
  <div className="text-center max-w-4xl">
    <h1 className="font-semibold text-4xl sm:text-5xl lg:text-6xl mb-6">
      Our Bridge Has Been Retired
    </h1>
    <p className=" md:text-base lg:text-xl">
      We recently deprecated our custom bridging software. We built the bridge
      when there were no alternatives - we prefer to reallocate those developer
      resources elsewhere. You can still move assets to and from Base using the
      trusted external bridges listed below.
    </p>
  </div>
)
const Rectangle = () => (
  <svg
    width="20"
    height="2"
    viewBox="0 0 20 2"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="1" cy="1" r="1" fill="black" />
    <line x1="4" y1="1" x2="16" y2="1" stroke="black" strokeWidth="1.5" />
    <circle cx="19" cy="1" r="1" fill="black" />
  </svg>
)

const BridgeCard = ({
  name,
  logo,
  url,
  listedTokens,
  shadow,
}: Bridge & { shadow?: boolean }) => (
  <div
    className="flex items-center bg-card p-6 gap-3 rounded-3xl justify-between"
    style={
      shadow ? { boxShadow: '0 6px 34px 0 rgba(0, 0, 0, 0.05)' } : undefined
    }
  >
    <div className="flex items-center gap-3">
      <img src={logo} alt={name} width={32} height={32} />
      <div className="flex flex-col">
        <h3 className="font-semibold">{name}</h3>
        <a
          className="text-sm text-legend"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {url}
        </a>
      </div>
    </div>
    <div className="items-center gap-2 hidden md:flex">
      <ChainLogo chain={ChainId.Mainnet} height={20} width={20} />
      <Rectangle />
      <StackTokenLogo
        tokens={listedTokens.map((token) => ({
          symbol: BRIDGE_TOKEN_LIST[token].symbol,
          logo: BRIDGE_TOKEN_LIST[token].logo,
          address: BRIDGE_TOKEN_LIST[token].l1,
        }))}
      />
      <Rectangle />
      <ChainLogo chain={ChainId.Base} height={20} width={20} />
    </div>
    <div className="flex items-center gap-2">
      <span className="text-sm text-legend hidden sm:block">Visit {name}</span>
      <a href={url} target="_blank" rel="noopener noreferrer">
        <div className="bg-muted rounded-full p-2">
          <ArrowUpRightIcon className="w-4 h-4" strokeWidth={1.5} />
        </div>
      </a>
    </div>
  </div>
)

const Disclaimer = () => {
  return (
    <div className="flex flex-col gap-4 items-center w-full md:w-[44rem] text-center">
      <div className="border border-foreground rounded-full p-2">
        <OctagonAlert size={16} strokeWidth={1.5} />
      </div>
      <p>
        Bridging involves external providers. Reserve does not control these
        services and cannot guarantee their security or availability. Use at
        your own discretion.
      </p>
    </div>
  )
}

const TokenListHelper = () => {
  return (
    <Collapsible>
      <CollapsibleContent>
        {Object.values(BRIDGE_TOKEN_LIST).map((token) => (
          <div
            key={token.symbol}
            className={cn(
              'grid grid-cols-2 sm:grid-cols-4 gap-2 p-6',
              'border-b'
            )}
          >
            <div className="flex items-center gap-2">
              <TokenLogo src={token.logo} size="xl" />
              <span className="font-semibold">{token.symbol}</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <ChainLogo chain={ChainId.Mainnet} height={20} width={20} />
              <span className="text-sm text-legend">
                {shortenAddress(token.l1)}
              </span>
              <CopyValue value={token.l1} />
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <ChainLogo chain={ChainId.Base} height={20} width={20} />
              <span className="text-sm text-legend">
                {shortenAddress(token.l2)}
              </span>
              <CopyValue value={token.l2} />
            </div>
            <a
              href={`https://superbridge.app/?fromChainId=1&toChainId=8453&tokenAddress=${token.l1}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 justify-end text-legend hover:text-primary"
            >
              <span className="text-sm">Bridge {token.symbol}</span>

              <Button variant="muted" size="icon-rounded">
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </a>
          </div>
        ))}
      </CollapsibleContent>
      <CollapsibleTrigger className="p-4 pl-0 sm:pl-8 pr-6 flex  items-center gap-2 text-sm w-full">
        <Info size={16} strokeWidth={1.5} className="hidden sm:block" />
        <div className="ml-3 mr-auto">
          <span className="font-semibold">Don’t see your token?</span>{' '}
          <span className="text-legend">
            You may need to import it with the token contract address.
          </span>
        </div>
        <div className="flex items-center text-primary gap-1">
          <span className="hidden md:block">View list</span>
          <ChevronsUpDown size={16} strokeWidth={1.5} />
        </div>
      </CollapsibleTrigger>
    </Collapsible>
  )
}

const BridgeList = () => {
  return (
    <div className="flex flex-col w-full md:w-[44rem] gap-4 my-10">
      <div className="bg-background rounded-3xl">
        <BridgeCard
          name="Superbridge"
          logo={SuperbridgeLogo}
          url="https://superbridge.app/"
          listedTokens={Object.keys(BRIDGE_TOKEN_LIST)}
          shadow
        />
        <TokenListHelper />
      </div>
      <BridgeCard
        name="Brid.gg"
        logo={bridgeGGLogo}
        url="https://brid.gg/"
        listedTokens={['rsr']}
      />
    </div>
  )
}

const ChainBridge = () => (
  <div className="container relative h-full">
    <div className="flex flex-col py-16 px-3 sm:px-6  items-center justify-start sm:justify-center gap-2 bg-secondary min-h-full xl:min-h-[calc(100%-24px)] rounded-4xl ">
      <Hero />
      <BridgeList />
      <Disclaimer />
    </div>
  </div>
)

export default ChainBridge
