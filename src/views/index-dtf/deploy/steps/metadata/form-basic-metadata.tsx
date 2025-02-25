import BasicInput from '../../components/basic-input'

const BasicMetadataForm = () => {
  return (
    <div className="flex flex-col gap-2 px-2">
      <BasicInput
        fieldName="tokenName"
        label="Name"
        placeholder="New Index DTF"
        autoFocus
      />
      <BasicInput fieldName="symbol" label="Symbol" placeholder="TICKER" />
      <BasicInput
        fieldName="mandate"
        label="Mandate"
        placeholder="This Index DTF will…"
      />
    </div>
  )
}

export default BasicMetadataForm
