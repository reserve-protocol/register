import FacadeRead from 'abis/FacadeRead'
import RToken from 'abis/RToken'
import { Atom, atom } from 'jotai'
import { wagmiConfig } from 'state/chain'
import { chainIdAtom, rTokenListAtom } from 'state/chain/atoms/chainAtoms'
import { ReserveToken, Token } from 'types'
import { getTokenReadCalls } from 'utils'
import { FACADE_ADDRESS } from 'utils/addresses'
import { atomWithLoadable } from 'utils/atoms/utils'
import { collateralDisplay } from 'utils/constants'
import { collateralsProtocolMap } from 'utils/plugins'
import { Address, formatEther, hexToString } from 'viem'
import { readContracts } from 'wagmi/actions'
import { base } from 'wagmi/chains'

// RToken meta, pulled directly from the listed list or validated for unlisted tokens
// Tokens without "logo" are unlisted
export interface RTokenMeta extends Token {
  chain: number // source of truth for token context current chain
  logo?: string
}

export const rTokenMetaAtom = atom<RTokenMeta | null>(null)

// Current selected rToken address
export const selectedRTokenAtom = atom<Address | null>((get) => {
  return get(rTokenMetaAtom)?.address ?? null
})

const rTokenAtom: Atom<ReserveToken | null> = atomWithLoadable(
  async (get): Promise<ReserveToken | null> => {
    const rTokenAddress = get(selectedRTokenAtom)
    const chainId = get(chainIdAtom)
    const rtokens = get(rTokenListAtom)

    if (!rTokenAddress) {
      return null
    }

    const facadeCallParams = {
      abi: FacadeRead,
      address: FACADE_ADDRESS[chainId] as Address,
      args: [rTokenAddress],
    }
    const rTokenCallParams = {
      abi: RToken,
      address: rTokenAddress,
      args: [],
    }

    const logo = rtokens[rTokenAddress]?.logo
      ? `/svgs/${rtokens[rTokenAddress].logo?.toLowerCase()}`
      : '/svgs/defaultLogo.svg'

    const rTokenMetaCalls = [
      ...getTokenReadCalls(rTokenAddress),
      { ...rTokenCallParams, functionName: 'main' },
      { ...rTokenCallParams, functionName: 'mandate' },
      { ...rTokenCallParams, functionName: 'totalSupply' },
      { ...rTokenCallParams, functionName: 'basketsNeeded' },
      {
        ...facadeCallParams,
        functionName: 'basketTokens',
      },
      {
        ...facadeCallParams,
        functionName: 'stToken',
      },
      {
        ...facadeCallParams,
        functionName: 'basketBreakdown',
      },
    ].map((call) => ({ ...call, chainId }))

    const [
      name,
      symbol,
      decimals,
      mainAddress,
      mandate,
      totalSupply,
      basketsNeededRaw,
      basket,
      stTokenAddress,
      [, , targets],
    ] = await (<
      Promise<
        [
          string,
          string,
          number,
          Address,
          string,
          string,
          bigint,
          Address[],
          Address,
          Address[][],
        ]
      >
    >readContracts(wagmiConfig, {
      contracts: rTokenMetaCalls,
      allowFailure: false,
    }))

    const tokensMetaCall = [
      ...getTokenReadCalls(stTokenAddress),
      ...basket.reduce(
        (calls, collateral) => [...calls, ...getTokenReadCalls(collateral)],
        [] as any[]
      ),
    ].map((call) => ({ ...call, chainId }))

    const tokensMeta = await (<Promise<string[]>>readContracts(wagmiConfig, {
      contracts: tokensMetaCall,
      allowFailure: false,
    }))

    const tokens: Token[] = [stTokenAddress, ...basket].reduce(
      (tokens, address) => {
        const [name, symbol, decimals] = tokensMeta.splice(0, 3)

        tokens.push({
          address,
          name,
          symbol,
          decimals: Number(decimals),
        })

        return tokens
      },
      [] as Token[]
    )

    // TODO: Refactor
    const supply = Number(formatEther(BigInt(totalSupply)))
    const basketsNeeded = Number(formatEther(BigInt(basketsNeededRaw)))
    const targetUnits = [
      ...new Set(targets.map((t) => hexToString(t, { size: 32 }))),
    ].join('')

    return {
      address: rTokenAddress,
      name,
      symbol,
      decimals,
      logo,
      main: mainAddress,
      mandate,
      stToken: tokens.shift() as Token,
      collaterals: tokens.map((t) => {
        let symbol = t.symbol

        // TODO: Temporal until usdbc plugin is removed
        if (
          t.address === '0xa8d818C719c1034E731Feba2088F4F011D44ACB3' ||
          t.address === '0xbC0033679AEf41Fb9FeB553Fdf55a8Bb2fC5B29e'
        ) {
          symbol = 'wcusdbcv3'
        }

        const displayName =
          collateralDisplay[symbol.toLowerCase().replace('-vault', '')] ||
          symbol

        return {
          ...t,
          protocol: collateralsProtocolMap[chainId]?.[t.symbol] || 'GENERIC',
          symbol,
          displayName,
        }
      }),
      listed: !!rtokens[rTokenAddress],
      chainId,
      supply,
      basketsNeeded,
      targetUnits,
    }
  }
)

export default rTokenAtom
