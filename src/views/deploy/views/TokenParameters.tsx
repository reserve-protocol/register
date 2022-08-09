import { t } from '@lingui/macro'
import { useFormContext } from 'react-hook-form'
import DeployHeader from '../components/DeployHeader'
import TokenConfiguration from '../components/TokenConfiguration'

const TokenParameters = () => {
  const {
    formState: { isValid },
  } = useFormContext()

  return (
    <>
      <DeployHeader
        isValid={isValid}
        title={t`Define RToken Parameters`}
        subtitle="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
        confirmText={t`Confirm Configuration`}
      />
      <TokenConfiguration />
    </>
  )
}

export default TokenParameters
