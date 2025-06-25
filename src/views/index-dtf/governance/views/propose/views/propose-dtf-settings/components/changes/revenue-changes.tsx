import { Button } from '@/components/ui/button'
import { formatPercentage, shortenAddress } from '@/utils'
import { FIXED_PLATFORM_FEE } from '@/utils/constants'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { useAtom, useAtomValue } from 'jotai'
import { useFormContext } from 'react-hook-form'
import { DollarSign, ArrowRight, Undo } from 'lucide-react'
import { 
  revenueDistributionChangesAtom,
  dtfRevenueChangesAtom,
  feeRecipientsAtom,
  hasRevenueDistributionChangesAtom,
  hasDtfRevenueChangesAtom
} from '../../atoms'
import { ChangeSection, RevertButton } from './shared'

interface FeeChangeProps {
  title: string
  currentFee: number
  newFee: number
  onRevert: () => void
}

const FeeChange = ({ title, currentFee, newFee, onRevert }: FeeChangeProps) => (
  <div className="p-4 rounded-lg bg-secondary border space-y-2">
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
    <RevertButton onClick={onRevert} />
  </div>
)

interface RevenueDistributionChangeProps {
  governanceShareChange?: { current: number; new: number }
  deployerShareChange?: { current: number; new: number }
  additionalRecipients?: { address: string; share: number }[]
  currentAdditionalRecipients: { address: string; share: number }[]
  onRevertGovernance: () => void
  onRevertDeployer: () => void
  onRevertAdditionalRecipients: (recipients: { address: string; share: number }[]) => void
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
  onRevertAll
}: RevenueDistributionChangeProps) => (
  <div className="p-4 rounded-lg bg-secondary border space-y-3">
    <div className="text-sm font-medium">Revenue Distribution</div>
    <div className="space-y-2">
      {governanceShareChange && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground w-24">Governance:</span>
            <span className="text-muted-foreground">
              {formatPercentage(governanceShareChange.current)}
            </span>
            <ArrowRight size={14} className="text-primary" />
            <span className="text-primary font-medium">
              {formatPercentage(governanceShareChange.new)}
            </span>
          </div>
          <Button
            variant="outline"
            size="icon-rounded"
            onClick={onRevertGovernance}
            className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
          >
            <Undo size={14} />
          </Button>
        </div>
      )}
      {deployerShareChange && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground w-24">Creator:</span>
            <span className="text-muted-foreground">
              {formatPercentage(deployerShareChange.current)}
            </span>
            <ArrowRight size={14} className="text-primary" />
            <span className="text-primary font-medium">
              {formatPercentage(deployerShareChange.new)}
            </span>
          </div>
          <Button
            variant="outline"
            size="icon-rounded"
            onClick={onRevertDeployer}
            className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
          >
            <Undo size={14} />
          </Button>
        </div>
      )}
      <div className="flex items-center gap-3 text-sm">
        <span className="text-muted-foreground w-24">Platform:</span>
        <span className="text-muted-foreground">
          {FIXED_PLATFORM_FEE}% (fixed)
        </span>
      </div>
      
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
    <RevertButton onClick={onRevertAll} label="Revert All" />
  </div>
)

