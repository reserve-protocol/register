import FacadeRead from 'abis/FacadeRead'
import RToken from 'abis/RToken'
import { Atom, atom } from 'jotai'
import { chainIdAtom } from 'state/atoms/chainAtoms'
import { Token } from 'types'
import { getTokenReadCalls, isAddress } from 'utils'
import { FACADE_ADDRESS } from 'utils/addresses'
import { atomWithLoadable } from 'utils/atoms/utils'
import RSV from 'utils/rsv'
import rtokens from 'utils/rtokens'
import { Address } from 'wagmi'
import { readContracts } from 'wagmi/actions'

interface RToken extends Token {
  logo: string
  collaterals: Token[]
  stToken?: Token
  main?: Address
  mandate?: string
  listed?: boolean
}
// Current selected rToken address
export const selectedRTokenAtom = atom(
  isAddress(
    new URL(window.location.href.replace('/#/', '/')).searchParams.get(
      'token'
    ) ?? ''
  )
)

const rTokenAtom: Atom<RToken | null> = atomWithLoadable(
  async (get): Promise<RToken | null> => {
    const rTokenAddress = get(selectedRTokenAtom)
    const chainId = get(chainIdAtom)

    if (!rTokenAddress) {
      return null
    }

    if (rTokenAddress === RSV.address) {
      return RSV as RToken
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
    ] = await (<
      Promise<[string, string, number, Address, string, Address[], Address]>
    >readContracts({
      contracts: [
        ...getTokenReadCalls(rTokenAddress),
        { ...rTokenCallParams, functionName: 'main' },
        { ...rTokenCallParams, functionName: 'mandate' },
        {
          ...facadeCallParams,
          functionName: 'basketTokens',
        },
        {
          ...facadeCallParams,
          functionName: 'stToken',
        },
      ],
      allowFailure: false,
    }))

    const tokensMeta = await (<Promise<string[]>>readContracts({
      contracts: [
        ...getTokenReadCalls(stTokenAddress),
        ...basket.reduce(
          (calls, collateral) => [...calls, ...getTokenReadCalls(collateral)],
          [] as any[]
        ),
      ],
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
