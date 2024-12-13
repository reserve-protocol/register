import NextButton from '../../components/next-button'
import RolesForm from './roles-form'

const Description = () => (
  <div className="px-6 pb-6 text-base">
    The price curator is responsible for choosing a target price for the trade
    and initiating the dutch auction.
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
