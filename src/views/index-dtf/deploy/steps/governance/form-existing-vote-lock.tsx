import BasicInput from '../../components/basic-input'

const GovernanceExistingVoteLock = () => {
  return (
    <div className="flex flex-col gap-2 px-2">
      <BasicInput
        fieldName="governanceVoteLock"
        label="Vote Lock address"
        placeholder="0x..."
      />
    </div>
  )
}

export default GovernanceExistingVoteLock
