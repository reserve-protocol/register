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
        subtitle="Name your token and define does your RToken should operate."
        confirmText={t`Confirm parameters`}
      />
      <TokenConfiguration />
    </>
  )
}

export default TokenParameters
