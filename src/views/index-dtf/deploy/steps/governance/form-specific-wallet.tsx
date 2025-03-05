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
        title="Centralized governance restricts access to features"
        description={
          <ul>
            <li>
              Users will not be able to mint / redeem using zaps in the US
            </li>
            <li>
              You will not be able to use the Reserve website to make changes to
              the DTF
            </li>
          </ul>
        }
      />
    </div>
  )
}

export default GovernanceSpecificWallet
