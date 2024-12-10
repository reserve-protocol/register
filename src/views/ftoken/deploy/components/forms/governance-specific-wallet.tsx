import BasicInput from '../basic-input'

const GovernanceSpecificWallet = () => {
  return (
    <div className="px-2">
      <BasicInput
        fieldName="governanceWalletAddress"
        label="Wallet address"
        placeholder="0x..."
      />
    </div>
  )
}

export default GovernanceSpecificWallet
