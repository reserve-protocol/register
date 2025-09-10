import { DecodedCalldata } from '@/types'
import { shortenAddress } from '@/utils'
import {
  Shield,
  Users,
  DollarSign,
  Clock,
  Trash,
  ArrowUpRight,
  Edit2,
  PlusCircle,
  MinusCircle,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { useAtomValue } from 'jotai'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { getPlatformFee } from '@/utils/constants'
import { Address } from 'viem'

// Preview component for setMandate function
export const SetMandatePreview = ({
  decodedCalldata,
}: {
  decodedCalldata: DecodedCalldata
  targetAddress?: Address
}) => {
  const newMandate = decodedCalldata.data[0] as string

  return (
    <div className="rounded-2xl border bg-muted/70 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Edit2 size={16} className="text-primary" />
        <div className="text-sm font-medium">Update Mandate</div>
      </div>
      <div className="p-3 rounded-xl bg-background/80 text-sm">
        <div className="break-words text-muted-foreground">{newMandate}</div>
      </div>
    </div>
  )
}

// Preview component for removeFromBasket function
export const RemoveFromBasketPreview = ({
  decodedCalldata,
}: {
  decodedCalldata: DecodedCalldata
  targetAddress?: Address
}) => {
  const chainId = useAtomValue(chainIdAtom)
  const tokenAddress = decodedCalldata.data[0] as string

  return (
    <div className="rounded-2xl border bg-muted/70 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <MinusCircle size={16} className="text-destructive" />
        <div className="text-sm font-medium">Remove Token from Basket</div>
      </div>
      <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/20">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Token:</span>
          <Link
            to={getExplorerLink(
              tokenAddress,
              chainId,
              ExplorerDataType.ADDRESS
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-destructive hover:underline flex items-center gap-1"
          >
            {shortenAddress(tokenAddress)}
            <ArrowUpRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  )
}

// Preview component for grantRole function
export const GrantRolePreview = ({
  decodedCalldata,
}: {
  decodedCalldata: DecodedCalldata
  targetAddress?: Address
}) => {
  const chainId = useAtomValue(chainIdAtom)
  const [roleHash, account] = decodedCalldata.data as [string, string]

  // Map role hashes to readable names
  const roleNames: Record<string, string> = {
    '0xfd643c72710c63c0180259aba6b2d05451e3591a24e58b62239378085726f783':
      'Guardian',
    '0x2d8e650da9bd8c373ab2450d770f2ed39549bfc28d3630025cecc51511bcd374':
      'Brand Manager',
    '0x13ff1b2625181b311f257c723b5e6d366eb318b212d9dd694c48fcf227659df5':
      'Auction Launcher',
  }

  const roleName = roleNames[roleHash] || 'Unknown Role'

  return (
    <div className="rounded-2xl border bg-muted/70 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <PlusCircle size={16} className="text-success" />
        <div className="text-sm font-medium">Grant Role</div>
      </div>
      <div className="p-3 rounded-xl bg-success/5 border border-success/20">
        <div className="flex items-center gap-2 mb-1">
          <Shield size={14} className="text-success" />
          <span className="text-sm font-medium text-success">{roleName}</span>
        </div>
        <Link
          to={getExplorerLink(account, chainId, ExplorerDataType.ADDRESS)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
        >
          {shortenAddress(account)}
          <ArrowUpRight size={12} />
        </Link>
      </div>
    </div>
  )
}

// Preview component for revokeRole function
export const RevokeRolePreview = ({
  decodedCalldata,
}: {
  decodedCalldata: DecodedCalldata
  targetAddress?: Address
}) => {
  const chainId = useAtomValue(chainIdAtom)
  const [roleHash, account] = decodedCalldata.data as [string, string]

  const roleNames: Record<string, string> = {
    '0xfd643c72710c63c0180259aba6b2d05451e3591a24e58b62239378085726f783':
      'Guardian',
    '0x2d8e650da9bd8c373ab2450d770f2ed39549bfc28d3630025cecc51511bcd374':
      'Brand Manager',
    '0x13ff1b2625181b311f257c723b5e6d366eb318b212d9dd694c48fcf227659df5':
      'Auction Launcher',
  }

  const roleName = roleNames[roleHash] || 'Unknown Role'

  return (
    <div className="rounded-2xl border bg-muted/70 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <MinusCircle size={16} className="text-destructive" />
        <div className="text-sm font-medium">Revoke Role</div>
      </div>
      <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/20">
        <div className="flex items-center gap-2 mb-1">
          <Shield size={14} className="text-destructive" />
          <span className="text-sm font-medium text-destructive">
            {roleName}
          </span>
        </div>
        <Link
          to={getExplorerLink(account, chainId, ExplorerDataType.ADDRESS)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
        >
          {shortenAddress(account)}
          <ArrowUpRight size={12} />
        </Link>
      </div>
    </div>
  )
}

// Preview component for setFeeRecipients function
export const SetFeeRecipientsPreview = ({
  decodedCalldata,
}: {
  decodedCalldata: DecodedCalldata
  targetAddress?: Address
}) => {
  const chainId = useAtomValue(chainIdAtom)
  const indexDTF = useAtomValue(indexDTFAtom)
  const platformFee = getPlatformFee(chainId)
  const recipients = decodedCalldata.data[0] as Array<{
    recipient: string
    portion: bigint
  }>

  if (!indexDTF) return null

  // Parse recipients into categories
  const externalRecipients: Array<{ address: string; percentage: number }> = []
  let deployerShare = 0
  let governanceShare = 0

  recipients?.forEach((recipient) => {
    const percentage = (Number(recipient.portion) / 1e18) * 100

    if (recipient.recipient.toLowerCase() === indexDTF.deployer.toLowerCase()) {
      deployerShare = percentage
    } else if (
      recipient.recipient.toLowerCase() === indexDTF.stToken?.id.toLowerCase()
    ) {
      governanceShare = percentage
    } else {
      externalRecipients.push({
        address: recipient.recipient,
        percentage,
      })
    }
  })

  // The percentages from the calldata sum to 100% (excluding platform fee)
  // For display, we show the actual percentage of total revenue
  // So we divide by PERCENT_ADJUST = 100 / (100 - platformFee)
  const PERCENT_ADJUST = 100 / (100 - platformFee)
  const adjustedDeployerShare = deployerShare / PERCENT_ADJUST
  const adjustedGovernanceShare = governanceShare / PERCENT_ADJUST
  const adjustedExternalRecipients = externalRecipients.map((r) => ({
    ...r,
    percentage: r.percentage / PERCENT_ADJUST,
  }))

  return (
    <div className="rounded-2xl border bg-muted/70 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Users size={16} className="text-primary" />
        <div className="text-sm font-medium">Update Revenue Distribution</div>
      </div>
      <div className="space-y-2">
        {/* Platform Fee (Fixed) */}
        <div className="p-3 rounded-xl bg-background/80 border opacity-60">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Platform (Fixed)
            </span>
            <div className="flex items-center gap-2">
              <DollarSign size={14} className="text-muted-foreground" />
              <span className="text-sm font-medium">{platformFee}%</span>
            </div>
          </div>
        </div>

        {/* Governance Share */}
        {adjustedGovernanceShare > 0 && (
          <div className="p-3 rounded-xl bg-background/80 border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Governance</span>
              <div className="flex items-center gap-2">
                <DollarSign size={14} className="text-primary" />
                <span className="text-sm font-medium text-primary">
                  {adjustedGovernanceShare.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Deployer Share */}
        {adjustedDeployerShare > 0 && (
          <div className="p-3 rounded-xl bg-background/80 border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Creator</span>
              <div className="flex items-center gap-2">
                <DollarSign size={14} className="text-primary" />
                <span className="text-sm font-medium text-primary">
                  {adjustedDeployerShare.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Additional Recipients */}
        {adjustedExternalRecipients.map((recipient, idx) => (
          <div key={idx} className="p-3 rounded-xl bg-background/80 border">
            <div className="flex items-center justify-between">
              <Link
                to={getExplorerLink(
                  recipient.address,
                  chainId,
                  ExplorerDataType.ADDRESS
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
              >
                {shortenAddress(recipient.address)}
                <ArrowUpRight size={12} />
              </Link>
              <div className="flex items-center gap-2">
                <DollarSign size={14} className="text-primary" />
                <span className="text-sm font-medium text-primary">
                  {recipient.percentage.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Preview component for setMintFee function
export const SetMintFeePreview = ({
  decodedCalldata,
}: {
  decodedCalldata: DecodedCalldata
  targetAddress?: Address
}) => {
  const fee = decodedCalldata.data[0] as bigint
  // Convert from parseEther (18 decimals) to percentage
  // The fee is stored as dtfRevenueChanges.mintFee / 100 in parseEther format
  const percentage = (Number(fee) / 1e18) * 100

  return (
    <div className="rounded-2xl border bg-muted/70 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Edit2 size={16} className="text-primary" />
        <div className="text-sm font-medium">Update Mint Fee</div>
      </div>
      <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">New mint fee:</span>
          <div className="flex items-center gap-2">
            <DollarSign size={14} className="text-primary" />
            <span className="text-sm font-medium text-primary">
              {percentage.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Preview component for setTVLFee function
export const SetTVLFeePreview = ({
  decodedCalldata,
}: {
  decodedCalldata: DecodedCalldata
  targetAddress?: Address
}) => {
  const fee = decodedCalldata.data[0] as bigint
  // Convert from parseEther to percentage (e.g., 0.015 ether = 1.5%)
  const percentage = Number(fee) / 1e16 // divide by 1e16 to get percentage

  return (
    <div className="rounded-2xl border bg-muted/70 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Edit2 size={16} className="text-primary" />
        <div className="text-sm font-medium">Update Annualized TVL Fee</div>
      </div>
      <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">New TVL fee:</span>
          <div className="flex items-center gap-2">
            <DollarSign size={14} className="text-primary" />
            <span className="text-sm font-medium text-primary">
              {percentage.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Preview component for setAuctionLength function
export const SetAuctionLengthPreview = ({
  decodedCalldata,
}: {
  decodedCalldata: DecodedCalldata
  targetAddress?: Address
}) => {
  const lengthInSeconds = Number(decodedCalldata.data[0])
  const lengthInMinutes = lengthInSeconds / 60

  return (
    <div className="rounded-2xl border bg-muted/70 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Edit2 size={16} className="text-primary" />
        <div className="text-sm font-medium">Update Auction Length</div>
      </div>
      <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            New auction duration:
          </span>
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-primary" />
            <span className="text-sm font-medium text-primary">
              {lengthInMinutes} minutes
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Preview component for setDustAmount function (used in v2 tokens)
export const SetDustAmountPreview = ({
  decodedCalldata,
}: {
  decodedCalldata: DecodedCalldata
  targetAddress?: Address
}) => {
  const chainId = useAtomValue(chainIdAtom)
  const [tokenAddress, amount] = decodedCalldata.data as [string, bigint]

  return (
    <div className="rounded-2xl border bg-muted/70 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Trash size={16} className="text-muted-foreground" />
        <div className="text-sm font-medium">
          Set Dust Amount (Pre-requisite)
        </div>
      </div>
      <div className="p-3 rounded-xl bg-background/80 border">
        <div className="text-sm text-muted-foreground mb-2">
          Setting dust amount for token removal
        </div>
        <Link
          to={getExplorerLink(tokenAddress, chainId, ExplorerDataType.ADDRESS)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
        >
          {shortenAddress(tokenAddress)}
          <ArrowUpRight size={12} />
        </Link>
      </div>
    </div>
  )
}

// Preview component for setVotingDelay function
export const SetVotingDelayPreview = ({
  decodedCalldata,
}: {
  decodedCalldata: DecodedCalldata
  targetAddress?: Address
}) => {
  const delayInSeconds = Number(decodedCalldata.data[0])
  const delayInDays = delayInSeconds / 86400
  const displayValue =
    delayInDays < 1
      ? `${delayInSeconds / 3600} hour${delayInSeconds / 3600 !== 1 ? 's' : ''}`
      : `${delayInDays} day${delayInDays !== 1 ? 's' : ''}`

  return (
    <div className="rounded-2xl border bg-muted/70 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Edit2 size={16} className="text-primary" />
        <div className="text-sm font-medium">Update Voting Delay</div>
      </div>
      <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            New voting delay:
          </span>
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-primary" />
            <span className="text-sm font-medium text-primary">
              {displayValue}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Preview component for setVotingPeriod function
export const SetVotingPeriodPreview = ({
  decodedCalldata,
}: {
  decodedCalldata: DecodedCalldata
  targetAddress?: Address
}) => {
  const periodInSeconds = Number(decodedCalldata.data[0])
  const periodInDays = periodInSeconds / 86400
  const displayValue =
    periodInDays < 1
      ? `${periodInSeconds / 3600} hour${periodInSeconds / 3600 !== 1 ? 's' : ''}`
      : `${periodInDays} day${periodInDays !== 1 ? 's' : ''}`

  return (
    <div className="rounded-2xl border bg-muted/70 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Edit2 size={16} className="text-primary" />
        <div className="text-sm font-medium">Update Voting Period</div>
      </div>
      <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            New voting period:
          </span>
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-primary" />
            <span className="text-sm font-medium text-primary">
              {displayValue}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Preview component for setProposalThreshold function
export const SetProposalThresholdPreview = ({
  decodedCalldata,
}: {
  decodedCalldata: DecodedCalldata
  targetAddress?: Address
}) => {
  const threshold = decodedCalldata.data[0] as bigint
  // Convert from parseEther to percentage
  const percentage = (Number(threshold) / 1e18) * 100

  return (
    <div className="rounded-2xl border bg-muted/70 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Edit2 size={16} className="text-primary" />
        <div className="text-sm font-medium">Update Proposal Threshold</div>
      </div>
      <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            New proposal threshold:
          </span>
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-primary" />
            <span className="text-sm font-medium text-primary">
              {percentage.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Preview component for updateQuorumNumerator function
export const UpdateQuorumNumeratorPreview = ({
  decodedCalldata,
  targetAddress,
}: {
  decodedCalldata: DecodedCalldata
  targetAddress?: Address
}) => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const quorumNumerator = decodedCalldata.data[0] as bigint

  // Determine which governance this is for based on the target address
  let quorumDenominator = 0

  if (targetAddress) {
    const target = targetAddress.toLowerCase()

    if (target === indexDTF?.ownerGovernance?.id?.toLowerCase()) {
      quorumDenominator = Number(indexDTF.ownerGovernance.quorumDenominator)
    } else if (target === indexDTF?.tradingGovernance?.id?.toLowerCase()) {
      quorumDenominator = Number(indexDTF.tradingGovernance.quorumDenominator)
    } else if (target === indexDTF?.stToken?.governance?.id?.toLowerCase()) {
      quorumDenominator = Number(indexDTF.stToken.governance.quorumDenominator)
    }
  }

  // Calculate percentage
  const percentage =
    quorumDenominator > 0
      ? (Number(quorumNumerator) / quorumDenominator) * 100
      : 0

  return (
    <div className="rounded-2xl border bg-muted/70 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Edit2 size={16} className="text-primary" />
        <div className="text-sm font-medium">Update Voting Quorum</div>
      </div>
      <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            New voting quorum:
          </span>
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-primary" />
            <span className="text-sm font-medium text-primary">
              {percentage.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Preview component for updateDelay function (timelock)
export const UpdateDelayPreview = ({
  decodedCalldata,
}: {
  decodedCalldata: DecodedCalldata
  targetAddress?: Address
}) => {
  const delayInSeconds = Number(decodedCalldata.data[0])
  const delayInDays = delayInSeconds / 86400
  const displayValue =
    delayInDays < 1
      ? `${delayInSeconds / 3600} hour${delayInSeconds / 3600 !== 1 ? 's' : ''}`
      : `${delayInDays} day${delayInDays !== 1 ? 's' : ''}`

  return (
    <div className="rounded-2xl border bg-muted/70 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Edit2 size={16} className="text-primary" />
        <div className="text-sm font-medium">Update Execution Delay</div>
      </div>
      <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            New execution delay:
          </span>
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-primary" />
            <span className="text-sm font-medium text-primary">
              {displayValue}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
