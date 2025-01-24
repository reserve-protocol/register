import NextButton from '../../components/next-button'
import RolesForm from './roles-form'

const Description = () => (
  <div className="px-6 pb-6 text-base">
    The Reserve Index Protocol provides several roles that can improve the
    safety and experience of DTF holders and governors. These roles are mutable
    and can be changed by governance in the future.
  </div>
)

const Roles = () => {
  return (
    <>
      <Description />
      <RolesForm />
      <NextButton />
    </>
  )
}

export default Roles
