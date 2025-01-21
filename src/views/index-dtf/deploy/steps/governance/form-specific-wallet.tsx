import BasicInput from '../../components/basic-input'

const GovernanceSpecificWallet = () => {
  return (
    <div className="px-3">
      <BasicInput
        fieldName="governanceWalletAddress"
        label="Wallet address"
        placeholder="0x..."
      />
    </div>
  )
}

export default GovernanceSpecificWallet
