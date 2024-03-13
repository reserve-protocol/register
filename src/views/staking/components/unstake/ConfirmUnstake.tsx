import { t } from '@lingui/macro'
import StRSR from 'abis/StRSR'
import TransactionModal from 'components/transaction-modal'
import useDebounce from 'hooks/useDebounce'
import { useAtom, useAtomValue } from 'jotai'
import { useMemo, useState } from 'react'
import { rTokenAtom } from 'state/atoms'
import { safeParseEther } from 'utils'
import {
  isValidUnstakeAmountAtom,
  unStakeAmountAtom,
} from 'views/staking/atoms'
import UnstakeInput from './UnstakeInput'

const ConfirmUnstake = ({ onClose }: { onClose: () => void }) => {
  const [signing, setSigning] = useState(false)
  const rToken = useAtomValue(rTokenAtom)
  const [amount, setAmount] = useAtom(unStakeAmountAtom)
  const debounceAmount = useDebounce(amount, 500)
  const isValid = useAtomValue(isValidUnstakeAmountAtom)

  const call = useMemo(() => {
    if (!rToken?.stToken || !isValid) {
      return undefined
    }

    return {
      abi: StRSR,
      address: rToken.stToken.address,
      functionName: 'unstake',
      args: [safeParseEther(debounceAmount)],
    }
  }, [rToken?.address, isValid, debounceAmount])

  const handleClose = () => {
    onClose()
    setAmount('')
  }

  return (
    <TransactionModal
      title={t`Unstake ${rToken?.stToken?.symbol}`}
      description={`Unstake ${rToken?.stToken?.symbol}`}
      call={call}
      confirmLabel={t`Begin unstake cooldown`}
      onClose={handleClose}
      onChange={(signing) => setSigning(signing)}
    ></TransactionModal>
  )
}

export default ConfirmUnstake
