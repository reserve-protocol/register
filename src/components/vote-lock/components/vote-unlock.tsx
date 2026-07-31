import { useAnimatedAmount } from '@/components/ui/animated-number'
import Swap from '@/components/ui/swap'
import { formatCurrency } from '@/utils'
import { useLingui } from '@lingui/react/macro'
import { useAtom, useAtomValue } from 'jotai'
import { formatUnits } from 'viem'
import {
  sharePriceAtom,
  stTokenAtom,
  stakingInputAtom,
  unlockShareBalanceAtom,
  voteLockStateAtom,
} from '../atoms'
import { useUnlockQuote } from '../hooks/use-vote-lock-quotes'
import VaultExchangeRate from './vault-exchange-rate'

const VoteUnlock = () => {
  const { t } = useLingui()
  const stToken = useAtomValue(stTokenAtom)
  const [input, onChange] = useAtom(stakingInputAtom)
  const sharePrice = useAtomValue(sharePriceAtom)
  const underlyingPrice = useAtomValue(voteLockStateAtom)?.underlyingPrice
  const unlockShareBalance = useAtomValue(unlockShareBalanceAtom)
  const {
    data: assetsOut,
    isLoading: quoteLoading,
    isPlaceholderData,
  } = useUnlockQuote()

  // Hook must run unconditionally: the external drawer mounts before
  // stTokenAtom is populated (synced in an effect), so no early return above.
  const assetsOutFormatted = useAnimatedAmount(
    stToken && assetsOut !== undefined
      ? formatUnits(assetsOut, stToken.underlying.decimals)
      : '',
    isPlaceholderData
  )

  const onMax = () => {
    onChange(unlockShareBalance)
  }

  if (!stToken) {
    return null
  }

  const inputPrice = sharePrice ? sharePrice * Number(input || '0') : 0
  const outputPrice =
    underlyingPrice && assetsOutFormatted
      ? underlyingPrice * Number(assetsOutFormatted)
      : 0

  return (
    <>
      <Swap
        loading={quoteLoading && Number(input) > 0}
        from={{
          title: t`You unlock:`,
          address: stToken.id,
          symbol: stToken.token.symbol,
          value: input,
          onChange,
          inputTestId: 'vote-unlock-input',
          price: `$${formatCurrency(inputPrice)}`,
          balance: `${formatCurrency(Number(unlockShareBalance))}`,
          onMax,
        }}
        to={{
          address: stToken.underlying.address,
          symbol: stToken.underlying.symbol,
          inputTestId: 'vote-unlock-output',
          price: `$${formatCurrency(outputPrice)}`,
          value: assetsOutFormatted,
          className: isPlaceholderData ? 'animate-pulse' : undefined,
        }}
      />
      <VaultExchangeRate />
    </>
  )
}

export default VoteUnlock
