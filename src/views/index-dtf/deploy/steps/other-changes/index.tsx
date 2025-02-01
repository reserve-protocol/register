import NextButton from '../../components/next-button'
import OtherChangesForm from './other-changes-form'

const Description = () => (
  <div className="px-6 pb-6 text-base">
    Updates to the fees, roles, voting parameters, and anything other than
    basket changes can be configured to happen at a different speed from basket
    changes, in case you want to apply more care for fully-general governance,
    or allow parameter changes more easily than basket changes.
  </div>
)

const OtherChanges = () => {
  return (
    <>
      <Description />
      <OtherChangesForm />
      <NextButton />
    </>
  )
}

export default OtherChanges
