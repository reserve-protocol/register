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
        title={t`Define Collateral Baskets`}
        subtitle="What will back your RToken? What happens in default scenarios?"
        confirmText={t`Confirm Basket`}
      />
      <BasketSetup />
    </>
  )
}

export default Basket
