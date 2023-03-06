import { BasketHandler } from './../../../../../abis/types/BasketHandler'
import { proposalDescriptionAtom } from './../atoms'
import { t } from '@lingui/macro'
import {
  BasketHandlerInterface,
  GovernanceInterface,
  MainInterface,
  TimelockInterface,
} from 'abis'

import { basketAtom } from 'components/rtoken-setup/atoms'
import { BigNumber } from 'ethers'
import { parseEther } from 'ethers/lib/utils'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { useFormContext } from 'react-hook-form'
import { rTokenContractsAtom, rTokenGovernanceAtom } from 'state/atoms'
import { parsePercent } from 'utils'
import { TRANSACTION_STATUS } from 'utils/constants'
import {
  backupChangesAtom,
  isNewBasketProposedAtom,
  parameterContractMapAtom,
  parametersChangesAtom,
  revenueSplitChangesAtom,
  roleChangesAtom,
} from '../atoms'
import { RoleKey } from 'types'

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
  const revenueChanges = useAtomValue(revenueSplitChangesAtom)
  const parameterChanges = useAtomValue(parametersChangesAtom)
  const roleChanges = useAtomValue(roleChangesAtom)
  const newBasket = useAtomValue(isNewBasketProposedAtom)
  const basket = useAtomValue(basketAtom)
  const governance = useAtomValue(rTokenGovernanceAtom)
  const parameterMap = useAtomValue(parameterContractMapAtom)
  const contracts = useAtomValue(rTokenContractsAtom)
  const description = useAtomValue(proposalDescriptionAtom)
  const { getValues } = useFormContext()

  return useMemo(() => {
    const addresses: string[] = []
    const calls: string[] = []
    let redemptionThrottleChange = false
    let issuanceThrottleChange = false
    const tokenConfig = getValues()

    try {
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

      for (const roleChange of roleChanges) {
        addresses.push(contracts.main)
        calls.push(
          MainInterface.encodeFunctionData(
            roleChange.isNew ? 'grantRole' : 'revokeRole',
            [ROLES[roleChange.role], roleChange.address]
          )
        )
      }

      if (newBasket) {
        const primaryBasket: string[] = []
        const weights: BigNumber[] = []

        // TODO: Update asset registry / Assets comp/aave
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

        addresses.push(contracts.basketHandler)
        calls.push(
          BasketHandlerInterface.encodeFunctionData('setPrimeBasket', [
            primaryBasket,
            weights,
          ])
        )
        addresses.push(contracts.BasketHandler)
        calls.push(
          BasketHandlerInterface.encodeFunctionData('refreshBasket', [])
        )
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
  }, [contracts, description])
}

export default useProposalTx
