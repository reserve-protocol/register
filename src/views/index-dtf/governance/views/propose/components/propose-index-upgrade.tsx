import dtfAdminAbi from '@/abis/dtf-admin-abi'
import DTFIndexGovernance from '@/abis/dtf-index-governance'
import { Button } from '@/components/ui/button'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFAtom, indexDTFVersionAtom } from '@/state/dtf/atoms'
import { ROUTES } from '@/utils/constants'
import { Trans, useLingui } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import { AlertCircle, Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { encodeFunctionData, keccak256, toHex } from 'viem'
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { useIsProposeAllowed } from '../../../hooks/use-is-propose-allowed'
import useRecentProposalReceipt from '../../../hooks/use-recent-proposal-receipt'

function compareVersion(x: string, y: string): number {
  return x.localeCompare(y, undefined, { numeric: true, sensitivity: 'base' })
}

const ProposeIndexUpgrade = () => {
  const { t } = useLingui()
  const navigate = useNavigate()
  const dtf = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)
  const { isProposeAllowed, isLoading } = useIsProposeAllowed()
  const version = useAtomValue(indexDTFVersionAtom)
  const handleRecentProposalReceipt = useRecentProposalReceipt()

  const upgrade =
    !isLoading &&
    isProposeAllowed &&
    version !== undefined &&
    compareVersion(version, '2.0.0') < 0

  const { writeContract, data: hash, isPending } = useWriteContract()
  const { data: receipt, isSuccess } = useWaitForTransactionReceipt({
    hash,
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
    if (!isSuccess || !receipt || !dtf?.ownerGovernance?.id) return

    void handleRecentProposalReceipt({
      receipt,
      governor: dtf.ownerGovernance.id,
      onFallback: () => {
        setTimeout(() => {
          navigate(`../${ROUTES.GOVERNANCE}`)
        }, 20000)
      },
    })
  }, [
    dtf?.ownerGovernance?.id,
    handleRecentProposalReceipt,
    isSuccess,
    navigate,
    receipt,
  ])

  if (!upgrade) {
    return null
  }

  return (
    <div className="sm:w-[408px] p-4 rounded-3xl bg-primary/10">
      <div className="flex flex-row items-center gap-2 ">
        <AlertCircle size={24} className="text-primary" />
        <div>
          <h4 className="font-bold text-primary">
            <Trans>Update available</Trans>
          </h4>
          <p className="text-sm">
            <Trans>
              Version 2.0.0 is now available.{' '}
              <a
                href="https://github.com/reserve-protocol/reserve-index-dtf/blob/main/CHANGELOG.md#release-200"
                className="text-primary"
                target="_blank"
              >
                View changelog
              </a>
            </Trans>
          </p>
        </div>
      </div>
      <Button
        disabled={!isReady || isPending || !!hash}
        onClick={handleUpgrade}
        className="w-full mt-2"
      >
        {(isPending || !!hash) && (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        )}
        {isPending && t`Pending, sign in wallet...`}
        {!isPending && !!hash && t`Waiting for confirmation...`}
        {!isPending && !hash && t`Create update proposal`}
      </Button>
    </div>
  )
}

export default ProposeIndexUpgrade
