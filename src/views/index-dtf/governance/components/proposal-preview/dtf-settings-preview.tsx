import { DecodedCalldata } from '@/types'
import { shortenAddress } from '@/utils'
import { ArrowRight, FileText, Shield, Users, DollarSign, Clock, Trash } from 'lucide-react'

// Preview component for setMandate function
export const SetMandatePreview = ({ decodedCalldata }: { decodedCalldata: DecodedCalldata }) => {
  const newMandate = decodedCalldata.data[0] as string
  
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium">
        <FileText size={16} />
        <span>Update Mandate</span>
      </div>
      <div className="p-3 rounded-lg bg-muted/50 text-sm">
        <div className="break-words">{newMandate}</div>
      </div>
    </div>
  )
}

// Preview component for removeFromBasket function
export const RemoveFromBasketPreview = ({ decodedCalldata }: { decodedCalldata: DecodedCalldata }) => {
  const tokenAddress = decodedCalldata.data[0] as string
  
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Trash size={16} className="text-destructive" />
        <span>Remove Token from Basket</span>
      </div>
      <div className="p-3 rounded-lg bg-destructive/5 text-sm">
        <span className="text-destructive">Token: {shortenAddress(tokenAddress)}</span>
      </div>
    </div>
  )
}

// Preview component for grantRole function
export const GrantRolePreview = ({ decodedCalldata }: { decodedCalldata: DecodedCalldata }) => {
  const [roleHash, account] = decodedCalldata.data as [string, string]
  
  // Map role hashes to readable names
  const roleNames: Record<string, string> = {
    '0x45e7131d776dddc137e30bdd490b431c7144677e97bf9369f629ed8d3fb7dd6f': 'Guardian',
    '0x2ce3265b96c4537dd7b86b7554c85e8071574b43342b4b4cbfe186cf4b2bc883': 'Brand Manager',
    '0xecec33ab7f1be86026025e66df4d1b28cd50e7eb59269b6b6c5e8096d4a4aed4': 'Auction Launcher',
  }
  
  const roleName = roleNames[roleHash] || 'Unknown Role'
  
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Shield size={16} className="text-success" />
        <span>Grant Role</span>
      </div>
      <div className="p-3 rounded-lg bg-success/5 text-sm">
        <div className="text-success">+ {roleName}</div>
        <div className="text-xs text-muted-foreground mt-1">{shortenAddress(account)}</div>
      </div>
    </div>
  )
}

// Preview component for revokeRole function
export const RevokeRolePreview = ({ decodedCalldata }: { decodedCalldata: DecodedCalldata }) => {
  const [roleHash, account] = decodedCalldata.data as [string, string]
  
  const roleNames: Record<string, string> = {
    '0x45e7131d776dddc137e30bdd490b431c7144677e97bf9369f629ed8d3fb7dd6f': 'Guardian',
    '0x2ce3265b96c4537dd7b86b7554c85e8071574b43342b4b4cbfe186cf4b2bc883': 'Brand Manager',
    '0xecec33ab7f1be86026025e66df4d1b28cd50e7eb59269b6b6c5e8096d4a4aed4': 'Auction Launcher',
  }
  
  const roleName = roleNames[roleHash] || 'Unknown Role'
  
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Shield size={16} className="text-destructive" />
        <span>Revoke Role</span>
      </div>
      <div className="p-3 rounded-lg bg-destructive/5 text-sm">
        <div className="text-destructive">- {roleName}</div>
        <div className="text-xs text-muted-foreground mt-1">{shortenAddress(account)}</div>
      </div>
    </div>
  )
}

// Preview component for setFeeRecipients function
export const SetFeeRecipientsPreview = ({ decodedCalldata }: { decodedCalldata: DecodedCalldata }) => {
  const recipients = decodedCalldata.data[0] as Array<{ address: string; portion: bigint }>
  
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Users size={16} />
        <span>Update Fee Recipients</span>
      </div>
      <div className="p-3 rounded-lg bg-muted/50 text-sm space-y-2">
        {recipients.map((recipient, idx) => {
          // Convert basis points to percentage (portion is in basis points, e.g., 2000 = 20%)
          const percentage = Number(recipient.portion) / 100
          return (
            <div key={idx} className="flex justify-between">
              <span>{shortenAddress(recipient.address)}</span>
              <span className="font-medium">{percentage.toFixed(2)}%</span>
            </div>
          )
        })}
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
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium">
        <DollarSign size={16} />
        <span>Update Mint Fee</span>
      </div>
      <div className="p-3 rounded-lg bg-muted/50 text-sm">
        <span className="font-medium">{percentage.toFixed(2)}%</span>
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
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium">
        <DollarSign size={16} />
        <span>Update TVL Fee</span>
      </div>
      <div className="p-3 rounded-lg bg-muted/50 text-sm">
        <span className="font-medium">{percentage.toFixed(2)}%</span>
      </div>
    </div>
  )
}


// Preview component for setAuctionLength function
export const SetAuctionLengthPreview = ({ decodedCalldata }: { decodedCalldata: DecodedCalldata }) => {
  const lengthInSeconds = Number(decodedCalldata.data[0])
  const lengthInMinutes = lengthInSeconds / 60
  
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Clock size={16} />
        <span>Update Auction Length</span>
      </div>
      <div className="p-3 rounded-lg bg-muted/50 text-sm">
        <span className="font-medium">{lengthInMinutes} minutes</span>
      </div>
    </div>
  )
}

// Preview component for setDustAmount function (used in v2 tokens)
export const SetDustAmountPreview = ({ decodedCalldata }: { decodedCalldata: DecodedCalldata }) => {
  const [tokenAddress, amount] = decodedCalldata.data as [string, bigint]
  
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Trash size={16} />
        <span>Set Dust Amount (Pre-requisite)</span>
      </div>
      <div className="p-3 rounded-lg bg-muted/50 text-sm">
        <div className="text-xs text-muted-foreground">
          Setting dust amount for token removal
        </div>
        <div className="text-xs mt-1">{shortenAddress(tokenAddress)}</div>
      </div>
    </div>
  )
}