import React, { ReactNode, SVGProps } from 'react'
import { ChainId } from '@/utils/chains'
import Base from '@/components/icons/Base'
import Ethereum from '@/components/icons/Ethereum'
import Arbitrum from '@/components/icons/Arbitrum'

export const chainIcons: Record<number | string, any> = {
  [ChainId.Mainnet]: Ethereum,
  [ChainId.Base]: Base,
  [ChainId.Arbitrum]: Arbitrum,
}

interface Props extends SVGProps<SVGSVGElement> {
  chain: number | string
}

const ChainLogo = ({ chain, ...props }: Props) => {
  const Icon = chainIcons[chain]

  return Icon ? <Icon {...props} /> : <></>
}

export default React.memo(ChainLogo)
