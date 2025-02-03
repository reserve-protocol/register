import BasicInput from '../../components/basic-input'
import WarningBanner from '../../components/warning-banner'

const GovernanceSpecificWallet = () => {
  return (
    <div className="px-4">
      <BasicInput
        fieldName="governanceWalletAddress"
        label="Wallet address"
        placeholder="0x..."
      />
      <WarningBanner
        title="Centralized governance restricts features"
        description="Mint/redeem zaps as well as the ability to govern/trade will not be available in our interface."
      />
    </div>
  )
}

export default GovernanceSpecificWallet
