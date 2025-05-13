import dtfAdminAbi from '@/abis/dtf-admin-abi'
import dtfIndexAbi from '@/abis/dtf-index-abi'
import DTFIndexGovernance from '@/abis/dtf-index-governance'
import stakingVaultAbi from '@/abis/dtf-index-staking-vault'
import { Button } from '@/components/ui/button'
import { getProposalState, PartialProposal } from '@/lib/governance'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { getCurrentTime } from '@/utils'
import { ChainId } from '@/utils/chains'
import { PROPOSAL_STATES } from '@/utils/constants'
import { useAtomValue, useSetAtom } from 'jotai'
import { AlertCircle, Loader2 } from 'lucide-react'
import { useCallback, useEffect } from 'react'
import {
  encodeFunctionData,
  getAddress,
  isAddressEqual,
  keccak256,
  pad,
  toBytes,
} from 'viem'
import {
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'
import { governanceProposalsAtom, refetchTokenAtom } from '../../../atoms'
import { useIsProposeAllowed } from '../../../hooks/use-is-propose-allowed'

export const spellAbi = [
  {
    type: 'constructor',
    inputs: [
      {
        name: '_governanceDeployer',
        type: 'address',
        internalType: 'contract GovernanceDeployer',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'exceptions',
    inputs: [
      {
        name: 'stakingVaultGovernor',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: 'votingDelayMultiplier',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'votingPeriodMultiplier',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'executionDelayMultiplier',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'governanceDeployer',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'contract GovernanceDeployer',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'upgradeFolioGovernance',
    inputs: [
      { name: 'folio', type: 'address', internalType: 'contract Folio' },
      {
        name: 'proxyAdmin',
        type: 'address',
        internalType: 'contract FolioProxyAdmin',
      },
      {
        name: 'oldOwnerGovernor',
        type: 'address',
        internalType: 'contract FolioGovernor',
      },
      {
        name: 'oldTradingGovernor',
        type: 'address',
        internalType: 'contract FolioGovernor',
      },
      { name: 'ownerGuardians', type: 'address[]', internalType: 'address[]' },
      {
        name: 'tradingGuardians',
        type: 'address[]',
        internalType: 'address[]',
      },
      { name: 'deploymentNonce', type: 'bytes32', internalType: 'bytes32' },
    ],
    outputs: [
      { name: 'newOwnerGovernor', type: 'address', internalType: 'address' },
      { name: 'newTradingGovernor', type: 'address', internalType: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'upgradeStakingVaultGovernance',
    inputs: [
      {
        name: 'stakingVault',
        type: 'address',
        internalType: 'contract Ownable',
      },
      {
        name: 'oldGovernor',
        type: 'address',
        internalType: 'contract FolioGovernor',
      },
      { name: 'guardians', type: 'address[]', internalType: 'address[]' },
      { name: 'deploymentNonce', type: 'bytes32', internalType: 'bytes32' },
    ],
    outputs: [
      { name: 'newGovernor', type: 'address', internalType: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'version',
    inputs: [],
    outputs: [{ name: '', type: 'string', internalType: 'string' }],
    stateMutability: 'pure',
  },
] as const

export const spellAddress = {
  [ChainId.Mainnet]: getAddress('0x4491b242f15f8dc9c6dfbb9a08edbbaae2623199'),
  [ChainId.Base]: getAddress('0x587cefb69473ad467993c6dd3a8f202bf1ef5e2a'),
}

const UPGRADE_FOLIO_MESSAGE = 'Upgrade Folio Governance'
const UPGRADE_FOLIO_DAO_MESSAGE = 'Upgrade Folio DAO Governor'

const queryParams = {
  staleTime: 5 * 60 * 1000,
  refetchInterval: 5 * 60 * 1000,
} as const

type SpellUpgradeProps = {
  refetch: () => void
}

const ProposeGovernanceSpell31032025Folio = ({
  refetch,
}: SpellUpgradeProps) => {
  const dtf = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)
  const spell = spellAddress[chainId]

  const { data: qdOwnerGov } = useReadContract({
    abi: DTFIndexGovernance,
    address: dtf?.ownerGovernance?.id,
    functionName: 'quorumDenominator',
    chainId,
    query: queryParams,
  })

  const { writeContract, data, isPending } = useWriteContract()

  const { isSuccess } = useWaitForTransactionReceipt({
    hash: data,
    chainId,
  })

  const isReady =
    dtf?.id &&
    dtf?.proxyAdmin &&
    dtf?.ownerGovernance?.id &&
    dtf?.tradingGovernance?.id
  const proposalAvailable = !!spell && qdOwnerGov === 100n

  const handlePropose = () => {
    if (!dtf || !spell) return
    if (!dtf.ownerGovernance || !dtf.tradingGovernance || qdOwnerGov !== 100n)
      return

    const oldOwnerGovernor = dtf.ownerGovernance.id
    const oldTradingGovernor = dtf.tradingGovernance.id

    const ownerGuardians = dtf.ownerGovernance.timelock.guardians.filter(
      (guardian) => !isAddressEqual(guardian, oldOwnerGovernor)
    )
    const tradingGuardians = dtf.tradingGovernance.timelock.guardians.filter(
      (guardian) => !isAddressEqual(guardian, oldTradingGovernor)
    )

    writeContract({
      address: dtf.ownerGovernance.id,
      abi: DTFIndexGovernance,
      functionName: 'propose',
      args: [
        [dtf.id, dtf.proxyAdmin, spell],
        [0n, 0n, 0n],
        [
          encodeFunctionData({
            abi: dtfIndexAbi,
            functionName: 'grantRole',
            args: [pad('0x0', { size: 32 }), spell],
          }),
          encodeFunctionData({
            abi: dtfAdminAbi,
            functionName: 'transferOwnership',
            args: [spell],
          }),
          encodeFunctionData({
            abi: spellAbi,
            functionName: 'upgradeFolioGovernance',
            args: [
              dtf.id,
              dtf.proxyAdmin,
              oldOwnerGovernor,
              oldTradingGovernor,
              ownerGuardians,
              tradingGuardians,
              keccak256(toBytes(getCurrentTime())),
            ],
          }),
        ],
        UPGRADE_FOLIO_MESSAGE,
      ],
    })
  }

  useEffect(() => {
    if (isSuccess) {
      // Give some time for the proposal to be created on the subgraph
      setTimeout(() => {
        refetch()
      }, 10000)
    }
  }, [isSuccess])

  if (!proposalAvailable) {
    return null
  }

  return (
    <div className="sm:w-[408px] p-4 rounded-3xl bg-primary/10">
      <div className="flex flex-row items-center gap-2 ">
        <AlertCircle size={24} className="text-primary" />
        <div>
          <h4 className="font-bold text-primary">
            Upgrade Folio Governance (1/2):
          </h4>
          <p className="text-sm">
            This upgrade spell fixes the proposal-threshold on the Admin and
            Basket FolioGovernor contracts that manage this DTF. Once this spell
            is approved and executed, the proposal-threshold will be the correct
            % that was initially intended at deployment.
          </p>
        </div>
      </div>
      <Button
        disabled={!isReady || isPending || !!data}
        onClick={handlePropose}
        className="w-full mt-2"
      >
        {(isPending || !!data) && (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        )}
        {isPending && 'Pending, sign in wallet...'}
        {!isPending && !!data && 'Waiting for confirmation...'}
        {!isPending && !data && 'Create Spell Proposal'}
      </Button>
    </div>
  )
}

const ProposeGovernanceSpell31032025StakingVault = ({
  refetch,
}: SpellUpgradeProps) => {
  const dtf = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)
  const spell = spellAddress[chainId]

  const { data: qdStakingVaultGov } = useReadContract({
    abi: DTFIndexGovernance,
    address: dtf?.stToken?.governance?.id,
    functionName: 'quorumDenominator',
    chainId,
    query: queryParams,
  })

  const { writeContract, data, isPending } = useWriteContract()

  const { isSuccess } = useWaitForTransactionReceipt({
    hash: data,
    chainId,
  })

  const isReady = dtf?.id && dtf?.proxyAdmin && dtf?.stToken?.governance?.id
  const proposalAvailable = !!spell && qdStakingVaultGov === 100n

  const handlePropose = () => {
    if (!dtf || !spell) return
    if (!dtf?.stToken?.governance || qdStakingVaultGov !== 100n) return

    const oldGovernor = dtf.stToken.governance.id
    const guardians = dtf.stToken.governance.timelock.guardians.filter(
      (guardian) => !isAddressEqual(guardian, oldGovernor)
    )

    writeContract({
      address: dtf.stToken.governance.id,
      abi: DTFIndexGovernance,
      functionName: 'propose',
      args: [
        [dtf.stToken.id, spell],
        [0n, 0n],
        [
          encodeFunctionData({
            abi: stakingVaultAbi,
            functionName: 'transferOwnership',
            args: [spell],
          }),
          encodeFunctionData({
            abi: spellAbi,
            functionName: 'upgradeStakingVaultGovernance',
            args: [
              dtf.stToken.id,
              oldGovernor,
              guardians,
              keccak256(toBytes(getCurrentTime())),
            ],
          }),
        ],
        UPGRADE_FOLIO_DAO_MESSAGE,
      ],
    })
  }

  useEffect(() => {
    if (isSuccess) {
      // Give some time for the proposal to be created on the subgraph
      setTimeout(() => {
        refetch()
      }, 10000)
    }
  }, [isSuccess])

  if (!proposalAvailable) {
    return null
  }

  return (
    <div className="sm:w-[408px] p-4 rounded-3xl bg-primary/10">
      <div className="flex flex-row items-center gap-2 ">
        <AlertCircle size={24} className="text-primary" />
        <div>
          <h4 className="font-bold text-primary">
            Upgrade Folio DAO Governor (2/2):
          </h4>
          <p className="text-sm">
            This upgrade spell fixes the proposal-threshold on the FolioGovernor
            contract that administers the DAO (StakingVault) relevant to this
            DTF. Once this spell is approved and executed, the
            proposal-threshold will be the correct % that was initially intended
            at deployment.
          </p>
        </div>
      </div>
      <Button
        disabled={!isReady || isPending || !!data}
        onClick={handlePropose}
        className="w-full mt-2"
      >
        {(isPending || !!data) && (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        )}
        {isPending && 'Pending, sign in wallet...'}
        {!isPending && !!data && 'Waiting for confirmation...'}
        {!isPending && !data && 'Create Spell Proposal'}
      </Button>
    </div>
  )
}

const validProposalExists = (
  proposals: PartialProposal[],
  description: string
): boolean => {
  const states = [
    PROPOSAL_STATES.PENDING,
    PROPOSAL_STATES.ACTIVE,
    PROPOSAL_STATES.SUCCEEDED,
    PROPOSAL_STATES.QUEUED,
    PROPOSAL_STATES.EXECUTED,
  ]
  return proposals.some((p) => {
    if (p.description !== description) {
      return false
    }

    const pState = getProposalState(p)

    if (pState.state === PROPOSAL_STATES.EXPIRED) {
      return false
    }

    return states.includes(pState.state)
  })
}

// TODO(jg): Enable Staking Vault spell when DAO gov is fixed
export default function ProposeGovernanceSpell31032025() {
  const { isProposeAllowed } = useIsProposeAllowed()
  const proposals = useAtomValue(governanceProposalsAtom)
  const indexDTF = useAtomValue(indexDTFAtom)
  const setRefetchToken = useSetAtom(refetchTokenAtom)

  const refetch = useCallback(() => {
    setRefetchToken(getCurrentTime())
  }, [setRefetchToken])

  if (
    !isProposeAllowed ||
    !proposals ||
    indexDTF?.id === '0x323c03c48660fE31186fa82c289b0766d331Ce21'.toLowerCase()
  )
    return null

  const existsFolioUpgrade = validProposalExists(
    proposals,
    UPGRADE_FOLIO_MESSAGE
  )
  const existsFolioDaoUpgrade = validProposalExists(
    proposals,
    UPGRADE_FOLIO_DAO_MESSAGE
  )

  return (
    <>
      {!existsFolioUpgrade && (
        <ProposeGovernanceSpell31032025Folio refetch={refetch} />
      )}
      {!existsFolioDaoUpgrade && false && (
        <ProposeGovernanceSpell31032025StakingVault refetch={refetch} />
      )}
    </>
  )
}
