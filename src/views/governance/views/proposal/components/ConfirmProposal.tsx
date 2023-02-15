import { t } from '@lingui/macro'

import { basketAtom } from 'components/rtoken-setup/atoms'
import Layout from 'components/rtoken-setup/Layout'
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

// call: {
//   abi: 'governance',
//   address: governance.governor,
//   method: 'propose',
//   args: [
//     ['0x2b38755345B73f4F41533c80177C6eca55538F71'],
//     [0],
//     [
//       BackingManagerInterface.encodeFunctionData('setTradingDelay', [
//         2000,
//       ]),
//     ],
//     'test',
//   ],
// },

const useProposal = () => {
  const backupChanges = useAtomValue(backupChangesAtom)
  const revenueChanges = useAtomValue(revenueSplitChangesAtom)
  const parameterChanges = useAtomValue(parametersChangesAtom)
  const roleChanges = useAtomValue(roleChangesAtom)
  const newBasket = useAtomValue(isNewBasketProposedAtom)
  const basket = useAtomValue(basketAtom)
  const governance = useAtomValue(rTokenGovernanceAtom)
  const parameterMap = useAtomValue(parameterContractMapAtom)

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

    return {
      id: '',
      description: t`New proposal`,
      status: TRANSACTION_STATUS.PENDING,
      value: '0',
      call: {
        abi: 'governance',
        address: governance.governor,
        method: 'propose',
        args: [addresses, new Array(calls.length).fill(0), calls, ''], // fill with empty description
      },
    }
  }, [])
}

// TODO: Build proposal
const ConfirmProposal = () => {
  const tx = useProposal()

  return (
    <Layout>
      <ProposalDetailNavigation />
      <ProposalDetail />
      <ConfirmProposalOverview />
    </Layout>
  )
}

export default ConfirmProposal
