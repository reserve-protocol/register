import BasketPreview from './basket-preview'
import BasketValue from './basket-value'
import NextButton from '../../components/next-button'
import TokenSelector from './token-selector'
import BasketCsvSetup from './basket-csv-setup'

const Description = () => (
  <div className="px-6 pb-6 text-base">
    An Index DTF is a tokenized basket of assets. Please add the tokens that
    will compose your index DTF basket at launch. The basket can be changed by
    governance in the future.
  </div>
)

const FTokenBasket = () => {
  return (
    <>
      <Description />
      <BasketCsvSetup />
      <BasketPreview />
      <TokenSelector />
      <BasketValue />
      <NextButton />
    </>
  )
}

export default FTokenBasket
