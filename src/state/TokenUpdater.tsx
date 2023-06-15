import { MainInterface } from 'abis'
import { ethers } from 'ethers'
import useBlockNumber from 'hooks/useBlockNumber'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useResetAtom } from 'jotai/utils'
import { useCallback, useEffect } from 'react'
import { isAddress } from 'utils'
import {
  accountRoleAtom,
  multicallAtom,
  rTokenMainAtom,
  searchParamAtom,
  selectedRTokenAtom,
  walletAtom,
} from './atoms'
import { tokenMetricsAtom } from './metrics/atoms'

// Try to grab the token meta from theGraph
// If it fails, get it from the blockchain (only whitelisted tokens)
// TODO: Loading state?
const ReserveTokenUpdater = () => {
  const [selectedAddress, setSelectedToken] = useAtom(selectedRTokenAtom)
  const blockNumber = useBlockNumber()
  const mainAddress = useAtomValue(rTokenMainAtom)
  const resetMetrics = useResetAtom(tokenMetricsAtom)
  const updateAccountRole = useSetAtom(accountRoleAtom)
  const currentAddress = useAtomValue(searchParamAtom('token'))
  const account = useAtomValue(walletAtom)
  const multicall = useAtomValue(multicallAtom)

  const getUserRole = useCallback(
    async (mainAddress: string, accountAddress: string) => {
      if (!multicall) {
        return
      }

      try {
        const callParams = {
          abi: MainInterface,
          address: mainAddress,
          method: 'hasRole',
        }

        const [isOwner, isPauser, isShortFreezer, isLongFreezer] =
          await multicall([
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
                ethers.utils.formatBytes32String('SHORT_FREEZER'),
                accountAddress,
              ],
            },
            {
              ...callParams,
              args: [
                ethers.utils.formatBytes32String('LONG_FREEZER'),
                accountAddress,
              ],
            },
          ])

        updateAccountRole({
          owner: isOwner,
          pauser: isPauser,
          shortFreezer: isShortFreezer,
          longFreezer: isLongFreezer,
        })
      } catch (e) {
        console.error('Error fetching user role', e)
      }
    },
    [multicall]
  )

  useEffect(() => {
    const token = isAddress(currentAddress ?? '')

    if (token && token !== selectedAddress) {
      setSelectedToken(token)
    }
  }, [currentAddress])

  useEffect(() => {
    if (selectedAddress) {
      resetMetrics()
    }
  }, [selectedAddress])

  // User role
  useEffect(() => {
    if (!mainAddress || !account) {
      updateAccountRole({
        owner: false,
        shortFreezer: false,
        longFreezer: false,
        pauser: false,
      })
    } else {
      getUserRole(mainAddress, account)
    }
  }, [mainAddress, account, blockNumber, getUserRole])

  return null
}

export default ReserveTokenUpdater
