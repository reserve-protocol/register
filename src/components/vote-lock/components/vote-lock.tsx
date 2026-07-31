import { useAnimatedAmount } from '@/components/ui/animated-number'
import Swap from '@/components/ui/swap'
import { formatCurrency } from '@/utils'
import { useLingui } from '@lingui/react/macro'
import { useAtom, useAtomValue } from 'jotai'
import { formatUnits } from 'viem'
import {
  inputBalanceAtom,
  inputPriceAtom,
  stakingInputAtom,
  stTokenAtom,
} from '../atoms'
import { useLockQuote } from '../hooks/use-vote-lock-quotes'
import VaultExchangeRate from './vault-exchange-rate'

const VoteLock = () => {
  const { t } = useLingui()
  const stToken = useAtomValue(stTokenAtom)
  const [input, onChange] = useAtom(stakingInputAtom)
  const inputPrice = useAtomValue(inputPriceAtom)
  const inputBalance = useAtomValue(inputBalanceAtom)
  const {
    data: sharesOut,
    isLoading: quoteLoading,
    isPlaceholderData,
  } = useLockQuote()

  // Hook must run unconditionally: the external drawer mounts before
  // stTokenAtom is populated (synced in an effect), so no early return above.
  const sharesOutFormatted = useAnimatedAmount(
    stToken && sharesOut !== undefined
      ? formatUnits(sharesOut, stToken.token.decimals)
      : '',
    isPlaceholderData
  )

  const onMax = () => {
    onChange(inputBalance)
  }

  if (!stToken) {
    return null
  }

  return (
    <>
      <Swap
        loading={quoteLoading && Number(input) > 0}
        from={{
          title: t`You lock:`,
          address: stToken.underlying.address,
          symbol: stToken.underlying.symbol,
          value: input,
          onChange,
          inputTestId: 'vote-lock-input',
          price: `$${formatCurrency(inputPrice)}`,
          balance: `${formatCurrency(Number(inputBalance))}`,
          onMax,
        }}
        to={{
          address: stToken.id,
          symbol: stToken.token.symbol,
          inputTestId: 'vote-lock-output',
          price: `$${formatCurrency(inputPrice)}`,
          value: sharesOutFormatted,
          className: isPlaceholderData ? 'animate-pulse' : undefined,
        }}
      />
      <VaultExchangeRate />
    </>
  )
}

export default VoteLock
