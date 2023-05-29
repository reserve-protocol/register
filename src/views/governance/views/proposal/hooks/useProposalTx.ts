import { t } from '@lingui/macro'
import {
  AssetRegistryInterface,
  BasketHandlerInterface,
  DistributorInterface,
  MainInterface,
  TimelockInterface,
} from 'abis'
import { useContractCall } from 'hooks/useCall'
import {
  basketChangesAtom,
  isNewBackupProposedAtom,
  proposalDescriptionAtom,
} from './../atoms'

import {
  backupCollateralAtom,
  basketAtom,
  revenueSplitAtom,
} from 'components/rtoken-setup/atoms'
import { BigNumber, ethers } from 'ethers'
import { parseEther } from 'ethers/lib/utils'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { useFormContext } from 'react-hook-form'
import { rTokenContractsAtom, rTokenGovernanceAtom } from 'state/atoms'
import { parsePercent } from 'utils'
import { FURNACE_ADDRESS, ST_RSR_ADDRESS, ZERO_ADDRESS } from 'utils/addresses'
import { TRANSACTION_STATUS } from 'utils/constants'
import { getSharesFromSplit } from 'views/deploy/utils'
import {
  backupChangesAtom,
  isNewBasketProposedAtom,
  parameterContractMapAtom,
  parametersChangesAtom,
  revenueSplitChangesAtom,
  roleChangesAtom,
} from '../atoms'

const paramParse: { [x: string]: (v: string) => BigNumber } = {
  minTradeVolume: parseEther,
  rTokenMaxTradeVolume: parseEther,
  rewardRatio: parseEther,
  unstakingDelay: BigNumber.from,
  tradingDelay: BigNumber.from,
  auctionLength: BigNumber.from,
  backingBuffer: parsePercent,
  maxTradeSlippage: parsePercent,
  shortFreeze: BigNumber.from,
  longFreeze: BigNumber.from,
}

const ROLES: { [x: string]: string } = {
  longFreezers:
    '0x4c4f4e475f465245455a45520000000000000000000000000000000000000000',
  freezers:
    '0x53484f52545f465245455a455200000000000000000000000000000000000000',
  pausers: '0x5041555345520000000000000000000000000000000000000000000000000000',
  owners: '0x4f574e4552000000000000000000000000000000000000000000000000000000',
  guardians:
    '0xfd643c72710c63c0180259aba6b2d05451e3591a24e58b62239378085726f783',
}

