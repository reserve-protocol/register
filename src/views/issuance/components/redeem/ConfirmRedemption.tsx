import { getAddress } from '@ethersproject/address'
import { BigNumber } from '@ethersproject/bignumber'
import { parseEther } from '@ethersproject/units'
import { t } from '@lingui/macro'
import { Facade } from 'abis/types'
import TransactionModal from 'components/transaction-modal'
import { useFacadeContract } from 'hooks/useContract'
import useDebounce from 'hooks/useDebounce'
import { atom, useAtom, useAtomValue } from 'jotai'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { rTokenAtom } from 'state/atoms'
import { BigNumberMap } from 'types'
import { formatCurrency } from 'utils'
import { TRANSACTION_STATUS } from 'utils/constants'
import { RSV_MANAGER } from 'utils/rsv'
import { v4 as uuid } from 'uuid'
import { isValidRedeemAmountAtom, redeemAmountAtom } from 'views/issuance/atoms'
import CollateralDistribution from '../issue/CollateralDistribution'
import RedeemInput from './RedeemInput'
import { quote } from 'utils/rsv'

const redeemCollateralAtom = atom<BigNumberMap>({})

// TODO: Display redeemable collateral?
const ConfirmRedemption = ({ onClose }: { onClose: () => void }) => {
  const [signing, setSigning] = useState(false)
  const rToken = useAtomValue(rTokenAtom)
  const [amount, setAmount] = useAtom(redeemAmountAtom)
  const debounceAmount = useDebounce(amount, 300)
  const [collateralQuantities, setCollateralQuantities] =
    useAtom(redeemCollateralAtom)
  const isValid = useAtomValue(isValidRedeemAmountAtom)
  const facadeContract = useFacadeContract()
  const parsedAmount = isValid ? parseEther(amount) : BigNumber.from(0)
  const transaction = useMemo(
    () => ({
      id: '',
      description: t`Redeem ${rToken?.symbol}`,
      status: TRANSACTION_STATUS.PENDING,
      value: amount,
      call: {
        abi: rToken?.isRSV ? 'rsv' : 'rToken',
        address: rToken?.isRSV ? RSV_MANAGER : rToken?.address ?? '',
        method: 'redeem',
        args: [parsedAmount],
      },
    }),
    [rToken?.address, amount]
  )

  const requiredAllowance = rToken?.isRSV
    ? {
        [rToken.address]: parsedAmount,
      }
    : {}

  const getQuantities = useCallback(
    async (facade: Facade, rToken: string, value: string) => {
      try {
        const issueAmount = parseEther(value)
        const quoteResult = await facade.callStatic.issue(rToken, issueAmount)

        setCollateralQuantities(
          quoteResult.tokens.reduce((prev, current, currentIndex) => {
            prev[getAddress(current)] = quoteResult.deposits[currentIndex]
            return prev
          }, {} as BigNumberMap)
        )
      } catch (e) {
        console.error('Error getting redemption quantities', e)
      }
    },
    []
  )

  useEffect(() => {
    if (
      facadeContract &&
      rToken?.address &&
      !rToken.isRSV &&
      Number(amount) > 0
    ) {
      getQuantities(facadeContract, rToken.address, amount)
    } else if (rToken?.isRSV && Number(amount) > 0) {
      setCollateralQuantities(quote(parseEther(amount)))
    } else {
      setCollateralQuantities({})
    }
  }, [facadeContract, rToken?.address, debounceAmount])

  // TODO: Unlimited approval
  const buildApproval = useCallback(() => {
    if (rToken && rToken.isRSV) {
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

  const handleClose = () => {
    onClose()
    setAmount('')
  }

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
      <CollateralDistribution
        mt={3}
        collaterals={rToken?.collaterals ?? []}
        quantities={collateralQuantities}
      />
    </TransactionModal>
  )
}

export default ConfirmRedemption
