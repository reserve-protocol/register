import React, { ReactNode, SVGProps } from 'react'
import { ChainId } from 'utils/chains'
import Base from './logos/Base'
import Ethereum from './logos/Ethereum'

export const chainIcons: Record<number | string, any> = {
  [ChainId.Mainnet]: Ethereum,
  [ChainId.Base]: Base,
  [ChainId.Hardhat]: Ethereum,
  Ethereum: Ethereum,
  Base: Base,
}

interface Props extends SVGProps<SVGSVGElement> {
  chain: number | string
}

const ChainLogo = ({ chain, ...props }: Props) => {
  const Icon = chainIcons[chain]

  return Icon ? <Icon {...props} /> : <></>
}

export default React.memo(ChainLogo)
