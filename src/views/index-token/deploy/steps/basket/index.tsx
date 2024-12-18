import BasketPreview from './basket-preview'
import BasketValue from './basket-value'
import NextButton from '../../components/next-button'
import TokenSelector from './token-selector'

const Description = () => (
  <div className="px-6 pb-6 text-base">
    Define what portion of the revenue goes to the RToken holders versus RSR
    stakers. It can also be configured to send a portion of the revenue of an
    RToken to any arbitrary Ethereum address (wallet or smart contract).
  </div>
)

const FTokenBasket = () => {
  return (
    <>
      <Description />
      <BasketPreview />
      <TokenSelector />
      <BasketValue />
      <NextButton />
    </>
  )
}

export default FTokenBasket
