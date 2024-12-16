import BasicInput from '../../components/basic-input'

const BasicMetadataForm = () => {
  return (
    <div className="flex flex-col gap-2 px-2">
      <BasicInput
        fieldName="name"
        label="Token name"
        placeholder="Super duper token number 1"
      />
      <BasicInput fieldName="symbol" label="Symbol" placeholder="$Super" />
    </div>
  )
}

export default BasicMetadataForm
