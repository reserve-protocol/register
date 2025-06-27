import { DecodedCalldata } from '@/types'
import { shortenAddress } from '@/utils'
import { ArrowRight, FileText, Shield, Users, DollarSign, Clock, Trash, ArrowUpRight, Edit2, PlusCircle, MinusCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { useAtomValue } from 'jotai'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { FIXED_PLATFORM_FEE } from '@/utils/constants'

// Preview component for setMandate function
export const SetMandatePreview = ({ decodedCalldata }: { decodedCalldata: DecodedCalldata }) => {
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
export const RemoveFromBasketPreview = ({ decodedCalldata }: { decodedCalldata: DecodedCalldata }) => {
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
            to={getExplorerLink(tokenAddress, chainId, ExplorerDataType.ADDRESS)}
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
export const GrantRolePreview = ({ decodedCalldata }: { decodedCalldata: DecodedCalldata }) => {
  const chainId = useAtomValue(chainIdAtom)
  const [roleHash, account] = decodedCalldata.data as [string, string]
  
  // Map role hashes to readable names
  const roleNames: Record<string, string> = {
    '0x45e7131d776dddc137e30bdd490b431c7144677e97bf9369f629ed8d3fb7dd6f': 'Guardian',
    '0x2ce3265b96c4537dd7b86b7554c85e8071574b43342b4b4cbfe186cf4b2bc883': 'Brand Manager',
    '0xecec33ab7f1be86026025e66df4d1b28cd50e7eb59269b6b6c5e8096d4a4aed4': 'Auction Launcher',
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
export const RevokeRolePreview = ({ decodedCalldata }: { decodedCalldata: DecodedCalldata }) => {
  const chainId = useAtomValue(chainIdAtom)
  const [roleHash, account] = decodedCalldata.data as [string, string]
  
  const roleNames: Record<string, string> = {
    '0x45e7131d776dddc137e30bdd490b431c7144677e97bf9369f629ed8d3fb7dd6f': 'Guardian',
    '0x2ce3265b96c4537dd7b86b7554c85e8071574b43342b4b4cbfe186cf4b2bc883': 'Brand Manager',
    '0xecec33ab7f1be86026025e66df4d1b28cd50e7eb59269b6b6c5e8096d4a4aed4': 'Auction Launcher',
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
          <span className="text-sm font-medium text-destructive">{roleName}</span>
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
export const SetFeeRecipientsPreview = ({ decodedCalldata }: { decodedCalldata: DecodedCalldata }) => {
  const chainId = useAtomValue(chainIdAtom)
  const indexDTF = useAtomValue(indexDTFAtom)
  const recipients = decodedCalldata.data[0] as Array<{ recipient: string; portion: bigint }>
  
  if (!indexDTF) return null
  
  // Parse recipients into categories
  const externalRecipients: Array<{ address: string; percentage: number }> = []
  let deployerShare = 0
  let governanceShare = 0
  
  recipients?.forEach((recipient) => {
    const percentage = (Number(recipient.portion) / 1e18) * 100
    
    if (recipient.recipient.toLowerCase() === indexDTF.deployer.toLowerCase()) {
      deployerShare = percentage
    } else if (recipient.recipient.toLowerCase() === indexDTF.stToken?.id.toLowerCase()) {
      governanceShare = percentage
    } else {
      externalRecipients.push({
        address: recipient.recipient,
        percentage
      })
    }
  })
  
  // The percentages from the calldata are scaled to sum to 100%
  // But for display, we need to show the original user values that sum to (100 - FIXED_PLATFORM_FEE)
  // So we scale them down by multiplying by (100 - FIXED_PLATFORM_FEE) / 100
  const scaleFactor = (100 - FIXED_PLATFORM_FEE) / 100
  const adjustedDeployerShare = deployerShare * scaleFactor
  const adjustedGovernanceShare = governanceShare * scaleFactor
  const adjustedExternalRecipients = externalRecipients.map(r => ({
    ...r,
    percentage: r.percentage * scaleFactor
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
            <span className="text-sm text-muted-foreground">Platform (Fixed)</span>
            <div className="flex items-center gap-2">
              <DollarSign size={14} className="text-muted-foreground" />
              <span className="text-sm font-medium">{FIXED_PLATFORM_FEE}%</span>
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
                <span className="text-sm font-medium text-primary">{adjustedGovernanceShare.toFixed(2)}%</span>
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
                <span className="text-sm font-medium text-primary">{adjustedDeployerShare.toFixed(2)}%</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Additional Recipients */}
        {adjustedExternalRecipients.map((recipient, idx) => (
          <div key={idx} className="p-3 rounded-xl bg-background/80 border">
            <div className="flex items-center justify-between">
              <Link
                to={getExplorerLink(recipient.address, chainId, ExplorerDataType.ADDRESS)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
              >
                {shortenAddress(recipient.address)}
                <ArrowUpRight size={12} />
              </Link>
              <div className="flex items-center gap-2">
                <DollarSign size={14} className="text-primary" />
                <span className="text-sm font-medium text-primary">{recipient.percentage.toFixed(2)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Preview component for setMintFee function
export const SetMintFeePreview = ({ decodedCalldata }: { decodedCalldata: DecodedCalldata }) => {
  const fee = decodedCalldata.data[0] as bigint
  // Convert basis points to percentage (e.g., 150 = 1.5%)
  const percentage = Number(fee) / 100
  
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
            <span className="text-sm font-medium text-primary">{percentage.toFixed(2)}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Preview component for setTVLFee function
export const SetTVLFeePreview = ({ decodedCalldata }: { decodedCalldata: DecodedCalldata }) => {
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
            <span className="text-sm font-medium text-primary">{percentage.toFixed(2)}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}


// Preview component for setAuctionLength function
export const SetAuctionLengthPreview = ({ decodedCalldata }: { decodedCalldata: DecodedCalldata }) => {
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
          <span className="text-sm text-muted-foreground">New auction duration:</span>
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-primary" />
            <span className="text-sm font-medium text-primary">{lengthInMinutes} minutes</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Preview component for setDustAmount function (used in v2 tokens)
export const SetDustAmountPreview = ({ decodedCalldata }: { decodedCalldata: DecodedCalldata }) => {
  const chainId = useAtomValue(chainIdAtom)
  const [tokenAddress, amount] = decodedCalldata.data as [string, bigint]
  
  return (
    <div className="rounded-2xl border bg-muted/70 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Trash size={16} className="text-muted-foreground" />
        <div className="text-sm font-medium">Set Dust Amount (Pre-requisite)</div>
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