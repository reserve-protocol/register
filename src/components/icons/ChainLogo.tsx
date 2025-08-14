import React, { SVGProps } from 'react'
import { ChainId } from 'utils/chains'
import Arbitrum from './logos/Arbitrum'
import Base from './logos/Base'
import BSC from './logos/BSC'
import Ethereum from './logos/Ethereum'

export const chainIcons: Record<number | string, any> = {
  [ChainId.Mainnet]: Ethereum,
  [ChainId.Base]: Base,
  [ChainId.Arbitrum]: Arbitrum,
  [ChainId.BSC]: BSC,
  Ethereum: Ethereum,
  Base: Base,
  Arbitrum: Arbitrum,
  BSC: BSC,
}

interface Props extends SVGProps<SVGSVGElement> {
  chain: number | string
}

const ChainLogo = ({ chain, ...props }: Props) => {
  const Icon = chainIcons[chain]

  return Icon ? <Icon {...props} /> : <></>
}

export default React.memo(ChainLogo)
