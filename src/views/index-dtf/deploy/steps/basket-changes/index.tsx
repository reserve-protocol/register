import NextButton from '../../components/next-button'
import BasketChangesForm from './basket-changes-form'

const Description = () => (
  <div className="px-6 pb-6 text-base">
    Updates to the basket of an Index DTF can be configured to happen at a
    different speed from all other governance, in case you want to move quickly
    for basket changes, or take extra time for basket changes. You’ll set these
    same parameters for all other governance in the next section.
  </div>
)

const BasketChanges = () => {
  return (
    <>
      <Description />
      <BasketChangesForm />
      <NextButton />
    </>
  )
}

export default BasketChanges
