import { Separator } from '@/components/ui/separator'
import BasicInput from '../../components/basic-input'
import { OctagonAlert } from 'lucide-react'

const WarningBanner = () => {
  return (
    <div className="flex items-center gap-2 cursor-auto">
      <div className="text-[#D05A67] p-1.5 rounded-full border-[#D05A67] border">
        <OctagonAlert size={20} strokeWidth={1.5} />
      </div>
      <div>
        <div className="font-bold text-[#D05A67]">
          Centralized governance restricts features
        </div>
        <div className="text-muted-foreground">
          Mint/redeem zaps as well as the ability to govern/trade will not be
          available in our interface.
        </div>
      </div>
    </div>
  )
}

const GovernanceSpecificWallet = () => {
  return (
    <div className="px-4">
      <BasicInput
        fieldName="governanceWalletAddress"
        label="Wallet address"
        placeholder="0x..."
      />
      <Separator className="my-4" />
      <WarningBanner />
    </div>
  )
}

export default GovernanceSpecificWallet
