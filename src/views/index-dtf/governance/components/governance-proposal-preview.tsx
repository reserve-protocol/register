import { Skeleton } from '@/components/ui/skeleton'

import { useAtomValue } from 'jotai'

import { Address, decodeFunctionData, getAbiItem } from 'viem'

import dtfIndexAbi from '@/abis/dtf-index-abi'
import dtfIndexGovernance from '@/abis/dtf-index-governance'
import dtfIndexStakingVault from '@/abis/dtf-index-staking-vault'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { atom } from 'jotai'
import { Abi, Hex } from 'viem'
import { useMemo } from 'react'
import { DecodedCalldata } from '@/types'

const dtfAbiMapppingAtom = atom((get) => {
  const dtf = get(indexDTFAtom)

  if (!dtf) return undefined

  const abiMapping: Record<string, Abi> = {
    [dtf.id.toLowerCase()]: dtfIndexAbi,
  }

  if (dtf.ownerGovernance) {
    abiMapping[dtf.ownerGovernance.id.toLowerCase()] = dtfIndexGovernance
  }

  if (dtf.tradingGovernance) {
    abiMapping[dtf.tradingGovernance.id.toLowerCase()] = dtfIndexGovernance
  }

  if (dtf.stToken) {
    abiMapping[dtf.stToken.id.toLowerCase()] = dtfIndexStakingVault

    if (dtf.stToken.governance) {
      abiMapping[dtf.stToken.governance.id.toLowerCase()] = dtfIndexGovernance
    }
  }

  return abiMapping
})

const dtfContractAliasAtom = atom((get) => {
  const dtf = get(indexDTFAtom)

  if (!dtf) return undefined

  const aliasMapping: Record<string, string> = {
    [dtf.id.toLowerCase()]: 'Folio',
  }

  if (dtf.ownerGovernance) {
    aliasMapping[dtf.ownerGovernance.id.toLowerCase()] = 'Owner Governance'
  }

  if (dtf.tradingGovernance) {
    aliasMapping[dtf.tradingGovernance.id.toLowerCase()] = 'Trading Governance'
  }

  if (dtf.stToken) {
    aliasMapping[dtf.stToken.id.toLowerCase()] = 'Lock Vault'

    if (dtf.stToken.governance) {
      aliasMapping[dtf.stToken.governance.id.toLowerCase()] = 'Lock Governance'
    }
  }

  return aliasMapping
})

const useDecodedCalldatas = (
  targets: Address[] | undefined,
  calldatas: Hex[] | undefined
) => {
  const dtfAbiMapping = useAtomValue(dtfAbiMapppingAtom)
  const dtfContractAlias = useAtomValue(dtfContractAliasAtom)

  return useMemo(() => {
    if (!dtfAbiMapping || !targets || !calldatas) return [undefined, undefined]

    // TODO: In theory, call order is important, but most likely proposals will be contract independent
    const dataByContract: Record<string, DecodedCalldata[]> = {}
    const unknownContracts: Record<string, Hex[]> = {}

    for (let i = 0; i < targets.length; i++) {
      const target = targets[i]
      const calldata = calldatas[i]
      const abi = dtfAbiMapping[target.toLowerCase()]

      try {
        if (!abi) {
          throw new Error('No ABI found')
        }

        const { functionName, args } = decodeFunctionData({
          abi,
          data: calldata,
        })

        const result = getAbiItem({
          abi,
          name: functionName as string,
        })

        dataByContract[target.toLowerCase()] = [
          ...(dataByContract[target.toLowerCase()] || []),
          {
            signature: functionName,
            parameters:
              result && 'inputs' in result
                ? result.inputs.map((input) => `${input.name}: ${input.type}`)
                : [],
            callData: calldata,
            data: (args ?? []) as unknown as unknown[] as string[],
          },
        ]
      } catch (e) {
        // TODO: Should not happen but there could be an error on the ABI while upgrading?
        unknownContracts[target.toLowerCase()] = [
          ...(unknownContracts[target.toLowerCase()] || []),
          calldata,
        ]
      }
    }

    return [dataByContract, unknownContracts]
  }, [dtfAbiMapping, dtfContractAlias, targets, calldatas])
}

const ChangesOverviewComponentMap: Record<
  string,
  React.ComponentType<{ data: DecodedCalldata }>
> = {}

const GovernanceProposalPreview = ({
  targets,
  calldatas,
}: {
  targets: Address[] | undefined
  calldatas: Hex[] | undefined
}) => {
  const [dataByContract, unknownContracts] = useDecodedCalldatas(
    targets,
    calldatas
  )

  if (!dataByContract) {
    return <Skeleton className="h-80" />
  }

  console.log(dataByContract, unknownContracts)

  return <div>GovernanceProposalPreview</div>
}

export default GovernanceProposalPreview

// const ProposalChanges = () => {
//   const proposal = useAtomValue(proposalDetailAtom)
//   const dtf = useAtomValue(indexDTFAtom)
//   const basket = useAtomValue(indexDTFBasketAtom)
//   const shares = useAtomValue(indexDTFBasketSharesAtom)
//   const prices = useAtomValue(indexDTFBasketPricesAtom)

//   if (!proposal || !dtf) return <Skeleton className="h-80" />

//   if (
//     proposal.governor.toLowerCase() !== dtf.tradingGovernance?.id.toLowerCase()
//   ) {
//     return <div className="text-legend text-center py-8">Coming soon...</div>
//   }

//   return (
//     <BasketProposalPreview
//       calldatas={proposal.calldatas}
//       basket={basket}
//       shares={shares}
//       prices={prices}
//       address={dtf.id.toLowerCase() as Address}
//     />
//   )
// }
