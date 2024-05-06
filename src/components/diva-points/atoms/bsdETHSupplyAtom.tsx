import rtokens from '@lc-labs/rtokens'
import RToken from 'abis/RToken'
import { atom } from 'jotai'
import { Token } from 'types'
import { atomWithLoadable } from 'utils/atoms/utils'
import { ChainId } from 'utils/chains'
import { Address, formatEther } from 'viem'
import { getContract } from 'wagmi/actions'

export interface RTokenAsset {
  address: Address
  token: Token
  maxTradeVolume: string
  priceUsd: number
  version: string
}

const DIVA_POINTS_PER_ETH_PER_DAY = [
  { fromSupply: 0, toSupply: 2000, rate: 2.5 },
  { fromSupply: 2000, toSupply: 4000, rate: 2.25 },
  { fromSupply: 4000, toSupply: 6000, rate: 2 },
  { fromSupply: 6000, toSupply: 8000, rate: 1.9 },
  { fromSupply: 8000, toSupply: 10000, rate: 1.75 },
  { fromSupply: 10000, toSupply: 12000, rate: 1.6 },
  { fromSupply: 12000, toSupply: 14000, rate: 1.55 },
  { fromSupply: 14000, toSupply: 16000, rate: 1.5 },
  { fromSupply: 16000, toSupply: 18000, rate: 1.4 },
  { fromSupply: 18000, toSupply: 20000, rate: 1.3 },
]

export const bsdETHSupplyAtom = atomWithLoadable(async () => {
  const baseTokens = rtokens[ChainId.Base]
  const bsdETHAddress = Object.values(baseTokens).filter(
    (token) => token.symbol === 'bsdETH'
  )[0].address

  try {
    const bsdETHContract = getContract({
      address: bsdETHAddress as Address,
      abi: RToken,
      chainId: ChainId.Base,
    })
    const totalSupply = await bsdETHContract.read.totalSupply()
    return +formatEther(totalSupply)
  } catch (e) {
    console.error('Error loading bsdETH supply', e)
    return 0
  }
})

export const currentDivaPointsRate = atom((get) => {
  const bsdETHSupply = get(bsdETHSupplyAtom) ?? 0
  return (
    DIVA_POINTS_PER_ETH_PER_DAY.find(
      (range) =>
        bsdETHSupply >= range.fromSupply && bsdETHSupply < range.toSupply
    )?.rate || 2.5
  )
})
