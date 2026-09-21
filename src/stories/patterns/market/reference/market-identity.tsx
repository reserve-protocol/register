import TokenLogo from '@/components/token-logo'
import {
  ChainBadgedLogo,
  type ChainBadgedLogoProps,
} from '@/components/entity-identity/chain-badged-logo'
import { EntityIdentity } from '@/components/entity-identity/entity-identity'
import {
  TokenLogoStack,
  type TokenLogoStackProps,
} from '@/components/entity-identity/token-logo-stack'
import {
  TokenStackTrigger,
  type TokenStackTriggerProps,
} from '@/components/entity-identity/token-stack-trigger'
import { forwardRef, type ComponentProps } from 'react'
import {
  MARKET_EXCHANGE_LOGOS,
  MARKET_LOGO_BY_ADDRESS,
} from './market-logo-assets'

export const marketLogoSrc = (
  symbol?: string,
  src?: string,
  address?: string
) => {
  if (src?.startsWith('/') || src?.startsWith('data:')) return src
  const addressLogo = address && MARKET_LOGO_BY_ADDRESS[address.toLowerCase()]
  if (addressLogo) return addressLogo
  const normalized = symbol?.toLowerCase().replace(/-vault$/, '')
  const dedicated: Record<string, string> = {
    cbbtc: '/imgs/cbbtc.png',
    cmc20: '/imgs/cmc20.png',
    fxs: '/svgs/fxs.svg',
    glwon: '/imgs/glwon.png',
    hype: '/svgs/hype.svg',
    lcap: '/imgs/socials/lcap.png',
    'moomorpho-steakhouse-usdc': '/imgs/moomorpho-steakhouse-usdc.png',
    'moomorpho-steakhouse-weth': '/imgs/moomorpho-steakhouse-weth.png',
    photon:
      MARKET_LOGO_BY_ADDRESS['0xa0fe4e0aeca5479705ce996615b2eacb6b6a10fb'],
    tsemon: '/imgs/tsemon.png',
    uxlm: '/svgs/xlm.svg',
    zindex: '/imgs/socials/zindex.png',
    vlrsr: '/svgs/vlrsr.svg',
  }
  if (normalized && dedicated[normalized]) return dedicated[normalized]
  const localSymbols = new Set([
    'aave',
    'cbeth',
    'crv',
    'dai',
    'eth',
    'eusd',
    'rsr',
    'sdai',
    'usdc',
    'usdt',
    'wbtc',
    'weth',
    'wsteth',
  ])
  return normalized && localSymbols.has(normalized)
    ? `/svgs/${normalized}.svg`
    : '/svgs/defaultLogo.svg'
}

type MarketTokenLogoProps = ComponentProps<typeof TokenLogo>

export const MarketTokenLogo = forwardRef<
  HTMLImageElement,
  MarketTokenLogoProps
>(({ symbol, src, address, ...props }, ref) => (
  <TokenLogo
    {...props}
    ref={ref}
    symbol={symbol}
    address={address}
    src={marketLogoSrc(symbol, src, address)}
  />
))

MarketTokenLogo.displayName = 'MarketTokenLogo'

export const MarketChainBadgedLogo = forwardRef<
  HTMLSpanElement,
  ChainBadgedLogoProps
>(({ symbol, src, address, ...props }, ref) => (
  <ChainBadgedLogo
    {...props}
    ref={ref}
    symbol={symbol}
    address={address}
    src={marketLogoSrc(symbol, src, address)}
  />
))

MarketChainBadgedLogo.displayName = 'MarketChainBadgedLogo'

const localTokens = (tokens: TokenLogoStackProps['tokens']) =>
  tokens.map((token) => ({
    ...token,
    logo: marketLogoSrc(token.symbol, token.logo, token.address),
  }))

export const MarketTokenLogoStack = forwardRef<
  HTMLSpanElement,
  TokenLogoStackProps
>(({ tokens, ...props }, ref) => (
  <TokenLogoStack {...props} ref={ref} tokens={localTokens(tokens)} />
))

MarketTokenLogoStack.displayName = 'MarketTokenLogoStack'

export const MarketTokenStackTrigger = forwardRef<
  HTMLButtonElement,
  TokenStackTriggerProps
>(({ tokens, ...props }, ref) => (
  <TokenStackTrigger {...props} ref={ref} tokens={localTokens(tokens)} />
))

MarketTokenStackTrigger.displayName = 'MarketTokenStackTrigger'

export const marketExchangeLogo = (exchange: string) =>
  MARKET_EXCHANGE_LOGOS[
    exchange.toLowerCase() as keyof typeof MARKET_EXCHANGE_LOGOS
  ]

export { EntityIdentity }
