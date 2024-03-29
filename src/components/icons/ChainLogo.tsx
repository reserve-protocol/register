import React, { SVGProps } from 'react'
import { ChainId } from 'utils/chains'
import Base from './logos/Base'
import Ethereum from './logos/Ethereum'

export const chainIcons = {
  [ChainId.Mainnet]: Ethereum,
  [ChainId.Base]: Base,
  [ChainId.Hardhat]: Ethereum,
}

interface Props extends SVGProps<SVGSVGElement> {
  chain: number
}

const ChainLogo = ({ chain, ...props }: Props) => {
  const Icon = chainIcons[chain]

  return Icon ? <Icon {...props} /> : <></>
}

export default React.memo(ChainLogo)
