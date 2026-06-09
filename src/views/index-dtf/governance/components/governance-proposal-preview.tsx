import { indexDTFAtom } from '@/state/dtf/atoms'
import type { DecodedCalldata, IndexDTF } from '@/types'
import {
  type IndexDtfDecodedCalldata,
  type IndexDtfProposalDecoded,
  type IndexDtfProposalDtfContractContext,
  type IndexDtfProposalGovernanceContractContext,
  useIndexDtfIdentity,
  useIndexDtfProposalDecode,
} from '@reserve-protocol/react-sdk'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { Address, Hex } from 'viem'
import { dtfContractAliasAtom } from './proposal-preview/atoms'
import ContractProposalChanges from './proposal-preview/contract-proposal-changes'
import FolioChangePreview from './proposal-preview/folio-change-preview'
import UnknownContractPreview from './proposal-preview/unknown-contract-preview'
import GovernanceProposalPreviewSkeleton from './proposal-preview/governance-proposal-preview-skeleton'

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
  decoded,
  proposalGovernance,
  timestamp,
}: {
  targets: Address[] | undefined
  calldatas: Hex[] | undefined
  decoded?: IndexDtfProposalDecoded
  proposalGovernance?: IndexDtfProposalGovernanceContractContext
  timestamp?: number
}) => {
  const dtf = useAtomValue(indexDTFAtom)
  const alias = useAtomValue(dtfContractAliasAtom)
  const { chainId } = useIndexDtfIdentity()
  const dtfContext = useMemo(
    () => (dtf ? getDtfContractContext(dtf) : undefined),
    [dtf]
  )
  const decodeParams =
    dtfContext &&
    targets?.length &&
    calldatas?.length &&
    (!decoded || decoded.unknownCalls.length > 0)
      ? {
          chainId,
          targets,
          calldatas,
          dtf: dtfContext,
          ...(proposalGovernance ? { proposalGovernance } : {}),
        }
      : undefined
  const { data: decodedData } = useIndexDtfProposalDecode(decodeParams)
  const proposalDecoded = decodedData ?? decoded
  const decodedGroups = useMemo(
    () =>
      proposalDecoded?.dataByContract.map((group) => ({
        target: group.target,
        contract: group.contract,
        calls: group.calls.map(mapDecodedCall),
      })) ?? [],
    [proposalDecoded]
  )
  const unknownGroups = useMemo(
    () =>
      proposalDecoded?.unknownContracts.map((group) => ({
        target: group.target,
        calls: group.calls.map((call) => call.callData),
      })) ?? [],
    [proposalDecoded]
  )

  if (!decodedGroups.length && !unknownGroups.length)
    return <GovernanceProposalPreviewSkeleton />

  return (
    <>
      {decodedGroups.map((group, index) =>
        group.contract === 'Index DTF' || alias?.[group.target.toLowerCase()] === 'Folio' ? (
          <FolioChangePreview
            key={`folio-${group.target}-${index}`}
            decodedCalldata={group.calls}
            address={group.target}
            timestamp={timestamp}
          />
        ) : (
          <ContractProposalChanges
            key={`contract-${group.target}-${index}`}
            decodedCalldatas={group.calls}
            address={group.target}
            contractName={group.contract}
          />
        )
      )}
      {unknownGroups.map((group, index) => (
        <UnknownContractPreview
          key={`unknown-${group.target}-${index}`}
          contract={group.target}
          calls={group.calls}
        />
      ))}
    </>
  )
}

function mapDecodedCall(call: IndexDtfDecodedCalldata): DecodedCalldata {
  return {
    signature: call.functionName,
    parameters: [...call.parameters],
    callData: call.callData,
    data: [...call.params],
  }
}

function getDtfContractContext(dtf: IndexDTF): IndexDtfProposalDtfContractContext | undefined {
  if (!dtf.stToken) return undefined

  return {
    address: dtf.id,
    proxyAdmin: dtf.proxyAdmin,
    legacyAdminGovernance: dtf.legacyAdmins,
    legacyTradingGovernance: dtf.legacyAuctionApprovers,
    ...(dtf.ownerGovernance
      ? {
          ownerGovernance: {
            address: dtf.ownerGovernance.id,
            timelock: dtf.ownerGovernance.timelock.id,
          },
        }
      : {}),
    ...(dtf.tradingGovernance
      ? {
          tradingGovernance: {
            address: dtf.tradingGovernance.id,
            timelock: dtf.tradingGovernance.timelock.id,
          },
        }
      : {}),
    stakingToken: {
      address: dtf.stToken.id,
      legacyGovernance: dtf.stToken.legacyGovernance,
      ...(dtf.stToken.governance
        ? {
            governance: {
              address: dtf.stToken.governance.id,
              timelock: dtf.stToken.governance.timelock.id,
            },
          }
        : {}),
    },
  }
}

export default GovernanceProposalPreview
