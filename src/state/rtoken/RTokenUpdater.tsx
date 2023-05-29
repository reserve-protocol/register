import { Web3Provider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'
import { ERC20Interface, FacadeInterface, RTokenInterface } from 'abis'
import useIsWindowVisible from 'hooks/useIsWindowVisible'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useResetAtom } from 'jotai/utils'
import { useCallback, useEffect, useState } from 'react'
import { reserveTokensAtom, selectedRTokenAtom } from 'state/atoms'
import {
  rTokenAtom,
  rTokenRevenueSplitAtom,
  rTokenContractsAtom,
  rTokenAssetsAtom,
  rTokenConfigurationAtom,
} from 'state/atoms/rTokenAsyncAtoms'
import { promiseMulticall } from 'state/web3/lib/multicall'
import { error } from 'state/web3/lib/notifications'
import { ContractCall, ReserveToken, Token } from 'types'
import { FACADE_ADDRESS } from 'utils/addresses'
import { CHAIN_ID } from 'utils/chains'
import RSV from 'utils/rsv'
import rtokens from 'utils/rtokens'

/**
 * Fetch a list of tokens metadata from the blockchain
 */
const getRTokenMeta = async (
  addresses: string[],
  provider: Web3Provider
): Promise<{ tokens: Token[]; main: string; mandate: string }> => {
  const calls = addresses.reduce((acc, address) => {
    const callParams = { abi: ERC20Interface, address, args: [] }

    return [
      ...acc,
      {
        ...callParams,
        method: 'name',
      },
      {
        ...callParams,
        method: 'symbol',
      },
      {
        ...callParams,
        method: 'decimals',
      },
    ]
  }, [] as ContractCall[])

  calls.unshift(
    {
      abi: RTokenInterface,
      address: addresses[0],
      args: [],
      method: 'main',
    },
    {
      abi: RTokenInterface,
      address: addresses[0],
      args: [],
      method: 'mandate',
    }
  )

  const multicallResult = await promiseMulticall(calls, provider)
  const main = multicallResult.shift()
  const mandate = multicallResult.shift()

  const tokens = addresses.reduce((tokens, address) => {
    const [name, symbol, decimals] = multicallResult.splice(0, 3)

    tokens.push({
      address,
      name,
      symbol,
      decimals,
    })

    return tokens
  }, [] as Token[])

  return {
    tokens,
    main,
    mandate,
  }
}

/**
 * Update specific token meta
 */
const updateTokenAtom = atom(null, (get, set, data: ReserveToken) => {
  const tokens = get(reserveTokensAtom)
  set(reserveTokensAtom, { ...tokens, [data.address]: data })
})

/**
 * Listen for current selected RToken and fetch required metadata
 *
 * TODO: Maybe a good idea to add a way to refresh this data?
 * TODO: Expose loading flag?
 */
const RTokenUpdater = () => {
  const rTokenAddress = useAtomValue(selectedRTokenAtom)
  const updateToken = useSetAtom(updateTokenAtom)
  const windowVisible = useIsWindowVisible()
  const { provider, chainId } = useWeb3React()
  const [fetching, setFetching] = useState('') // use rTokenAddress to know if they change token fast
  const contracts = useAtomValue(rTokenConfigurationAtom)

  console.log('data', { contracts })

  const getTokenMeta = useCallback(
    async (address: string, provider: Web3Provider) => {
      const isRSV = address === RSV.address

      if (isRSV) {
        updateToken({ ...RSV, meta: rtokens[address] })
        return
      }

      setFetching(rTokenAddress)

      try {
        const callParams = {
          abi: FacadeInterface,
          address: FACADE_ADDRESS[CHAIN_ID],
          args: [address],
        }

        const [basket, stTokenAddress] = await promiseMulticall(
          [
            {
              ...callParams,
              method: 'basketTokens',
            },
            {
              ...callParams,
              method: 'stToken',
            },
          ],
          provider
        )

        const {
          main,
          mandate,
          tokens: [rToken, stToken, ...collaterals],
        } = await getRTokenMeta([address, stTokenAddress, ...basket], provider)

        const logo = rtokens[address]?.logo
          ? require(`@lc-labs/rtokens/images/${rtokens[address].logo}`)
          : '/svgs/default.svg'

        updateToken({
          ...rToken,
          stToken,
          collaterals,
          main,
          logo,
          mandate,
          unlisted: !rtokens[rToken.address],
          meta: rtokens[rToken.address],
        })
      } catch (e) {
        console.error('Error fetching token info', e)
        if (windowVisible) {
          error('Network Error', 'Error fetching token information')
        }
      }

      setFetching('')
    },
    [windowVisible]
  )

  useEffect(() => {
    if (
      rTokenAddress &&
      provider &&
      chainId === CHAIN_ID &&
      fetching !== rTokenAddress
    ) {
      getTokenMeta(rTokenAddress, provider)
    }
  }, [provider, rTokenAddress, chainId])

  return null
}

export default RTokenUpdater
