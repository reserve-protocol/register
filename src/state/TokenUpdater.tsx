import { Web3Provider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'
import { ERC20Interface, MainInterface, RTokenInterface } from 'abis'
import { ethers } from 'ethers'
import useBlockNumber from 'hooks/useBlockNumber'
import { useFacadeContract } from 'hooks/useContract'
import { atom, useAtom, useAtomValue } from 'jotai'
import { useResetAtom, useUpdateAtom } from 'jotai/utils'
import { useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ContractCall, ReserveToken, Token } from 'types'
import { isAddress } from 'utils'
import { RTOKEN_STATUS } from 'utils/constants'
import RSV from 'utils/rsv'
import {
  accountRoleAtom,
  reserveTokensAtom,
  rTokenMainAtom,
  rTokenStatusAtom,
  selectedRTokenAtom,
  walletAtom,
} from './atoms'
import { tokenMetricsAtom } from './metrics/atoms'
import { promiseMulticall } from './web3/lib/multicall'
import { error } from './web3/lib/notifications'

/**
 * Fetch a list of tokens metadata from the blockchain
 */
const getRTokenMeta = async (
  addresses: string[],
  provider: Web3Provider
): Promise<{ tokens: Token[]; main: string }> => {
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

  calls.unshift({
    abi: RTokenInterface,
    address: addresses[0],
    args: [],
    method: 'main',
  })

  const multicallResult = await promiseMulticall(calls, provider)
  const main = multicallResult.shift()

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
  }
}

const updateTokenAtom = atom(null, (get, set, data: ReserveToken) => {
  const tokens = get(reserveTokensAtom)
  set(reserveTokensAtom, { ...tokens, [data.address]: data })
})

// Try to grab the token meta from theGraph
// If it fails, get it from the blockchain (only whitelisted tokens)
// TODO: Loading state?
const ReserveTokenUpdater = () => {
  const [selectedAddress, setSelectedToken] = useAtom(selectedRTokenAtom)
  const blockNumber = useBlockNumber()
  const mainAddress = useAtomValue(rTokenMainAtom)
  const updateTokenStatus = useUpdateAtom(rTokenStatusAtom)
  const updateToken = useUpdateAtom(updateTokenAtom)
  const resetMetrics = useResetAtom(tokenMetricsAtom)
  const updateAccountRole = useUpdateAtom(accountRoleAtom)
  const facadeContract = useFacadeContract()
  const [searchParams] = useSearchParams()
  const currentAddress = searchParams.get('token')
  const account = useAtomValue(walletAtom)
  const { provider } = useWeb3React()

  const setTokenStatus = useCallback(
    async (mainAddress: string, provider: Web3Provider) => {
      try {
        let status = RTOKEN_STATUS.SOUND
        const [isPaused, isFrozen] = await promiseMulticall(
          [
            {
              abi: MainInterface,
              address: mainAddress,
              args: [],
              method: 'paused',
            },
            {
              abi: MainInterface,
              address: mainAddress,
              args: [],
              method: 'frozen',
            },
          ],
          provider
        )

        if (isPaused) {
          status = RTOKEN_STATUS.PAUSED
        } else if (isFrozen) {
          status = RTOKEN_STATUS.FROZEN
        }

        updateTokenStatus(status)
      } catch (e) {
        console.error('Error getting token status', e)
      }
    },
    []
  )

  const getTokenMeta = useCallback(
    async (address: string) => {
      const isRSV = address === RSV.address

      if (isRSV) {
        return updateToken(RSV)
      }

      try {
        if (facadeContract && provider) {
          const [basket, stTokenAddress] = await Promise.all([
            facadeContract.basketTokens(address),
            facadeContract.stToken(address),
          ])

          const {
            main,
            tokens: [rToken, stToken, ...collaterals],
          } = await getRTokenMeta(
            [address, stTokenAddress, ...basket],
            provider
          )

          return updateToken({
            ...rToken,
            stToken,
            collaterals,
            main,
          })
        }
      } catch (e) {
        console.error('Error fetching token info', e)
        error('Network Error', 'Error fetching token information')
        // setSelectedToken('')
      }
    },
    [facadeContract, provider]
  )

  const getUserRole = useCallback(
    async (
      provider: Web3Provider,
      mainAddress: string,
      accountAddress: string
    ) => {
      try {
        const callParams = {
          abi: MainInterface,
          address: mainAddress,
          method: 'hasRole',
        }

        const [isOwner, isPauser, isFreezer] = await promiseMulticall(
          [
            {
              ...callParams,
              args: [ethers.utils.formatBytes32String('OWNER'), accountAddress],
            },
            {
              ...callParams,
              args: [
                ethers.utils.formatBytes32String('PAUSER'),
                accountAddress,
              ],
            },
            {
              ...callParams,
              args: [
                ethers.utils.formatBytes32String('FREEZER'),
                accountAddress,
              ],
            },
          ],
          provider
        )

        updateAccountRole({
          owner: isOwner,
          pauser: isPauser,
          freezer: isFreezer,
        })
      } catch (e) {
        console.error('Error fetching user role', e)
      }
    },
    []
  )

  useEffect(() => {
    const token = isAddress(currentAddress ?? '')

    if (token && token !== selectedAddress) {
      setSelectedToken(token)
    }
  }, [currentAddress])

  useEffect(() => {
    if (selectedAddress && facadeContract) {
      getTokenMeta(selectedAddress)
    }
  }, [getTokenMeta, selectedAddress])

  useEffect(() => {
    if (selectedAddress) {
      resetMetrics()
    }
  }, [selectedAddress])

  // Checks rToken status on every block
  useEffect(() => {
    if (provider && blockNumber && mainAddress) {
      setTokenStatus(mainAddress, provider)
    }
  }, [blockNumber, mainAddress])

  // User role
  useEffect(() => {
    if (provider) {
      if (!mainAddress) {
        updateAccountRole({ owner: false, freezer: false, pauser: false })
      } else {
        getUserRole(provider, mainAddress, account)
      }
    }
  }, [mainAddress, account, provider])

  return null
}

export default ReserveTokenUpdater
