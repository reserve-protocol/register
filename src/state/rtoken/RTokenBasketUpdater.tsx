import { ERC20Interface, FacadeInterface } from 'abis'
import { BackupBasket, Basket } from 'components/rtoken-setup/atoms'
import { BigNumber } from 'ethers'
import { formatBytes32String } from 'ethers/lib/utils'
import useRToken from 'hooks/useRToken'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect } from 'react'
import {
  chainIdAtom,
  multicallAtom,
  rTokenBackingDistributionAtom,
  rTokenBackupAtom,
  rTokenBasketAtom,
} from 'state/atoms'
import { ContractCall } from 'types'
import { FACADE_ADDRESS } from 'utils/addresses'

const RTokenBasketUpdater = () => {
  const rToken = useRToken()
  const distribution = useAtomValue(rTokenBackingDistributionAtom)
  const [primaryBasket, setPrimaryBasket] = useAtom(rTokenBasketAtom)
  const setBackupBasket = useSetAtom(rTokenBackupAtom)
  const chainId = useAtomValue(chainIdAtom)
  const multicall = useAtomValue(multicallAtom)

  const setBackupConfig = useCallback(
    async (rTokenAddress: string, targetUnits: string[]) => {
      if (!multicall) {
        return
      }

      try {
        const calls = targetUnits.reduce(
          (prev, curr) => [
            ...prev,
            {
              address: FACADE_ADDRESS[chainId],
              abi: FacadeInterface,
              method: 'backupConfig',
              args: [rTokenAddress, formatBytes32String(curr)],
            },
          ],
          [] as ContractCall[]
        )

        const multicallResult = await multicall(calls)
        const backupBasket: BackupBasket = {}
        let index = 0

        for (const result of multicallResult) {
          const { erc20s, max }: { erc20s: string[]; max: BigNumber } = result

          const symbols: string[] = await multicall(
            erc20s.map((address) => ({
              address,
              abi: ERC20Interface,
              method: 'symbol',
              args: [],
            }))
          )

          backupBasket[targetUnits[index]] = {
            diversityFactor: max.toNumber(),
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
    [multicall, chainId]
  )

  useEffect(() => {
    if (rToken && !!Object.keys(primaryBasket)) {
      setBackupConfig(rToken.address, Object.keys(primaryBasket))
    }
  }, [rToken?.address, primaryBasket, setBackupConfig])

  // Update primary basket
  useEffect(() => {
    if (rToken?.address && distribution) {
      setPrimaryBasket(
        rToken.collaterals.reduce((prev, { address, symbol }) => {
          if (!distribution.collateralDistribution[address]) {
            return prev
          }

          const { targetUnit, share } =
            distribution.collateralDistribution[address]
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
              distribution: [share.toPrecision(6)],
            }
          } else {
            targetBasket.collaterals.push(collateral)
            targetBasket.distribution.push(share.toPrecision(6))
          }

          prev[targetUnit] = targetBasket
          return prev
        }, {} as Basket)
      )
    }
  }, [rToken?.address, distribution])

  return null
}

export default RTokenBasketUpdater
