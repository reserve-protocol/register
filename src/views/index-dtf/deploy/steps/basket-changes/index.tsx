import NextButton from '../../components/next-button'
import BasketChangesForm from './basket-changes-form'

const Description = () => (
  <div className="px-6 pb-6 text-base">
    Updates to the basket of an Index DTF go through their own governance
    process. Below are a list of field specific to these types of proposals.
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
