import { Button } from '@/components/ui/button'
import { formatPercentage, shortenAddress } from '@/utils'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { useAtom, useAtomValue } from 'jotai'
import { useFormContext } from 'react-hook-form'
import {
  DollarSign,
  ArrowRight,
  Undo,
  PlusCircle,
  MinusCircle,
  ArrowUpRight,
  Edit2,
} from 'lucide-react'
import {
  revenueDistributionChangesAtom,
  dtfRevenueChangesAtom,
  feeRecipientsAtom,
  hasRevenueDistributionChangesAtom,
  hasDtfRevenueChangesAtom,
} from '../../atoms'
import { ChangeSection, RevertButton } from './shared'
import { Link } from 'react-router-dom'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { chainIdAtom } from '@/state/atoms'
import { cn } from '@/lib/utils'

interface FeeChangeProps {
  title: string
  currentFee: number
  newFee: number
  onRevert: () => void
}

const FeeChange = ({ title, currentFee, newFee, onRevert }: FeeChangeProps) => (
  <div className="flex items-center gap-2 p-4 rounded-2xl bg-muted/70 border">
    <Edit2 size={16} className="text-primary" />
    <div className="mr-auto">
      <div className="text-sm font-medium">{title}</div>
      <div className="flex items-center gap-3 text-sm">
        <span className="text-muted-foreground">
          {formatPercentage(currentFee)}
        </span>
        <ArrowRight size={16} className="text-primary" />
        <span className="text-primary font-medium">
          {formatPercentage(newFee)}
        </span>
      </div>
    </div>
    <Button
      variant="outline"
      size="xs"
      className="rounded-full"
      onClick={onRevert}
    >
      <Undo size={12} />
    </Button>
  </div>
)

interface RevenueDistributionChangeProps {
  governanceShareChange?: { current: number; new: number }
  deployerShareChange?: { current: number; new: number }
  additionalRecipients?: { address: string; share: number }[]
  currentAdditionalRecipients: { address: string; share: number }[]
  onRevertGovernance: () => void
  onRevertDeployer: () => void
  onRevertAdditionalRecipients: (
    recipients: { address: string; share: number }[]
  ) => void
  onRevertAll: () => void
}

const RevenueDistributionChange = ({
  governanceShareChange,
  deployerShareChange,
  additionalRecipients,
  currentAdditionalRecipients,
  onRevertGovernance,
  onRevertDeployer,
  onRevertAdditionalRecipients,
  onRevertAll,
}: RevenueDistributionChangeProps) => (
  <div className="p-2 rounded-lg bg-muted/70 border space-y-3">
    <div className="flex items-center justify-between p-2 pb-0">
      <div className="text-sm font-medium">Revenue Distribution</div>
      <RevertButton onClick={onRevertAll} label="Revert All" />
    </div>
    <div className="space-y-2">
      {governanceShareChange && (
        <div className="flex items-center gap-2 border rounded-2xl p-2">
          <Edit2 size={16} className="text-primary" />
          <div className="flex flex-col gap-1 mr-auto">
            <h4 className="text-sm text-primary">Governance Share</h4>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-muted-foreground">
                {formatPercentage(governanceShareChange.current)}
              </span>
              <ArrowRight size={12} className="text-primary" />
              <span className="text-primary font-medium">
                {formatPercentage(governanceShareChange.new)}
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            size="xs"
            className="rounded-full"
            onClick={onRevertGovernance}
          >
            <Undo size={12} />
          </Button>
        </div>
      )}
      {deployerShareChange && (
        <div className="flex items-center gap-2 border rounded-2xl p-2">
          <Edit2 size={16} className="text-primary" />
          <div className="flex flex-col gap-1 mr-auto">
            <h4 className="text-sm text-primary">Creator Share</h4>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-muted-foreground">
                {formatPercentage(deployerShareChange.current)}
              </span>
              <ArrowRight size={12} className="text-primary" />
              <span className="text-primary font-medium">
                {formatPercentage(deployerShareChange.new)}
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            size="xs"
            className="rounded-full"
            onClick={onRevertDeployer}
          >
            <Undo size={12} />
          </Button>
        </div>
      )}

      {additionalRecipients !== undefined && (
        <div className="mt-3 space-y-2">
          <div className="text-xs font-medium">Additional Recipients:</div>
          <AdditionalRecipientsChanges
            current={currentAdditionalRecipients}
            proposed={additionalRecipients}
            onRevert={onRevertAdditionalRecipients}
          />
        </div>
      )}
    </div>
  </div>
)

