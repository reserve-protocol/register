import { FacadeInterface, RTokenInterface } from 'abis'
import { Atom, atom } from 'jotai'
import { multicallAtom } from 'state/atoms'
import { chainIdAtom } from 'state/atoms/chainAtoms'
import { ContractCall, Token } from 'types'
import { getTokenMetaCalls } from 'utils'
import { FACADE_ADDRESS } from 'utils/addresses'
import { atomWithLoadable } from 'utils/atoms/utils'
import RSV from 'utils/rsv'
import rtokens from 'utils/rtokens'

interface RToken extends Token {
  logo: string
  collaterals: Token[]
  stToken?: Token
  main?: string
  mandate?: string
  listed?: boolean
}

const isRSV = (address: string) => address === RSV.address

// Current selected rToken address
export const selectedRTokenAtom = atom('')

const rTokenAtom: Atom<RToken | null> = atomWithLoadable(
  async (get): Promise<RToken | null> => {
    const rTokenAddress = get(selectedRTokenAtom)
    const chainId = get(chainIdAtom)
    const multicall = get(multicallAtom)

    if (!multicall || !rTokenAddress) {
      return null
    }

    if (isRSV(rTokenAddress)) {
      return RSV as RToken
    }

    const facadeCallParams = {
      abi: FacadeInterface,
      address: FACADE_ADDRESS[chainId],
      args: [rTokenAddress],
    }
    const rTokenCallParams = {
      abi: RTokenInterface,
      address: rTokenAddress,
      args: [],
    }

    const logo = rtokens[rTokenAddress]?.logo
      ? `/node_modules/@lc-labs/rtokens/images/${rtokens[rTokenAddress].logo}`
      : '/svgs/default.svg'

    const [
      name,
      symbol,
      decimals,
      mainAddress,
      mandate,
      basket,
      stTokenAddress,
    ] = await multicall([
      ...getTokenMetaCalls(rTokenAddress),
      { ...rTokenCallParams, method: 'main' },
      { ...rTokenCallParams, method: 'mandate' },
      {
        ...facadeCallParams,
        method: 'basketTokens',
      },
      {
        ...facadeCallParams,
        method: 'stToken',
      },
    ])

    const tokensMeta = await multicall([
      ...getTokenMetaCalls(stTokenAddress),
      ...(basket as string[]).reduce(
        (calls, collateral) => [...calls, ...getTokenMetaCalls(collateral)],
        [] as ContractCall[]
      ),
    ])

    const tokens: Token[] = [stTokenAddress, ...(basket as string[])].reduce(
      (tokens, address) => {
        const [name, symbol, decimals] = tokensMeta.splice(0, 3)

        tokens.push({
          address,
          name,
          symbol,
          decimals,
        })

        return tokens
      },
      [] as Token[]
    )

    return {
      address: rTokenAddress,
      name,
      symbol,
      decimals,
      logo,
      main: mainAddress,
      mandate,
      stToken: tokens.shift() as Token,
      collaterals: tokens,
      listed: !!rtokens[rTokenAddress],
    }
  }
)

export default rTokenAtom
