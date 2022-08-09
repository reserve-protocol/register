import { t } from '@lingui/macro'
import { useAtomValue } from 'jotai/utils'
import { isValidBasketAtom } from '../atoms'
import BasketSetup from '../components/BasketSetup'
import DeployHeader from '../components/DeployHeader'

const Basket = () => {
  const [isValidBasket] = useAtomValue(isValidBasketAtom)

  return (
    <>
      <DeployHeader
        isValid={isValidBasket}
        title={t`Define baskets`}
        subtitle="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
        confirmText={t`Confirm Basket`}
      />
      <BasketSetup />
    </>
  )
}

export default Basket