// Helper component for additional recipients changes
const AdditionalRecipientsChanges = ({
  current,
  proposed,
  onRevert,
}: {
  current: { address: string; share: number }[]
  proposed: { address: string; share: number }[]
  onRevert: (recipients: { address: string; share: number }[]) => void
}) => {
  const chainId = useAtomValue(chainIdAtom)
  // Find added recipients
  const added = proposed.filter(
    (propRecipient) =>
      !current.some(
        (currRecipient) =>
          currRecipient.address.toLowerCase() ===
          propRecipient.address.toLowerCase()
      )
  )

  // Find removed recipients
  const removed = current.filter(
    (currRecipient) =>
      !proposed.some(
        (propRecipient) =>
          propRecipient.address.toLowerCase() ===
          currRecipient.address.toLowerCase()
      )
  )

  // Find modified recipients (same address, different share)
  const modified = proposed
    .filter((propRecipient) => {
      const currentRecipient = current.find(
        (curr) =>
          curr.address.toLowerCase() === propRecipient.address.toLowerCase()
      )
      return currentRecipient && currentRecipient.share !== propRecipient.share
    })
    .map((propRecipient) => {
      const currentRecipient = current.find(
        (curr) =>
          curr.address.toLowerCase() === propRecipient.address.toLowerCase()
      )!
      return {
        address: propRecipient.address,
        currentShare: currentRecipient.share,
        newShare: propRecipient.share,
      }
    })

  const handleRevertAdd = (address: string) => {
    const newProposed = proposed.filter(
      (r) => r.address.toLowerCase() !== address.toLowerCase()
    )
    onRevert(newProposed)
  }

  const handleRevertRemove = (recipient: {
    address: string
    share: number
  }) => {
    const newProposed = [...proposed, recipient]
    onRevert(newProposed)
  }

  const handleRevertModify = (address: string, originalShare: number) => {
    const newProposed = proposed.map((r) =>
      r.address.toLowerCase() === address.toLowerCase()
        ? { ...r, share: originalShare }
        : r
    )
    onRevert(newProposed)
  }

  return (
    <div className="flex flex-col gap-2">
      {added.map((recipient) => (
        <div
          key={recipient.address}
          className="flex items-center gap-2 border rounded-2xl p-2"
        >
          <PlusCircle className="text-success" size={16} />
          <div className="flex flex-col gap-1 mr-auto">
            <h4 className="text-sm text-success">Added</h4>
            <div className="flex items-center gap-2">
              <Link
                className="text-sm text-legend flex items-center gap-1"
                to={getExplorerLink(
                  recipient.address,
                  chainId,
                  ExplorerDataType.ADDRESS
                )}
                target="_blank"
              >
                {shortenAddress(recipient.address)}
                <ArrowUpRight size={12} />
              </Link>
              <span className="text-sm text-muted-foreground">
                ({recipient.share}%)
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            size="xs"
            className="rounded-full"
            onClick={() => handleRevertAdd(recipient.address)}
          >
            <Undo size={12} />
          </Button>
        </div>
      ))}

      {removed.map((recipient) => (
        <div
          key={recipient.address}
          className="flex items-center gap-2 border rounded-2xl p-2"
        >
          <MinusCircle className="text-destructive" size={16} />
          <div className="flex flex-col gap-1 mr-auto">
            <h4 className="text-sm text-destructive">Removed</h4>
            <div className="flex items-center gap-2">
              <Link
                className="text-sm text-legend flex items-center gap-1"
                to={getExplorerLink(
                  recipient.address,
                  chainId,
                  ExplorerDataType.ADDRESS
                )}
                target="_blank"
              >
                {shortenAddress(recipient.address)}
                <ArrowUpRight size={12} />
              </Link>
              <span className="text-sm text-muted-foreground">
                ({recipient.share}%)
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            size="xs"
            className="rounded-full"
            onClick={() => handleRevertRemove(recipient)}
          >
            <Undo size={12} />
          </Button>
        </div>
      ))}

      {modified.map((recipient) => (
        <div
          key={recipient.address}
          className="flex items-center gap-2 border rounded-2xl p-2"
        >
          <Edit2 className="text-primary" size={16} />
          <div className="flex flex-col gap-1 mr-auto">
            <h4 className="text-sm text-primary">Modified</h4>
            <div className="flex items-center gap-2">
              <Link
                className="text-sm text-legend flex items-center gap-1"
                to={getExplorerLink(
                  recipient.address,
                  chainId,
                  ExplorerDataType.ADDRESS
                )}
                target="_blank"
              >
                {shortenAddress(recipient.address)}
                <ArrowUpRight size={12} />
              </Link>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">
                  {recipient.currentShare}%
                </span>
                <ArrowRight size={12} className="text-primary" />
                <span className="text-primary font-medium">
                  {recipient.newShare}%
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="xs"
            className="rounded-full"
            onClick={() =>
              handleRevertModify(recipient.address, recipient.currentShare)
            }
          >
            <Undo size={12} />
          </Button>
        </div>
      ))}
    </div>
  )
}

