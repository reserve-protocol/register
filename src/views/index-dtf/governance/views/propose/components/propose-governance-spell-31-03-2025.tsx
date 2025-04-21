import dtfIndexAbi from '@/abis/dtf-index-abi'
import dtfAdminAbi from '@/abis/dtf-admin-abi'
import stakingVaultAbi from '@/abis/dtf-index-staking-vault'
import DTFIndexGovernance from '@/abis/dtf-index-governance'
import { Button } from '@/components/ui/button'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { ROUTES } from '@/utils/constants'
import { useAtomValue } from 'jotai'
import { AlertCircle, Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  encodeFunctionData,
  keccak256,
  parseAbi,
  toBytes,
  zeroAddress,
} from 'viem'
import {
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'
import { useIsProposeAllowed } from '../../../hooks/use-is-propose-allowed'
import { ChainId } from '@/utils/chains'
import { getCurrentTime } from '@/utils'

const spellAbi = parseAbi([
  'function upgradeStakingVaultGovernance(address stakingVault, address oldGovernor, address[] calldata guardians, bytes32 deploymentNonce) external returns (address newGovernor)',
  'function upgradeFolioGovernance(address folio, address proxyAdmin, address oldOwnerGovernor, address oldTradingGovernor, address[] calldata ownerGuardians, address[] calldata tradingGuardians, bytes32 deploymentNonce) external returns (address newOwnerGovernor, address newTradingGovernor)',
])

const spellAddress = {
  [ChainId.Mainnet]: zeroAddress,
  [ChainId.Base]: zeroAddress,
}

const queryParams = {
  staleTime: 5 * 60 * 1000,
  refetchInterval: 5 * 60 * 1000,
} as const

const ProposeGovernanceSpell31032025 = () => {
  const navigate = useNavigate()
  const dtf = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)
  const spell = spellAddress[chainId]

  const { isProposeAllowed, isLoading } = useIsProposeAllowed()
  const { data: qdOwnerGov } = useReadContract({
    abi: DTFIndexGovernance,
    address: dtf?.ownerGovernance?.id,
    functionName: 'quorumDenominator',
    chainId,
    query: queryParams,
  })

  const { data: qdStakingVaultGov } = useReadContract({
    abi: DTFIndexGovernance,
    address: dtf?.stToken?.governance?.id,
    functionName: 'quorumDenominator',
    chainId,
    query: queryParams,
  })

  const {
    writeContract: wc0,
    data: data0,
    isPending: isPending0,
  } = useWriteContract()
  const {
    writeContract: wc1,
    data: data1,
    isPending: isPending1,
  } = useWriteContract()

  const { isSuccess: isSuccess0 } = useWaitForTransactionReceipt({
    hash: data0,
    chainId,
  })
  const { isSuccess: isSuccess1 } = useWaitForTransactionReceipt({
    hash: data1,
    chainId,
  })

  const proposalAvailable =
    !isLoading &&
    isProposeAllowed &&
    !!spell &&
    spell !== zeroAddress &&
    (qdOwnerGov === 100n || qdStakingVaultGov === 100n)
  const isReady = dtf?.id && dtf?.proxyAdmin && dtf?.ownerGovernance?.id

  const handlePropose = () => {
    if (!dtf || !spell || spell === zeroAddress) return

    if (dtf.ownerGovernance && dtf.tradingGovernance && qdOwnerGov === 100n) {
      wc0({
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
              args: ['0x00', spell],
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
                dtf.ownerGovernance.id,
                dtf.tradingGovernance.id,
                dtf.ownerGovernance.timelock.guardians,
                dtf.tradingGovernance.timelock.guardians,
                keccak256(toBytes(getCurrentTime())),
              ],
            }),
          ],
          'Execute Governance Spell on Folio Governance',
        ],
      })
    }

    if (
      dtf.stToken &&
      dtf.stToken.governance?.id &&
      qdStakingVaultGov === 100n
    ) {
      wc1({
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
                dtf.stToken.governance.id,
                dtf.stToken.governance.timelock.guardians,
                keccak256(toBytes(getCurrentTime())),
              ],
            }),
          ],
          'Execute Governance Spell on Staking Vault',
        ],
      })
    }
  }

  useEffect(() => {
    if (isSuccess0 && isSuccess1) {
      // Give some time for the proposal to be created on the subgraph
      setTimeout(() => {
        navigate(`../${ROUTES.GOVERNANCE}`)
      }, 20000) // TODO: who knows if this works well!!! they can just refresh the page
    }
  }, [isSuccess0, isSuccess1])

  if (!proposalAvailable) {
    return null
  }

  return (
    <div className="sm:w-[408px] p-4 rounded-3xl bg-primary/10">
      <div className="flex flex-row items-center gap-2 ">
        <AlertCircle size={24} className="text-primary" />
        <div>
          <h4 className="font-bold text-primary">Upgrade spell available</h4>
          <p className="text-sm">
            This upgrade spell fixes the proposal-threshold on all deployed
            FolioGovernor contracts. Once this spell is approved and executed,
            the proposal-threshold will be the correct % that was initially
            intended at deployment (100x lower than what it currently is).
          </p>
        </div>
      </div>
      <Button
        disabled={!isReady || isPending0 || isPending1 || !!data0 || !!data1}
        onClick={handlePropose}
        className="w-full mt-2"
      >
        {(isPending0 || !!data0 || isPending1 || !!data1) && (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        )}
        {(isPending0 || isPending1) && 'Pending, sign in wallet...'}
        {((!isPending0 && !!data0) || (!isPending1 && !!data1)) &&
          'Waiting for confirmation...'}
        {!isPending0 &&
          !data0 &&
          !isPending1 &&
          !data0 &&
          'Create Spell Proposals'}
      </Button>
    </div>
  )
}

export default ProposeGovernanceSpell31032025
