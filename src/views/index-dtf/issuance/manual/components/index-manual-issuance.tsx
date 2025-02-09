import dtfIndexAbi from '@/abis/dtf-index-abi'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { chainIdAtom, walletAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { formatCurrency, safeParseEther } from '@/utils'
import { ROUTES } from '@/utils/constants'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { AlertCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'
import { Address } from 'viem'
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import {
  allowanceMapAtom,
  amountAtom,
  assetAmountsMapAtom,
  balanceMapAtom,
  modeAtom,
} from '../atoms'
import InputBox from './input-box'
import ModeSelector from './mode-selector'
import Spinner from '@/components/ui/spinner'
import { TransactionButtonContainer } from '@/components/old/button/TransactionButton'

const isValidAtom = atom<[boolean, string]>((get) => {
  const mode = get(modeAtom)
  const amount = get(amountAtom.debouncedValueAtom)
  const indexDTF = get(indexDTFAtom)
  const balanceMap = get(balanceMapAtom)
  const allowanceMap = get(allowanceMapAtom)
  const requiredAmounts = get(assetAmountsMapAtom)

  if (
    !indexDTF ||
    isNaN(Number(amount)) ||
    !Object.keys(balanceMap).length ||
    !Object.keys(allowanceMap).length ||
    !Object.keys(requiredAmounts).length
  )
    return [false, '']

  // Simple case, on redeem just check if the balance is enough
  if (mode === 'sell') {
    const isValid = (balanceMap[indexDTF.id] ?? 0n) >= safeParseEther(amount)
    return [isValid, isValid ? '' : 'Insufficient balance']
  }

  // On mint, check if the allowance and balance is enough for each asset
  for (const asset of Object.keys(requiredAmounts)) {
    if ((balanceMap[asset] ?? 0n) < requiredAmounts[asset]) {
      return [false, 'Insufficient balance']
    }
    if ((allowanceMap[asset] ?? 0n) < requiredAmounts[asset]) {
      return [false, 'Insufficient allowance']
    }
  }

  return [true, '']
})

// TODO: Maybe worth doing the new tx button?
const SubmitButton = () => {
  const mode = useAtomValue(modeAtom)
  const amount = useAtomValue(amountAtom.currentValueAtom)
  const [actionMsg, setActionMsg] = useState('') // used for toast description
  const {
    data,
    isPending,
    error: signError,
    writeContract,
    reset,
  } = useWriteContract()
  const { isSuccess, error: txError } = useWaitForTransactionReceipt({
    hash: data,
  })
  const requiredAmounts = useAtomValue(assetAmountsMapAtom)
  const [isValid, validationError] = useAtomValue(isValidAtom)
  const wallet = useAtomValue(walletAtom)
  const indexDTF = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)
  const setAmount = useSetAtom(amountAtom.debouncedValueAtom)

  useEffect(() => {
    if (isSuccess) {
      toast('Transaction successful', {
        description: actionMsg,
        icon: '🎉',
      })
      reset()
      setAmount('')
    }
  }, [isSuccess])

  const handleSubmit = () => {
    if (!isValid || !indexDTF || !wallet) return

    if (mode === 'buy') {
      setActionMsg(
        `${formatCurrency(Number(amount))} ${indexDTF.token.symbol} minted!`
      )
      writeContract({
        address: indexDTF.id,
        abi: dtfIndexAbi,
        functionName: 'mint',
        args: [safeParseEther(amount), wallet],
        chainId,
      })
    } else {
      const assets: Address[] = []
      const minAmounts: bigint[] = []

      for (const asset of Object.keys(requiredAmounts)) {
        assets.push(asset as Address)
        // 5% slippage
        // TODO: This is worst case scenario, but it maybe too much?
        minAmounts.push((requiredAmounts[asset] * 95n) / 100n)
      }

      setActionMsg(
        `${formatCurrency(Number(amount))} ${indexDTF.token.symbol} redeemed!`
      )
      writeContract({
        address: indexDTF.id,
        abi: dtfIndexAbi,
        functionName: 'redeem',
        args: [
          safeParseEther(amount),
          wallet,
          assets as `0x${string}`[],
          minAmounts as bigint[],
        ],
        chainId,
      })
    }
  }

  let label = mode === 'buy' ? 'Mint' : 'Redeem'
  const error = signError || txError
  const isLoading = (isPending || !!data) && !error

  if (isPending) {
    label = 'Please sign in wallet...'
  } else if (data) {
    label = 'Confirming transaction...'
  }

  return (
    <div className="flex flex-col gap-2">
      <TransactionButtonContainer>
        <Button
          disabled={!isValid || isLoading}
          className="gap-2 w-full"
          onClick={handleSubmit}
        >
          {isLoading && <Spinner />}
          {label}
        </Button>
      </TransactionButtonContainer>

      {(validationError || error) && (
        <Alert variant="destructive">
          <AlertTitle className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />{' '}
            {validationError || 'Transaction failed'}
          </AlertTitle>
          {!!error && <AlertDescription>{error.name}</AlertDescription>}
        </Alert>
      )}
    </div>
  )
}

const IndexManualIssuance = () => {
  return (
    <div>
      <div className="flex flex-col gap-2 border bg-card rounded-3xl p-4 h-fit">
        <ModeSelector />
        <InputBox />
        <SubmitButton />
      </div>
      <div className="mt-4 rounded-3xl border p-4 flex items-center gap-2">
        <p className="text-sm text-muted-foreground">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam,
          quos.
        </p>
        <Link to={`../${ROUTES.ISSUANCE}`}>
          <Button variant="outline-primary">Simple mode</Button>
        </Link>
      </div>
    </div>
  )
}

export default IndexManualIssuance
