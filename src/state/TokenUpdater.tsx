import { Web3Provider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'
import { ERC20Interface } from 'abis'
import useBlockNumber from 'hooks/useBlockNumber'
import { useFacadeContract } from 'hooks/useContract'
import { atom, useAtom } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ContractCall, ReserveToken, Token } from 'types'
import { isAddress } from 'utils'
import RSV from 'utils/rsv'
import { reserveTokensAtom, selectedRTokenAtom } from './atoms'
import { promiseMulticall } from './web3/lib/multicall'
import { error } from './web3/lib/notifications'

const getTokensMeta = async (
  addresses: string[],
  provider: Web3Provider,
  blockNumber: number
): Promise<Token[]> => {
  const calls = addresses.reduce((acc, address) => {
    const params = { abi: ERC20Interface, address, args: [] }

    return [
      ...acc,
      {
        ...params,
        method: 'name',
      },
      {
        ...params,
        method: 'symbol',
      },
      {
        ...params,
        method: 'decimals',
      },
    ]
  }, [] as ContractCall[])

  const results = await promiseMulticall(calls, provider, blockNumber)

  const result = addresses.reduce((tokens, address) => {
    const [name, symbol, decimals] = results.splice(0, 3)

    tokens.push({
      address,
      name,
      symbol,
      decimals,
    })

    return tokens
  }, [] as Token[])

  return result
}

const updateTokenAtom = atom(null, (get, set, data: ReserveToken) => {
  const tokens = get(reserveTokensAtom)
  set(reserveTokensAtom, { ...tokens, [data.address]: data })
})

// Try to grab the token meta from theGraph
// If it fails, get it from the blockchain (only whitelisted tokens)
const ReserveTokenUpdater = () => {
  const [selectedAddress, setSelectedToken] = useAtom(selectedRTokenAtom)
  const updateToken = useUpdateAtom(updateTokenAtom)
  const facadeContract = useFacadeContract()
  const [searchParams] = useSearchParams()
  const { provider } = useWeb3React()
  const blockNumber = useBlockNumber()

  const getTokenMeta = useCallback(
    async (address: string) => {
      const isRSV = address === RSV.address

      if (isRSV) {
        return updateToken(RSV)
      }

      try {
        if (facadeContract && blockNumber) {
          const [basket, stTokenAddress] = await Promise.all([
            facadeContract.basketTokens(selectedAddress),
            facadeContract.stToken(selectedAddress),
          ])

          const [rToken, stToken, ...collaterals] = await getTokensMeta(
            [selectedAddress, stTokenAddress, ...basket],
            provider as Web3Provider,
            blockNumber
          )

          return updateToken({
            ...rToken,
            stToken,
            collaterals,
          })
        }
      } catch (e) {
        error('Network Error', 'Error fetching token information')
        console.log('Error fetching token meta', e)
      }
    },
    [selectedAddress, provider]
  )

  useEffect(() => {
    const token = isAddress(searchParams.get('token') ?? '')

    if (token) {
      setSelectedToken(token)
    }
  }, [])

  useEffect(() => {
    if (selectedAddress) {
      getTokenMeta(selectedAddress)
    }
  }, [selectedAddress, getTokenMeta])

  return null
}

export default ReserveTokenUpdater
