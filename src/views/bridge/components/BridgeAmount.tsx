import { t } from '@lingui/macro'
import TransactionInput, {
  TransactionInputProps,
} from 'components/transaction-input'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { chainIdAtom, walletAtom } from 'state/atoms'
import { safeParseEther } from 'utils'
import { ChainId } from 'utils/chains'
import { Address, useBalance } from 'wagmi'
import {
  bridgeAmountAtom,
  bridgeAmountDebouncedAtom,
  isValidBridgeAmountAtom,
  selectedTokenAtom,
} from '../atoms'

const BridgeAmount = (props: Partial<TransactionInputProps>) => {
  const chainId = useAtomValue(chainIdAtom)
  const token = useAtomValue(selectedTokenAtom)
  const account = useAtomValue(walletAtom)
  const setValid = useSetAtom(isValidBridgeAmountAtom)
  const debouncedAmount = useAtomValue(bridgeAmountDebouncedAtom)
  const { data } = useBalance({
    chainId,
    watch: true,
    address: account || undefined,
    token: token.address
      ? ((chainId === ChainId.Mainnet
          ? token.address
          : token.bridgedAddress) as Address)
      : undefined,
  })

  useEffect(() => {
    const parsed = safeParseEther(debouncedAmount || '0')

    setValid(parsed > 0n && parsed <= (data?.value ?? 0n))
  }, [debouncedAmount])

  return (
    <TransactionInput
      title={t`Amount`}
      placeholder={t`Bridge amount`}
      amountAtom={bridgeAmountAtom}
      maxAmount={data ? data.formatted : '0'}
      {...props}
    />
  )
}

export default BridgeAmount
