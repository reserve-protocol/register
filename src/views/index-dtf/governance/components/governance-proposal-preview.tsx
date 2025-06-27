import { Skeleton } from '@/components/ui/skeleton'
import { useAtomValue } from 'jotai'
import { Address, Hex } from 'viem'
import { dtfContractAliasAtom } from './proposal-preview/atoms'
import ContractProposalChanges from './proposal-preview/contract-proposal-changes'
import FolioChangePreview from './proposal-preview/folio-change-preview'
import useDecodedCalldatas from './proposal-preview/use-decoded-call-datas'
import UnknownContractPreview from './proposal-preview/unknown-contract-preview'

/**
 * GovernanceProposalPreview Component
 *
 * Renders a preview of governance proposals by decoding calldata for different contract interactions.
 * It handles three types of proposals:
 * 1. Folio-specific changes (displayed with FolioChangePreview)
 * 2. Known contract interactions (displayed with ContractProposalChanges)
 * 3. Unknown contract interactions (displayed with UnknownContractPreview)
 *
 * The component uses decoded calldata to present a human-readable representation of the
 * on-chain actions that would be executed if the proposal passes.
 */

const GovernanceProposalPreview = ({
  targets,
  calldatas,
}: {
  targets: Address[] | undefined
  calldatas: Hex[] | undefined
}) => {
  const alias = useAtomValue(dtfContractAliasAtom)
  const [dataByContract, unknownContracts] = useDecodedCalldatas(
    targets,
    calldatas
  )

  if (!dataByContract) {
    return <Skeleton className="h-80" />
  }

  return (
    <div className="flex flex-col gap-1">
      {Object.entries(dataByContract).map(([contract, decodedCalldatas]) =>
        alias?.[contract] === 'Folio' ? (
          <FolioChangePreview
            key={`folio-${contract}`}
            decodedCalldata={decodedCalldatas}
            address={contract as Address}
          />
        ) : (
          <ContractProposalChanges
            key={contract}
            decodedCalldatas={decodedCalldatas}
            address={contract as Address}
          />
        )
      )}
      {Object.keys(unknownContracts ?? {}).map((contract) => (
        <UnknownContractPreview
          key={contract}
          contract={contract}
          calls={(unknownContracts?.[contract] ?? []) as Hex[]}
        />
      ))}
    </div>
  )
}

export default GovernanceProposalPreview