// Helper component for additional recipients changes
const AdditionalRecipientsChanges = ({ 
  current, 
  proposed, 
  onRevert 
}: { 
  current: { address: string; share: number }[]
  proposed: { address: string; share: number }[]
  onRevert: (recipients: { address: string; share: number }[]) => void
}) => {
  // Find added recipients
  const added = proposed.filter(propRecipient => 
    !current.some(currRecipient => 
      currRecipient.address.toLowerCase() === propRecipient.address.toLowerCase()
    )
  )
  
  // Find removed recipients
  const removed = current.filter(currRecipient => 
    !proposed.some(propRecipient => 
      propRecipient.address.toLowerCase() === currRecipient.address.toLowerCase()
    )
  )
  
  // Find modified recipients (same address, different share)
  const modified = proposed.filter(propRecipient => {
    const currentRecipient = current.find(curr => 
      curr.address.toLowerCase() === propRecipient.address.toLowerCase()
    )
    return currentRecipient && currentRecipient.share !== propRecipient.share
  }).map(propRecipient => {
    const currentRecipient = current.find(curr => 
      curr.address.toLowerCase() === propRecipient.address.toLowerCase()
    )!
    return {
      address: propRecipient.address,
      currentShare: currentRecipient.share,
      newShare: propRecipient.share
    }
  })

  const handleRevertAdd = (address: string) => {
    const newProposed = proposed.filter(r => 
      r.address.toLowerCase() !== address.toLowerCase()
    )
    onRevert(newProposed)
  }

  const handleRevertRemove = (recipient: { address: string; share: number }) => {
    const newProposed = [...proposed, recipient]
    onRevert(newProposed)
  }

  const handleRevertModify = (address: string, originalShare: number) => {
    const newProposed = proposed.map(r => 
      r.address.toLowerCase() === address.toLowerCase() 
        ? { ...r, share: originalShare }
        : r
    )
    onRevert(newProposed)
  }

  return (
    <div className="space-y-2">
      {added.length > 0 && (
        <div>
          <div className="text-xs text-success mb-1">Added ({added.length}):</div>
          {added.map(recipient => (
            <div key={recipient.address} className="flex items-center justify-between gap-2">
              <div className="text-sm text-success">
                + {shortenAddress(recipient.address)} ({recipient.share}%)
              </div>
              <Button
                variant="outline"
                size="icon-rounded"
                onClick={() => handleRevertAdd(recipient.address)}
                className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
              >
                <Undo size={14} />
              </Button>
            </div>
          ))}
        </div>
      )}
      
      {removed.length > 0 && (
        <div>
          <div className="text-xs text-destructive mb-1">Removed ({removed.length}):</div>
          {removed.map(recipient => (
            <div key={recipient.address} className="flex items-center justify-between gap-2">
              <div className="text-sm text-destructive">
                - {shortenAddress(recipient.address)} ({recipient.share}%)
              </div>
              <Button
                variant="outline"
                size="icon-rounded"
                onClick={() => handleRevertRemove(recipient)}
                className="h-6 w-6 hover:bg-success/10 hover:text-success hover:border-success/20"
              >
                <Undo size={14} />
              </Button>
            </div>
          ))}
        </div>
      )}
      
      {modified.length > 0 && (
        <div>
          <div className="text-xs text-primary mb-1">Modified ({modified.length}):</div>
          {modified.map(recipient => (
            <div key={recipient.address} className="flex items-center justify-between gap-2">
              <div className="text-sm">
                <span className="text-muted-foreground">{shortenAddress(recipient.address)}</span>
                <span className="text-muted-foreground mx-2">{recipient.currentShare}%</span>
                <ArrowRight size={12} className="inline text-primary" />
                <span className="text-primary font-medium mx-2">{recipient.newShare}%</span>
              </div>
              <Button
                variant="outline"
                size="icon-rounded"
                onClick={() => handleRevertModify(recipient.address, recipient.currentShare)}
                className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
              >
                <Undo size={14} />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const RevenueChanges = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const feeRecipients = useAtomValue(feeRecipientsAtom)
  const [dtfRevenueChanges, setDtfRevenueChanges] = useAtom(dtfRevenueChangesAtom)
  const [revenueDistributionChanges, setRevenueDistributionChanges] = useAtom(revenueDistributionChangesAtom)
  const hasRevenueDistributionChanges = useAtomValue(hasRevenueDistributionChangesAtom)
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
      governanceShare: undefined 
    })
    setValue('governanceShare', currentGovernanceShare)
  }
  
  const onRevertDeployer = () => {
    setRevenueDistributionChanges({ 
      ...revenueDistributionChanges, 
      deployerShare: undefined 
    })
    setValue('deployerShare', currentDeployerShare)
  }
  
  const onRevertAdditionalRecipients = (recipients: { address: string; share: number }[]) => {
    setRevenueDistributionChanges({ 
      ...revenueDistributionChanges, 
      additionalRecipients: recipients.length > 0 ? recipients : undefined
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
                ? { current: currentGovernanceShare, new: revenueDistributionChanges.governanceShare }
                : undefined
            }
            deployerShareChange={
              revenueDistributionChanges.deployerShare !== undefined
                ? { current: currentDeployerShare, new: revenueDistributionChanges.deployerShare }
                : undefined
            }
            additionalRecipients={revenueDistributionChanges.additionalRecipients}
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