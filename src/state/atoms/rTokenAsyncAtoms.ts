import { FacadeInterface, MainInterface, RTokenInterface } from 'abis'
import { Atom, Getter, atom } from 'jotai'
import { loadable } from 'jotai/utils'
import { promiseMulticall } from 'state/web3/lib/multicall'
import { ContractCall, RTokenMeta, Token } from 'types'
import { getTokenMetaCalls } from 'utils'
import { FACADE_ADDRESS } from 'utils/addresses'
import { simplifyLoadable } from 'utils/atoms/utils'
import RSV from 'utils/rsv'
import rtokens from 'utils/rtokens'
import { getValidWeb3Atom } from './chainAtoms'
import { selectedRTokenAtom } from './rTokenAtoms'

const isRSV = (address: string) => address === RSV.address

const rTokenCacheAtom = atom({ fetched: '', chain: 0 })

interface RToken {
  token: Token
  stToken: Token
  contracts: { [x: string]: string }
  logo?: string
  meta?: RTokenMeta
}

// Atoms and calls are grouped in the most optimal way to combine calls
// The order of the functions is also the expected fetching order
export const rTokenAtom = atomWithLoadable(async (get) => {
  const rTokenAddress = get(selectedRTokenAtom)
  const { provider, chainId } = get(getValidWeb3Atom)

  if (!provider || !rTokenAddress) {
    return null
  }

  if (isRSV(rTokenAddress)) {
    return {
      ...RSV,
      meta: rtokens[rTokenAddress],
    }
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
    ? require(`@lc-labs/rtokens/images/${rtokens[rTokenAddress].logo}`)
    : '/svgs/default.svg'

  const [name, symbol, decimals, mainAddress, mandate, basket, stTokenAddress] =
    await promiseMulticall(
      [
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
      ],
      provider
    )

  return {
    address: rTokenAddress,
    name,
    symbol,
    decimals,
    logo,
    main: mainAddress,
    mandate,
    basket,
    stToken: stTokenAddress,
  }
})

const getMainCalls = (address: string, methods: string[]): ContractCall[] =>
  methods.map((method) => ({ abi: MainInterface, address, args: [], method }))

export const rTokenContractsAtom = simplifyLoadable(
  loadable(
    atom(async (get) => {
      const rToken = get(rTokenAtom)
      const { provider } = get(getValidWeb3Atom)

      if (!rToken?.main || !provider) {
        return null
      }

      const [
        distributor,
        backingManager,
        rTokenTrader,
        rsrTrader,
        furnace,
        broker,
        assetRegistry,
        basketHandler,
      ]: string[] = await promiseMulticall(
        getMainCalls(rToken.main, [
          'distribution',
          'backingManager',
          'rTokenTrader',
          'rsrTrader',
          'furnaceAddress',
          'brokerAddress',
          'assetRegistry',
          'stRSRAddress',
          'shortFreeze',
          'longFreeze',
          'basketHandler',
        ]),
        provider
      )

      return {
        token: rToken.address,
        main: rToken.main,
        stRSR: rToken.stToken,
        backingManager,
        rTokenTrader,
        rsrTrader,
        broker,
        assetRegistry,
        furnace,
        distributor,
        basketHandler,
      }
    })
  )
)

export const rTokenAssetsAtom = simplifyLoadable(loadable(atom((get) => {})))

export function atomWithLoadable<T>(fn: (get: Getter) => T) {
  return simplifyLoadable(loadable(atom(fn)))
}