const RevenueChanges = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const feeRecipients = useAtomValue(feeRecipientsAtom)
  const [dtfRevenueChanges, setDtfRevenueChanges] = useAtom(
    dtfRevenueChangesAtom
  )
  const [revenueDistributionChanges, setRevenueDistributionChanges] = useAtom(
    revenueDistributionChangesAtom
  )
  const hasRevenueDistributionChanges = useAtomValue(
    hasRevenueDistributionChangesAtom
  )
  const hasDtfRevenueChanges = useAtomValue(hasDtfRevenueChangesAtom)
  const { setValue } = useFormContext()

  const hasChanges = hasDtfRevenueChanges || hasRevenueDistributionChanges

  if (!hasChanges || !indexDTF || !feeRecipients) return null

  const currentMintFee = indexDTF.mintingFee * 100
  const currentTvlFee = indexDTF.annualizedTvlFee * 100
  const currentGovernanceShare = feeRecipients.governanceShare
  const currentDeployerShare = feeRecipients.deployerShare
  const currentAdditionalRecipients = feeRecipients.externalRecipients

  const onRevertMintFee = () => {
    setDtfRevenueChanges({ ...dtfRevenueChanges, mintFee: undefined })
    setValue('mintFee', currentMintFee)
  }

  const onRevertTvlFee = () => {
    setDtfRevenueChanges({ ...dtfRevenueChanges, tvlFee: undefined })
    setValue('folioFee', currentTvlFee)
  }

  const onRevertGovernance = () => {
    setRevenueDistributionChanges({
      ...revenueDistributionChanges,
      governanceShare: undefined,
    })
    setValue('governanceShare', currentGovernanceShare)
  }

  const onRevertDeployer = () => {
    setRevenueDistributionChanges({
      ...revenueDistributionChanges,
      deployerShare: undefined,
    })
    setValue('deployerShare', currentDeployerShare)
  }

  const onRevertAdditionalRecipients = (
    recipients: { address: string; share: number }[]
  ) => {
    setRevenueDistributionChanges({
      ...revenueDistributionChanges,
      additionalRecipients: recipients.length > 0 ? recipients : undefined,
    })
    setValue('additionalRevenueRecipients', recipients)
  }

  const onRevertAllDistribution = () => {
    setRevenueDistributionChanges({})
    setValue('governanceShare', currentGovernanceShare)
    setValue('deployerShare', currentDeployerShare)
    setValue('additionalRevenueRecipients', currentAdditionalRecipients)
  }

  return (
    <ChangeSection title="Revenue Settings" icon={<DollarSign size={16} />}>
      <div className="space-y-3">
        {dtfRevenueChanges.mintFee !== undefined && (
          <FeeChange
            title="Mint Fee"
            currentFee={currentMintFee}
            newFee={dtfRevenueChanges.mintFee}
            onRevert={onRevertMintFee}
          />
        )}

        {dtfRevenueChanges.tvlFee !== undefined && (
          <FeeChange
            title="Annualized TVL Fee"
            currentFee={currentTvlFee}
            newFee={dtfRevenueChanges.tvlFee}
            onRevert={onRevertTvlFee}
          />
        )}

        {(revenueDistributionChanges.governanceShare !== undefined ||
          revenueDistributionChanges.deployerShare !== undefined ||
          revenueDistributionChanges.additionalRecipients !== undefined) && (
          <RevenueDistributionChange
            governanceShareChange={
              revenueDistributionChanges.governanceShare !== undefined
                ? {
                    current: currentGovernanceShare,
                    new: revenueDistributionChanges.governanceShare,
                  }
                : undefined
            }
            deployerShareChange={
              revenueDistributionChanges.deployerShare !== undefined
                ? {
                    current: currentDeployerShare,
                    new: revenueDistributionChanges.deployerShare,
                  }
                : undefined
            }
            additionalRecipients={
              revenueDistributionChanges.additionalRecipients
            }
            currentAdditionalRecipients={currentAdditionalRecipients}
            onRevertGovernance={onRevertGovernance}
            onRevertDeployer={onRevertDeployer}
            onRevertAdditionalRecipients={onRevertAdditionalRecipients}
            onRevertAll={onRevertAllDistribution}
          />
        )}
      </div>
    </ChangeSection>
  )
}

export default RevenueChanges
