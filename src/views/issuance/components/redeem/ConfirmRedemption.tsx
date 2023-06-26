import { getAddress } from '@ethersproject/address'
import { BigNumber } from '@ethersproject/bignumber'
import { t } from '@lingui/macro'
import { Facade } from 'abis/types'
import TransactionModal from 'components/transaction-modal'
import { useFacadeContract } from 'hooks/useContract'
import useDebounce from 'hooks/useDebounce'
import { atom, useAtom, useAtomValue } from 'jotai'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { basketNonceAtom, rTokenAtom } from 'state/atoms'
import { BigNumberMap } from 'types'
import { formatCurrency, safeParseEther } from 'utils'
import { TRANSACTION_STATUS } from 'utils/constants'
import { quote, RSV_MANAGER } from 'utils/rsv'
import { v4 as uuid } from 'uuid'
import { isValidRedeemAmountAtom, redeemAmountAtom } from 'views/issuance/atoms'
import CollateralDistribution from '../issue/CollateralDistribution'
import RedeemInput from './RedeemInput'
import { Box } from 'theme-ui'

{
  /* <CollateralDistribution
mt={3}
collaterals={rToken?.collaterals ?? []}
quantities={collateralQuantities}
/> */
}

// useEffect(() => {
//   if (facadeContract && rToken?.main && Number(amount) > 0) {
//     getQuantities(facadeContract, rToken.address, amount)
//   } else if (rToken && !rToken.main && Number(amount) > 0) {
//     setCollateralQuantities(quote(amount))
//   } else {
//     setCollateralQuantities({})
//   }
// }, [facadeContract, rToken?.address, debounceAmount])

const RedemptionQuote = () => {
  return <Box></Box>
}

const ConfirmRedemption = ({ onClose }: { onClose: () => void }) => {
  const [signing, setSigning] = useState(false)
  const rToken = useAtomValue(rTokenAtom)
  const [amount, setAmount] = useAtom(redeemAmountAtom)
  const isValid = useAtomValue(isValidRedeemAmountAtom)
  const parsedAmount = isValid ? safeParseEther(amount) : BigNumber.from(0)
  const basketNonce = useAtomValue(basketNonceAtom)

  const transaction = useMemo(
    () => ({
      id: '',
      description: t`Redeem ${rToken?.symbol}`,
      status: TRANSACTION_STATUS.PENDING,
      value: amount,
      call: {
        abi: rToken?.main ? 'rToken' : 'rsv',
        address: rToken?.main ? rToken?.address ?? '' : RSV_MANAGER,
        method: 'redeem',
        args: rToken?.main ? [parsedAmount, basketNonce] : [parsedAmount],
      },
    }),
    [rToken?.address, amount, basketNonce]
  )

  const requiredAllowance = useMemo(
    () =>
      rToken && !rToken.main
        ? {
            [rToken.address]: parsedAmount,
          }
        : {},
    [rToken?.address, amount]
  )

  const buildApproval = useCallback(() => {
    // TODO: Only for RSV, remove when deprecated
    if (rToken && !rToken.main) {
      return [
        {
          id: uuid(),
          description: t`Approve RSV`,
          status: TRANSACTION_STATUS.PENDING,
          value: amount,
          call: {
            abi: 'erc20',
            address: rToken.address,
            method: 'approve',
            args: [RSV_MANAGER, parsedAmount],
          },
        },
      ]
    }

    return []
  }, [rToken?.address, amount])

  const handleClose = useCallback(() => {
    onClose()
    setAmount('')
  }, [])

  return (
    <TransactionModal
      title={t`Redeem ${rToken?.symbol}`}
      tx={transaction}
      isValid={isValid}
      requiredAllowance={requiredAllowance}
      confirmLabel={t`Begin redemption of ${formatCurrency(Number(amount))} ${
        rToken?.symbol ?? ''
      }`}
      buildApprovals={buildApproval}
      onClose={handleClose}
      onChange={(signing) => setSigning(signing)}
    >
      <RedeemInput compact disabled={signing} />
      <RedemptionQuote />
    </TransactionModal>
  )
}

export default ConfirmRedemption
