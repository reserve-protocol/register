import { Skeleton } from '@/components/ui/skeleton'
import { useAtomValue } from 'jotai'
import { Address, Hex } from 'viem'
import { dtfContractAliasAtom } from './proposal-preview/atoms'
import ContractProposalChanges from './proposal-preview/contract-proposal-changes'
import FolioChangePreview from './proposal-preview/folio-change-preview'
import useDecodedCalldatas from '../../../../hooks/use-decoded-call-datas'
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
 * @param timestamp - the timestamp when the proposal was created, undefined if is proposal preview
 * The component uses decoded calldata to present a human-readable representation of the
 * on-chain actions that would be executed if the proposal passes.
 */

const GovernanceProposalPreview = ({
  targets,
  calldatas,
  timestamp,
}: {
  targets: Address[] | undefined
  calldatas: Hex[] | undefined
  timestamp?: number
}) => {
  const alias = useAtomValue(dtfContractAliasAtom)
  const { dataByContract, unknownContracts } = useDecodedCalldatas(
    targets,
    calldatas
  )

  if (!dataByContract.length && !unknownContracts.length) {
    return <Skeleton className="h-80" />
  }

  return (
    <>
      {dataByContract.map(([contract, decodedCalldatas], index) =>
        alias?.[contract] === 'Folio' ? (
          <FolioChangePreview
            key={`folio-${contract}-${index}`}
            decodedCalldata={decodedCalldatas}
            address={contract as Address}
            timestamp={timestamp}
          />
        ) : (
          <ContractProposalChanges
            key={`contract-${contract}-${index}`}
            decodedCalldatas={decodedCalldatas}
            address={contract as Address}
          />
        )
      )}
      {unknownContracts.map(([contract, calls], index) => (
        <UnknownContractPreview
          key={`unknown-${contract}-${index}`}
          contract={contract}
          calls={calls}
        />
      ))}
    </>
  )
}

export default GovernanceProposalPreview
