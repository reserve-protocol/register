import { t } from '@lingui/macro'
import {
  BackingManagerInterface,
  BasketHandlerInterface,
  MainInterface,
} from 'abis'

import { basketAtom } from 'components/rtoken-setup/atoms'
import Layout from 'components/rtoken-setup/Layout'
import { BigNumber } from 'ethers'
import { parseEther } from 'ethers/lib/utils'
import { atom, useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { rTokenContractsAtom, rTokenGovernanceAtom } from 'state/atoms'
import { TRANSACTION_STATUS } from 'utils/constants'
import ProposalDetail from 'views/governance/components/ProposalDetail'
import ProposalDetailNavigation from 'views/governance/components/ProposalDetailNavigation'
import {
  backupChangesAtom,
  isNewBasketProposedAtom,
  parameterContractMapAtom,
  parametersChangesAtom,
  revenueSplitChangesAtom,
  roleChangesAtom,
} from '../atoms'
import ConfirmProposalOverview from './ConfirmProposalOverview'

const useProposal = () => {
  const backupChanges = useAtomValue(backupChangesAtom)
  const revenueChanges = useAtomValue(revenueSplitChangesAtom)
  const parameterChanges = useAtomValue(parametersChangesAtom)
  const roleChanges = useAtomValue(roleChangesAtom)
  const newBasket = useAtomValue(isNewBasketProposedAtom)
  const basket = useAtomValue(basketAtom)
  const governance = useAtomValue(rTokenGovernanceAtom)
  const parameterMap = useAtomValue(parameterContractMapAtom)
  const contracts = useAtomValue(rTokenContractsAtom)

  return useMemo(() => {
    const addresses: string[] = []
    const calls: string[] = []
    let redemptionThrottleChange = false
    let issuanceThrottleChange = false

    for (const paramChange of parameterChanges) {
      if (
        paramChange.field === 'redemptionThrottleAmount' ||
        paramChange.field === 'redemptionThrottleRate'
      ) {
        // Skip second param if both are changed
        if (!issuanceThrottleChange) {
        }
        issuanceThrottleChange = true
      } else if (
        paramChange.field === 'issuanceThrottleAmount' ||
        paramChange.field === 'issuanceThrottleRate'
      ) {
        // Skip second param if both are changed
        if (!redemptionThrottleChange) {
        }
        redemptionThrottleChange = true
      } else {
      }
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
              ((Number(distribution[index]) / 100) * Number(scale)).toFixed(18)
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
        args: [
          addresses,
          new Array(calls.length).fill(0),
          calls,
          'change basket',
        ], // fill with empty description
      },
    }
  }, [contracts])
}

// TODO: Build proposal
const ConfirmProposal = () => {
  const tx = useProposal()

  return (
    <Layout>
      <ProposalDetailNavigation />
      <ProposalDetail
        addresses={tx.call.args[0] as string[]}
        calldatas={tx.call.args[2] as string[]}
      />
      <ConfirmProposalOverview tx={tx} />
    </Layout>
  )
}

export default ConfirmProposal
