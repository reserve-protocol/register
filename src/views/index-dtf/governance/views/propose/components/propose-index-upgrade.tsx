import dtfAdminAbi from '@/abis/dtf-admin-abi'
import dtfIndexAbi from '@/abis/dtf-index-abi'
import DTFIndexGovernance from '@/abis/dtf-index-governance'
import { Button } from '@/components/ui/button'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFAtom, indexDTFVersionAtom } from '@/state/dtf/atoms'
import { ROUTES } from '@/utils/constants'
import { useAtomValue } from 'jotai'
import { AlertCircle, Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { encodeFunctionData, keccak256, toHex } from 'viem'
import {
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'
import { useIsProposeAllowed } from '../../../hooks/use-is-propose-allowed'

function compareVersion(x: string, y: string): number {
  return x.localeCompare(y, undefined, { numeric: true, sensitivity: 'base' })
}

const ProposeIndexUpgrade = () => {
  const navigate = useNavigate()
  const dtf = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)
  const { isProposeAllowed, isLoading } = useIsProposeAllowed()
  const version = useAtomValue(indexDTFVersionAtom)

  const upgrade =
    !isLoading && isProposeAllowed && compareVersion(version, '2.0.0') < 0

  const { writeContract, data, isPending } = useWriteContract()
  const { isSuccess } = useWaitForTransactionReceipt({
    hash: data,
    chainId,
  })
  const isReady = dtf?.proxyAdmin && dtf?.ownerGovernance?.id

  const handleUpgrade = () => {
    if (!dtf?.proxyAdmin || !dtf?.ownerGovernance?.id) return

    writeContract({
      address: dtf.ownerGovernance.id,
      abi: DTFIndexGovernance,
      functionName: 'propose',
      args: [
        [dtf.proxyAdmin],
        [0n],
        [
          encodeFunctionData({
            abi: dtfAdminAbi,
            functionName: 'upgradeToVersion',
            args: [dtf.id, keccak256(toHex('2.0.0')), '0x'],
          }),
        ],
        'Upgrade to version 2.0.0',
      ],
      chainId,
    })
  }

  useEffect(() => {
    if (isSuccess) {
      // Give some time for the proposal to be created on the subgraph
      setTimeout(() => {
        navigate(`../${ROUTES.GOVERNANCE}`)
      }, 20000) // TODO: who knows if this works well!!! they can just refresh the page
    }
  }, [isSuccess])

  if (!upgrade) {
    return null
  }

  return (
    <div className="sm:w-[408px] p-4 rounded-3xl bg-primary/10">
      <div className="flex flex-row items-center gap-2 ">
        <AlertCircle size={24} className="text-primary" />
        <div>
          <h4 className="font-bold text-primary">Update available</h4>
          <p className="text-sm">
            Version 2.0.0 is now available.{' '}
            <a href="" className="text-primary">
              View changelog
            </a>
          </p>
        </div>
      </div>
      <Button
        disabled={!isReady || isPending || !!data}
        onClick={handleUpgrade}
        className="w-full mt-2"
      >
        {(isPending || !!data) && (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        )}
        {isPending && 'Pending, sign in wallet...'}
        {!isPending && !!data && 'Waiting for confirmation...'}
        {!isPending && !data && 'Create update proposal'}
      </Button>
    </div>
  )
}

export default ProposeIndexUpgrade
