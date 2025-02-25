import React, { ReactNode, SVGProps } from 'react'
import { ChainId } from 'utils/chains'
import Base from './logos/Base'
import Ethereum from './logos/Ethereum'
import Arbitrum from './logos/Arbitrum'
import Solana from './logos/Solana'

export const chainIcons: Record<number | string, any> = {
  [ChainId.Mainnet]: Ethereum,
  [ChainId.Base]: Base,
  [ChainId.Arbitrum]: Arbitrum,
  Ethereum: Ethereum,
  Base: Base,
  Solana: Solana,
}

interface Props extends SVGProps<SVGSVGElement> {
  chain: number | string
}

const ChainLogo = ({ chain, ...props }: Props) => {
  const Icon = chainIcons[chain]

  return Icon ? <Icon {...props} /> : <></>
}

export default React.memo(ChainLogo)
