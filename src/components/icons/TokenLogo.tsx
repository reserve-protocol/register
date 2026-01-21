import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import React from 'react'
import { rTokenMetaAtom } from 'state/rtoken/atoms/rTokenAtom'
import { cn } from '@/lib/utils'
import ChainLogo from './ChainLogo'

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  symbol?: string
  width?: number | string
  src?: string
  chain?: number
  bordered?: boolean
}

export const SVGS = new Set([
  'dai',
  'cdai',
  'rsr',
  'strsr',
  'rsv',
  'tusd',
  'usdt',
  'cusdt',
  'usdc',
  'cusdc',
  'usdbc',
  'usdp',
  'wsgusdbc',
  'wcusdcv3',
  'wcusdtv3',
  'wcusdbcv3',
  'wbtc',
  'cwbtc',
  'ceth',
  'eth',
  'busd',
  'weth',
  'sadai',
  'sausdc',
  'sabasusdbc',
  'sausdt',
  'eurt',
  'fusdc',
  'fusdt',
  'fdai',
  'wcUSDCv3',
  'wsteth',
  'cbeth',
  'meusd',
  'reth',
  'stkcvx3crv',
  'stkcvxcrv3crypto',
  'stkcvxeusd3crv-f',
  'stkcvxeth+eth',
  'stkcvxeth+eth-f',
  'stkcvxmim-3lp3crv-f',
  'sdai',
  'mrp-ausdt',
  'mrp-ausdc',
  'mrp-adai',
  'mrp-awbtc',
  'mrp-aweth',
  'mrp-awteth',
  'mrp-asteth',
  'frax',
  'crvusd',
  'mkusd',
  'eusd',
  're7weth',
  'saethusdc',
  'saethpyusd',
  'pyusd',
  'sabasusdc',
  'saarbusdcn',
  'sfrxeth',
  'usd+',
  'usds',
  'pxeth',
  'apxeth',
  'susde',
  'susds',
  'sdt',
  'wusdm',
  'eth+',
  'wsamm-eusd/usdc',
  'wvamm-weth-degen',
  'wvamm-weth-well',
  'wvamm-weth-cbbtc',
  'oeth',
  'woeth',
  'saethusdt',
  'saethrlusd',
])

const PNGS = new Set([
  'steakusdc',
  'mai',
  'dola',
  'fxusd',
  'alusd',
  'ethx',
  'wvamm-weth-aero',
  'wvamm-mog-weth',
  'wsuperoethb',
  'superoethb',
])

// Memoized token image
const TokenImage = React.memo(
  ({
    src = '/svgs/defaultLogo.svg',
    width = 20,
  }: {
    src?: string
    width?: number | string
  }) => {
    return (
      <img
        src={src}
        className="h-auto"
        style={{ width }}
        onError={({ currentTarget }) => {
          currentTarget.onerror = null // prevents looping
          currentTarget.src = '/svgs/defaultLogo.svg'
        }}
      />
    )
  }
)

const TokenLogo = ({
  symbol,
  src,
  chain,
  width = 20,
  bordered = false,
  className,
  style,
  ...props
}: Props) => {
  let imgSrc = src
  const rToken = useRToken()
  let tokenSymbol = symbol

  if (tokenSymbol?.endsWith('-VAULT')) {
    tokenSymbol = tokenSymbol.replace('-VAULT', '')
  }

  if (tokenSymbol?.includes('/')) {
    tokenSymbol = tokenSymbol.replaceAll('/', '-')
  }

  if (!imgSrc) {
    if (rToken?.symbol === symbol) {
      imgSrc = rToken?.logo
    } else if (tokenSymbol && SVGS.has(tokenSymbol.toLowerCase())) {
      imgSrc = `/svgs/${tokenSymbol.toLowerCase()}.svg`
    } else if (tokenSymbol && PNGS.has(tokenSymbol.toLowerCase())) {
      imgSrc = `/imgs/${tokenSymbol.toLowerCase()}.png`
    }
  }

  return (
    <div
      {...props}
      className={cn(
        'relative flex items-center justify-center rounded-full overflow-hidden shrink-0',
        bordered && 'border border-foreground',
        className
      )}
      style={{ width, height: width, ...style }}
    >
      <TokenImage src={imgSrc} width={width} />

      {!!chain && (
        <div
          className="absolute shrink-0"
          style={{
            right: '-3px',
            bottom: '-10px',
            width: Number(width) / 2,
          }}
        >
          <ChainLogo
            chain={chain}
            width={Number(width) / 2}
            height={Number(width) / 2}
          />
        </div>
      )}
    </div>
  )
}

interface TCurrentRTokenLogo extends React.HTMLAttributes<HTMLDivElement> {
  width?: number
}

export const CurrentRTokenLogo = ({
  width = 20,
  className,
  ...props
}: TCurrentRTokenLogo) => {
  const rToken = useAtomValue(rTokenMetaAtom)

  return (
    <div className={cn('flex items-center', className)} {...props}>
      <TokenImage src={rToken?.logo} width={width} />
    </div>
  )
}

export default TokenLogo