// TODO: May want to use a separate memo to calculate the calldatas
const useProposalTx = () => {
  const backupChanges = useAtomValue(backupChangesAtom)
  const basketChanges = useAtomValue(basketChangesAtom)
  const revenueChanges = useAtomValue(revenueSplitChangesAtom)
  const parameterChanges = useAtomValue(parametersChangesAtom)
  const roleChanges = useAtomValue(roleChangesAtom)
  const newBackup = useAtomValue(isNewBackupProposedAtom)
  const newBasket = useAtomValue(isNewBasketProposedAtom)
  const basket = useAtomValue(basketAtom)
  const backup = useAtomValue(backupCollateralAtom)
  const revenueSplit = useAtomValue(revenueSplitAtom)
  const governance = useAtomValue(rTokenGovernanceAtom)
  const parameterMap = useAtomValue(parameterContractMapAtom)
  const contracts = useAtomValue(rTokenContractsAtom)
  const { value: registeredAssets } = useContractCall({
    abi: AssetRegistryInterface,
    address: contracts?.assetRegistry.address ?? '',
    method: 'getRegistry',
    args: [],
  }) || { value: [] }
  const description = useAtomValue(proposalDescriptionAtom)
  const { getValues } = useFormContext()

  return useMemo(() => {
    if (!contracts || !governance) {
      return null
    }

    const addresses: string[] = []
    const calls: string[] = []
    let redemptionThrottleChange = false
    let issuanceThrottleChange = false
    const tokenConfig = getValues()
    const assets = new Set<string>(
      registeredAssets[0]
        ? [...(registeredAssets[0][0] || []), ...(registeredAssets[0][1] || [])]
        : []
    )
    const newAssets = new Set<string>()

    const addToRegistry = (address: string, underlyingAddress?: string) => {
      if (newAssets.has(address) || assets.has(address)) return
      addresses.push(contracts?.assetRegistry.address ?? '')

      // Underlying asset (from another plugin instance)
      // registered in past - swapRegistered
      if (assets.has(underlyingAddress || '') && !assets.has(address)) {
        calls.push(
          AssetRegistryInterface.encodeFunctionData('swapRegistered', [address])
        )
        newAssets.add(address)
        // Brand new plugin - register
      } else {
        calls.push(
          AssetRegistryInterface.encodeFunctionData('register', [address])
        )
        newAssets.add(address)
      }
    }

    try {
      /* ########################## 
      ## Parse parameter changes ## 
      ############################# */
      for (const paramChange of parameterChanges) {
        if (
          paramChange.field === 'issuanceThrottleAmount' ||
          paramChange.field === 'issuanceThrottleRate'
        ) {
          // Skip second param if both are changed
          if (!issuanceThrottleChange) {
            addresses.push(parameterMap.issuanceThrottle[0].address)
            calls.push(
              parameterMap.issuanceThrottle[0].interface.encodeFunctionData(
                parameterMap.issuanceThrottle[0].method,
                [
                  {
                    amtRate: parseEther(tokenConfig.issuanceThrottleAmount),
                    pctRate: parsePercent(tokenConfig.issuanceThrottleRate),
                  },
                ]
              )
            )
          }
          issuanceThrottleChange = true
        } else if (
          paramChange.field === 'redemptionThrottleAmount' ||
          paramChange.field === 'redemptionThrottleRate'
        ) {
          // Skip second param if both are changed
          if (!redemptionThrottleChange) {
            addresses.push(parameterMap.redemptionThrottle[0].address)
            calls.push(
              parameterMap.redemptionThrottle[0].interface.encodeFunctionData(
                parameterMap.redemptionThrottle[0].method,
                [
                  {
                    amtRate: parseEther(tokenConfig.redemptionThrottleAmount),
                    pctRate: parsePercent(tokenConfig.redemptionThrottleRate),
                  },
                ]
              )
            )
          }
          redemptionThrottleChange = true
        } else {
          for (const contract of parameterMap[paramChange.field]) {
            addresses.push(contract.address)
            calls.push(
              contract.interface.encodeFunctionData(contract.method, [
                paramParse[paramChange.field](paramChange.proposed),
              ])
            )
          }
        }
      }

      /* ########################## 
      ##   Parse role changes    ## 
      ############################# */
      for (const roleChange of roleChanges) {
        const isGuardian = roleChange.role === 'guardians'

        if (contracts?.main) {
          addresses.push(
            isGuardian && governance.timelock
              ? governance.timelock
              : contracts.main.address
          )
        }

        calls.push(
          (isGuardian ? TimelockInterface : MainInterface).encodeFunctionData(
            roleChange.isNew ? 'grantRole' : 'revokeRole',
            [ROLES[roleChange.role], roleChange.address]
          )
        )
      }

      /* ########################## 
      ## Parse basket changes    ## 
      ############################# */
      if (newBasket) {
        const primaryBasket: string[] = []
        const weights: BigNumber[] = []

        // Get call arguments
        for (const targetUnit of Object.keys(basket)) {
          const { collaterals, distribution, scale } = basket[targetUnit]

          collaterals.forEach((collateral, index) => {
            primaryBasket.push(collateral.address)

            weights.push(
              parseEther(
                ((Number(distribution[index]) / 100) * Number(scale)).toFixed(
                  18
                )
              )
            )
          })
        }

        // Register missing collateral/assets on the asset registry
        for (const changes of basketChanges) {
          if (changes.isNew) {
            addToRegistry(
              changes.collateral.collateralAddress ||
                changes.collateral.address,
              changes.collateral.address
            )

            if (
              !!changes.collateral.rewardToken?.length &&
              changes.collateral.rewardToken[0] != ZERO_ADDRESS
            ) {
              changes.collateral.rewardToken.forEach((reward) =>
                addToRegistry(reward)
              )
            }
          }
        }

        // Set primeBasket with new collaterals and weights
        addresses.push(contracts.basketHandler.address)
        calls.push(
          BasketHandlerInterface.encodeFunctionData('setPrimeBasket', [
            primaryBasket,
            weights,
          ])
        )
        // Refresh basket is needed for the action to take effect
        addresses.push(contracts.basketHandler.address)
        calls.push(
          BasketHandlerInterface.encodeFunctionData('refreshBasket', [])
        )
      }

      /* ########################## 
      ## Parse backup            ## 
      ############################# */
      if (newBackup && backupChanges.count) {
        for (const targetUnit of Object.keys(newBackup)) {
          const { collaterals, diversityFactor } = backup[targetUnit]

          collaterals.forEach((collateral, index) => {
            const backupCollaterals: string[] = []

            for (const collateral of collaterals) {
              addToRegistry(collateral.address)
              if (
                !!collateral.rewardToken?.length &&
                collateral.rewardToken[0] != ZERO_ADDRESS
              ) {
                collateral.rewardToken.forEach((reward) =>
                  addToRegistry(reward)
                )
              }
              backupCollaterals.push(collateral.address)
            }

            addresses.push(contracts.basketHandler.address)
            calls.push(
              BasketHandlerInterface.encodeFunctionData('setBackupConfig', [
                ethers.utils.formatBytes32String(targetUnit.toUpperCase()),
                parseEther(diversityFactor.toString()),
                backupCollaterals,
              ])
            )
          })
        }
      }

      /* ########################## 
      ## Parse revenue changes   ## 
      ############################# */
      if (revenueChanges.count) {
        const [dist, beneficiaries] = getSharesFromSplit(revenueSplit)

        for (const revChange of revenueChanges.externals) {
          if (!revChange.isNew) {
            addresses.push(contracts.distributor.address)
            calls.push(
              DistributorInterface.encodeFunctionData('setDistribution', [
                FURNACE_ADDRESS,
                { rTokenDist: BigNumber.from(0), rsrDist: BigNumber.from(0) },
              ])
            )
          }
        }

        addresses.push(contracts.distributor.address)
        calls.push(
          DistributorInterface.encodeFunctionData('setDistribution', [
            FURNACE_ADDRESS,
            { rTokenDist: dist.rTokenDist, rsrDist: BigNumber.from(0) },
          ])
        )
        addresses.push(contracts.distributor.address)
        calls.push(
          DistributorInterface.encodeFunctionData('setDistribution', [
            ST_RSR_ADDRESS,
            { rTokenDist: BigNumber.from(0), rsrDist: dist.rsrDist },
          ])
        )

        for (const external of beneficiaries) {
          addresses.push(contracts.distributor.address)
          calls.push(
            DistributorInterface.encodeFunctionData('setDistribution', [
              external.beneficiary,
              external.revShare,
            ])
          )
        }
      }

      // TODO: REMOVE THIS!!!!
      // addresses.push(governance.governor)
      // calls.push(
      //   GovernanceInterface.encodeFunctionData('setVotingDelay', [
      //     BigNumber.from('14400'),
      //   ])
      // )
      // addresses.push(governance.governor)
      // calls.push(
      //   GovernanceInterface.encodeFunctionData('setVotingPeriod', [
      //     BigNumber.from('21600'),
      //   ])
      // )
      // addresses.push(governance.timelock || '')
      // calls.push(
      //   TimelockInterface.encodeFunctionData('updateDelay', [
      //     BigNumber.from('259200'),
      //   ])
      // )
    } catch (e) {
      console.error('Error generating proposal call', e)
    }

    return {
      id: '',
      description: t`New proposal`,
      status: TRANSACTION_STATUS.PENDING,
      value: '0',
      call: {
        abi: 'governance',
        address: governance.governor,
        method: 'propose',
        args: [addresses, new Array(calls.length).fill(0), calls, description],
      },
    }
  }, [contracts, description, JSON.stringify(registeredAssets)])
}

export default useProposalTx
