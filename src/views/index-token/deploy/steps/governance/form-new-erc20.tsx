import BasicInput from '../../components/basic-input'

const GovernanceNewERC20 = () => {
  return (
    <div className="flex flex-col gap-2 px-2">
      <BasicInput
        fieldName="governanceERC20name"
        label="Token name"
        placeholder="Super duper index"
      />
      <BasicInput
        fieldName="governanceERC20symbol"
        label="Symbol"
        placeholder="$SDI"
      />
    </div>
  )
}

export default GovernanceNewERC20
