import { t } from '@lingui/macro'
import { useFormContext } from 'react-hook-form'
import BasketSetup from '../components/BasketSetup'
import DeployHeader from '../components/DeployHeader'

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
      <BasketSetup />
    </>
  )
}

export default TokenParameters
