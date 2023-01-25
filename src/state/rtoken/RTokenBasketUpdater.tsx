import { Web3Provider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'
import { ERC20Interface, FacadeInterface } from 'abis'
import { BackupBasket, Basket } from 'components/rtoken-setup/atoms'
import { BigNumber } from 'ethers'
import { formatBytes32String, formatEther } from 'ethers/lib/utils'
import useRToken from 'hooks/useRToken'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect } from 'react'
import {
  rtokenBackupAtom,
  rTokenBasketAtom,
  rTokenCollateralDist,
} from 'state/atoms'
import { promiseMulticall } from 'state/web3/lib/multicall'
import { ContractCall } from 'types'
import { FACADE_ADDRESS } from 'utils/addresses'
import { CHAIN_ID } from 'utils/chains'

const RTokenBasketUpdater = () => {
  const rToken = useRToken()
  const basketDistribution = useAtomValue(rTokenCollateralDist)
  const [primaryBasket, setPrimaryBasket] = useAtom(rTokenBasketAtom)
  const setBackupBasket = useSetAtom(rtokenBackupAtom)
  const { provider } = useWeb3React()

  const setBackupConfig = useCallback(
    async (
      rTokenAddress: string,
      targetUnits: string[],
      provider: Web3Provider
    ) => {
      try {
        const calls = targetUnits.reduce(
          (prev, curr) => [
            ...prev,
            {
              address: FACADE_ADDRESS[CHAIN_ID],
              abi: FacadeInterface,
              method: 'backupConfig',
              args: [rTokenAddress, formatBytes32String(curr)],
            },
          ],
          [] as ContractCall[]
        )

        const multicallResult = await promiseMulticall(calls, provider)
        const backupBasket: BackupBasket = {}
        let index = 0

        for (const result of multicallResult) {
          const { erc20s, max }: { erc20s: string[]; max: BigNumber } = result

          const symbols: string[] = await promiseMulticall(
            erc20s.map((address) => ({
              address,
              abi: ERC20Interface,
              method: 'symbol',
              args: [],
            })),
            provider
          )

          backupBasket[targetUnits[index]] = {
            diversityFactor: +formatEther(max),
            collaterals: erc20s.map((address, i) => ({
              address,
              targetUnit: targetUnits[index],
              symbol: symbols[i],
            })),
          }
          index += 1
        }

        setBackupBasket(backupBasket)
      } catch (e) {
        console.warn('Error getting backup config', e)
      }
    },
    []
  )

  useEffect(() => {
    if (rToken && provider && !!Object.keys(primaryBasket)) {
      setBackupConfig(rToken.address, Object.keys(primaryBasket), provider)
    }
  }, [rToken?.address, primaryBasket, provider])

  // Update primary basket
  useEffect(() => {
    if (rToken?.address && Object.keys(basketDistribution).length) {
      setPrimaryBasket(
        rToken.collaterals.reduce((prev, { address, symbol }) => {
          if (!basketDistribution[address]) {
            return prev
          }

          const { targetUnit, share } = basketDistribution[address]
          let targetBasket = prev[targetUnit]
          const collateral = {
            targetUnit,
            address,
            symbol,
          }

          if (!targetBasket) {
            targetBasket = {
              scale: '1',
              collaterals: [collateral],
              distribution: [share.toFixed(2)],
            }
          } else {
            targetBasket.collaterals.push(collateral)
            targetBasket.distribution.push(share.toFixed(2))
          }

          prev[targetUnit] = targetBasket
          return prev
        }, {} as Basket)
      )
    }
  }, [rToken?.address, basketDistribution])

  return null
}

export default RTokenBasketUpdater
