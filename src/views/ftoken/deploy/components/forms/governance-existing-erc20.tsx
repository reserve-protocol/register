import BasicInput from '../basic-input'

const GovernanceExistingERC20 = () => {
  return (
    <div className="px-2">
      <BasicInput
        fieldName="governanceERC20address"
        label="ERC20 address"
        placeholder="0x..."
      />
    </div>
  )
}

export default GovernanceExistingERC20
