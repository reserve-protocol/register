import BasicInput from '../../components/basic-input'
import { useLingui } from '@lingui/react/macro'

const BasicMetadataForm = () => {
  const { t } = useLingui()
  return (
    <div className="flex flex-col gap-2 px-2">
      <BasicInput
        fieldName="tokenName"
        label={t`Name`}
        placeholder={t`New Index DTF`}
        autoFocus
      />
      <BasicInput fieldName="symbol" label={t`Symbol`} placeholder={t`TICKER`} />
      <BasicInput
        fieldName="mandate"
        label={t`Mandate`}
        placeholder={t`This Index DTF will…`}
      />
    </div>
  )
}

export default BasicMetadataForm
