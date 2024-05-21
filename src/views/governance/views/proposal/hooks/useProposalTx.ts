import {
  ParamName,
  autoRegisterBackupAssetsAtom,
  autoRegisterBasketAssetsAtom,
  basketChangesAtom,
  contractUpgradesAtom,
  isAssistedUpgradeAtom,
  isNewBackupProposedAtom,
  proposalDescriptionAtom,
  registerAssetsAtom,
  unregisterAssetsAtom,
} from './../atoms'

import AssetRegistry from 'abis/AssetRegistry'
import BasketHandler from 'abis/BasketHandler'
import Distributor from 'abis/Distributor'
import Governance from 'abis/Governance'
import Main from 'abis/Main'
import Timelock from 'abis/Timelock'
import {
  backupCollateralAtom,
  basketAtom,
  revenueSplitAtom,
} from 'components/rtoken-setup/atoms'
import useDebounce from 'hooks/useDebounce'
import { atom, useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { useFormContext } from 'react-hook-form'
import {
  rTokenAssetsAtom,
  rTokenConfigurationAtom,
  rTokenContractsAtom,
  rTokenGovernanceAtom,
} from 'state/atoms'
import { rTokenCollateralDetailedAtom } from 'state/rtoken/atoms/rTokenBackingDistributionAtom'
import { ContractKey } from 'state/rtoken/atoms/rTokenContractsAtom'
import { parsePercent } from 'utils'
import { FURNACE_ADDRESS, ST_RSR_ADDRESS } from 'utils/addresses'
import {
  Hex,
  encodeFunctionData,
  parseEther,
  parseUnits,
  stringToHex,
  zeroAddress,
} from 'viem'
import { getSharesFromSplit } from 'views/deploy/utils'
import { Address } from 'wagmi'
import {
  backupChangesAtom,
  isNewBasketProposedAtom,
  parameterContractMapAtom,
  parametersChangesAtom,
  revenueSplitChangesAtom,
  roleChangesAtom,
} from '../atoms'
import useUpgradeHelper from './useUpgradeHelper'
import { isTimeunitGovernance } from 'views/governance/utils'

const paramParse: { [x: string]: (v: string) => bigint | number } = {
  minTradeVolume: parseEther,
  rTokenMaxTradeVolume: parseEther,
  rewardRatio: parseEther,
  withdrawalLeak: (v) => parseUnits(v, 16),
  unstakingDelay: Number,
  tradingDelay: Number,
  auctionLength: Number,
  backingBuffer: parsePercent,
  maxTradeSlippage: parsePercent,
  shortFreeze: Number,
  longFreeze: Number,
  warmupPeriod: Number,
  minDelay: (v) => +v * 60 * 60,
  proposalThresholdAsMicroPercent: (v) => BigInt(+v * 1e6),
  quorumPercent: Number,
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

const registeredAssetsAtom = atom((get) => {
  const assets = get(rTokenAssetsAtom)

  if (!assets) {
    return null
  }

  const registered: Set<Address> = new Set()

  return Object.keys(assets).reduce((r, address) => {
    r.add(address as Address)
    r.add(assets[address].address as Address)
    return r
  }, registered)
})

// Ensures the weights sum to the total
// If the sum is greater, the last weight is increased by the difference
// If the sum is less, the last weight is decreased by the difference
const adjustWeightsIfNeeded = (weights: bigint[], sum?: bigint) => {
  if (!sum) return weights

  const total = weights.reduce((a, b) => a + b, 0n)
  if (total === sum) return weights

  if (total > sum) {
    weights[weights.length - 1] -= total - sum
  } else {
    weights[weights.length - 1] += sum - total
  }

  return weights
}

// TODO: May want to use a separate memo to calculate the calldatas
const useProposalTx = () => {
  const backupChanges = useAtomValue(backupChangesAtom)
  const basketChanges = useAtomValue(basketChangesAtom)
  const revenueChanges = useAtomValue(revenueSplitChangesAtom)
  const parameterChanges = useAtomValue(parametersChangesAtom)
  const roleChanges = useAtomValue(roleChangesAtom)
  const assetsToUnregister = useAtomValue(unregisterAssetsAtom)
  const assetsToRegister = useAtomValue(registerAssetsAtom)
  const newBackup = useAtomValue(isNewBackupProposedAtom)
  const newBasket = useAtomValue(isNewBasketProposedAtom)
  const basket = useAtomValue(basketAtom)
  const backup = useAtomValue(backupCollateralAtom)
  const revenueSplit = useAtomValue(revenueSplitAtom)
  const governance = useAtomValue(rTokenGovernanceAtom)
  const isTimeGovernance = isTimeunitGovernance(governance.name)
  const parameterMap = useAtomValue(parameterContractMapAtom)
  const contracts = useAtomValue(rTokenContractsAtom)
  const assets = useAtomValue(registeredAssetsAtom)
  const upgrades = useAtomValue(contractUpgradesAtom)
  const rTokenConfig = useAtomValue(rTokenConfigurationAtom)
  const autoRegisterBasketAssets = useAtomValue(autoRegisterBasketAssetsAtom)
  const autoRegisterBackupAssets = useAtomValue(autoRegisterBackupAssetsAtom)
  const weightsSum = useAtomValue(rTokenCollateralDetailedAtom)
    ?.map((c) => c.distributionRaw)
    .reduce((a, b) => a + parseEther(b) / 100n, 0n)

  const isAssistedUpgrade = useAtomValue(isAssistedUpgradeAtom)
  const { calls, addresses } = useUpgradeHelper()

  const description = useDebounce(useAtomValue(proposalDescriptionAtom), 500)
  const { getValues } = useFormContext()

  if (isAssistedUpgrade)
    return {
      abi: Governance,
      address: governance.governor,
      functionName: 'propose',
      args: [
        addresses as Address[],
        new Array(calls.length).fill(0) as bigint[],
        calls as Hex[],
        description,
      ] as [Address[], bigint[], Hex[], string],
      enabled: !!description,
    }

  return useMemo(() => {
    if (!contracts || !assets || !governance.governor) {
      return undefined
    }

    const addresses: string[] = []
    const calls: string[] = []
    let redemptionThrottleChange = false
    let issuanceThrottleChange = false
    const tokenConfig = getValues()

    const newAssets = new Set<Address>()

    /* ########################## 
      ## Contract upgrades ## 
      ############################# */
    const contractUpgrades = Object.keys(upgrades)

    if (contractUpgrades.length) {
      for (const contract of contractUpgrades) {
        addresses.push(contracts[contract as ContractKey].address)
        calls.push(
          encodeFunctionData({
            abi: AssetRegistry,
            functionName: 'upgradeTo',
            args: [upgrades[contract]],
          })
        )
      }
    }

    const addToRegistry = (address: Address, underlyingAddress?: Address) => {
      if (newAssets.has(address) || assets.has(address)) return
      addresses.push(contracts.assetRegistry.address)

      // Underlying asset (from another plugin instance)
      // registered in past - swapRegistered
      if (
        underlyingAddress &&
        assets.has(underlyingAddress) &&
        !assets.has(address)
      ) {
        calls.push(
          encodeFunctionData({
            abi: AssetRegistry,
            functionName: 'swapRegistered',
            args: [address],
          })
        )
        newAssets.add(address)
        // Brand new plugin - register
      } else {
        calls.push(
          encodeFunctionData({
            abi: AssetRegistry,
            functionName: 'register',
            args: [address],
          })
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
            const { address, ...data } = parameterMap.issuanceThrottle[0]
            addresses.push(address)
            calls.push(
              encodeFunctionData({
                ...data,
                args: [
                  {
                    amtRate: parseEther(tokenConfig.issuanceThrottleAmount),
                    pctRate: parsePercent(tokenConfig.issuanceThrottleRate),
                  },
                ],
              })
            )
          }
          issuanceThrottleChange = true
        } else if (
          paramChange.field === 'redemptionThrottleAmount' ||
          paramChange.field === 'redemptionThrottleRate'
        ) {
          // Skip second param if both are changed
          if (!redemptionThrottleChange) {
            const { address, ...data } = parameterMap.redemptionThrottle[0]

            addresses.push(address)
            calls.push(
              encodeFunctionData({
                ...data,
                args: [
                  {
                    amtRate: parseEther(tokenConfig.redemptionThrottleAmount),
                    pctRate: parsePercent(tokenConfig.redemptionThrottleRate),
                  },
                ],
              })
            )

            // Issuance change is always before redemption change by default BUT:
            //! -> if new issuance throttle > old redemption throttle: redemption should go first
            //! -> if new redemption throttle < old issuance throttle: issuance should go first
            // TODO: This doesn't cover all the cases but is good enough for now
            if (
              issuanceThrottleChange &&
              (+tokenConfig.issuanceThrottleAmount >
                +rTokenConfig?.redemptionThrottleAmount ||
                +tokenConfig.issuanceThrottleRate >
                  +rTokenConfig?.redemptionThrottleRate)
            ) {
              const newIndex = addresses.length - 2
              const issuanceCall = calls[newIndex]
              calls[newIndex] = calls[newIndex + 1]
              calls[newIndex + 1] = issuanceCall
            }
          }
          redemptionThrottleChange = true
        } else {
          for (const contract of parameterMap[paramChange.field as ParamName]) {
            const { address, ...data } = contract
            let proposedParam: string | bigint | number

            if (
              paramChange.field === 'votingDelay' ||
              paramChange.field === 'votingPeriod'
            ) {
              proposedParam = isTimeGovernance
                ? Number(paramChange.proposed) * 60 * 60
                : Number(paramChange.proposed)
            } else {
              proposedParam = paramParse[paramChange.field]
                ? paramParse[paramChange.field](paramChange.proposed)
                : paramChange.proposed
            }

            addresses.push(address)
            calls.push(
              encodeFunctionData({
                ...(data as any),
                args: [proposedParam],
              })
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
          encodeFunctionData({
            abi: (isGuardian ? Timelock : Main) as any,
            functionName: roleChange.isNew ? 'grantRole' : 'revokeRole',
            args: [ROLES[roleChange.role], roleChange.address],
          })
        )
      }

      for (const asset of assetsToUnregister) {
        addresses.push(contracts.assetRegistry.address)
        calls.push(
          encodeFunctionData({
            abi: AssetRegistry,
            functionName: 'unregister',
            args: [asset as Address],
          })
        )
      }

      for (const asset of assetsToRegister) {
        addToRegistry(asset.asset, asset.erc20)
      }

      /* ########################## 
      ## Parse basket changes    ## 
      ############################# */
      if (newBasket) {
        const primaryBasket: Address[] = []
        const newCollaterals: Set<Address> = new Set()
        const weights: bigint[] = []

        // Register missing collateral/assets on the asset registry
        for (const changes of basketChanges) {
          if (changes.isNew) {
            newCollaterals.add(changes.collateral.address as Address)

            if (autoRegisterBasketAssets) {
              addToRegistry(
                changes.collateral.address as Address,
                changes.collateral.erc20 as Address
              )

              if (
                !!changes.collateral.rewardTokens?.length &&
                changes.collateral.rewardTokens[0] != zeroAddress
              ) {
                changes.collateral.rewardTokens.forEach((reward) =>
                  addToRegistry(reward as Address)
                )
              }
            }
          }
        }

        // Get call arguments
        for (const targetUnit of Object.keys(basket)) {
          const { collaterals, distribution, scale } = basket[targetUnit]

          collaterals.forEach((collateral, index) => {
            primaryBasket.push(collateral.erc20)

            weights.push(
              parseEther(
                ((Number(distribution[index]) / 100) * Number(scale)).toString()
              )
            )
          })
        }

        const adjustedWeights = adjustWeightsIfNeeded(weights, weightsSum)

        // Set primeBasket with new collaterals and weights
        addresses.push(contracts.basketHandler.address)
        calls.push(
          encodeFunctionData({
            abi: BasketHandler,
            functionName: 'setPrimeBasket',
            args: [primaryBasket, adjustedWeights],
          })
        )
        // Refresh basket is needed for the action to take effect
        addresses.push(contracts.basketHandler.address)
        calls.push(
          encodeFunctionData({
            abi: BasketHandler,
            functionName: 'refreshBasket',
          })
        )
      }

      /* ########################## 
      ## Parse backup            ## 
      ############################# */
      if (newBackup && backupChanges.count) {
        for (const targetUnit of Object.keys(backup)) {
          const { collaterals, diversityFactor } = backup[targetUnit]

          const backupCollaterals: Address[] = []

          for (const collateral of collaterals) {
            if (autoRegisterBackupAssets) {
              addToRegistry(collateral.address, collateral.erc20)
              if (
                !!collateral.rewardTokens?.length &&
                collateral.rewardTokens[0] != zeroAddress
              ) {
                collateral.rewardTokens.forEach((reward) =>
                  addToRegistry(reward as Address)
                )
              }
            }

            backupCollaterals.push(collateral.erc20)
          }

          addresses.push(contracts.basketHandler.address)
          calls.push(
            encodeFunctionData({
              abi: BasketHandler,
              functionName: 'setBackupConfig',
              args: [
                stringToHex(targetUnit.toUpperCase(), { size: 32 }),
                parseEther(diversityFactor.toString()),
                backupCollaterals,
              ],
            })
          )
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
              encodeFunctionData({
                abi: Distributor,
                functionName: 'setDistribution',
                args: [
                  revChange.split.address as Address,
                  { rTokenDist: 0, rsrDist: 0 },
                ],
              })
            )
          }
        }

        addresses.push(contracts.distributor.address)
        calls.push(
          encodeFunctionData({
            abi: Distributor,
            functionName: 'setDistribution',
            args: [
              FURNACE_ADDRESS,
              { rTokenDist: dist.rTokenDist, rsrDist: 0 },
            ],
          })
        )
        addresses.push(contracts.distributor.address)
        calls.push(
          encodeFunctionData({
            abi: Distributor,
            functionName: 'setDistribution',
            args: [ST_RSR_ADDRESS, { rTokenDist: 0, rsrDist: dist.rsrDist }],
          })
        )

        for (const external of beneficiaries) {
          addresses.push(contracts.distributor.address)
          calls.push(
            encodeFunctionData({
              abi: Distributor,
              functionName: 'setDistribution',
              args: [external.beneficiary, external.revShare],
            })
          )
        }
      }
    } catch (e) {
      console.error('Error generating proposal call', e)
      return undefined
    }

    return {
      abi: Governance,
      address: governance.governor,
      functionName: 'propose',
      args: [
        addresses as Address[],
        new Array(calls.length).fill(0) as bigint[],
        calls as Hex[],
        description,
      ] as [Address[], bigint[], Hex[], string],
      enabled: !!description,
    }
  }, [contracts, assets, description])
}

export default useProposalTx
