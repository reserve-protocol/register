import NextButton from '../../components/next-button'
import OtherChangesForm from './other-changes-form'

const Description = () => (
  <div className="px-6 pb-6 text-base">
    Updates to the fees, roles, voting parameters, and anything other than
    basket changes go through their own governance process. Below are a list of
    field specific to these types of proposals.
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
