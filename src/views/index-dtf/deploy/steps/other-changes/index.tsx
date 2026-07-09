import NextButton from '../../components/next-button'
import { ToggleGroupPreset } from '../../components/toggle-group-preset'
import OtherChangesForm from './other-changes-form'
import { Trans } from '@lingui/react/macro'

const Description = () => (
  <div className="px-6 pb-6 text-base">
    <Trans>
      Updates to the fees, roles, voting parameters, and anything other than
      basket changes can be configured to happen at a different speed from
      basket changes, in case you want to apply more care for fully-general
      governance, or allow parameter changes more easily than basket changes.
    </Trans>
  </div>
)

const OtherChanges = () => {
  return (
    <>
      <Description />
      <ToggleGroupPreset section="governance" />
      <OtherChangesForm />
      <NextButton />
    </>
  )
}

export default OtherChanges
