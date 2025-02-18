import dtfIndexAbi from '@/abis/dtf-index-abi'
import { TransactionButtonContainer } from '@/components/old/button/TransactionButton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import Spinner from '@/components/ui/spinner'
import { chainIdAtom, walletAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { formatCurrency, safeParseEther } from '@/utils'
import { ROUTES } from '@/utils/constants'
import { atom, useAtom, useAtomValue } from 'jotai'
import { AlertCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
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

const getErrorMessage = (error: Error) => {
  const messageSplit = error.message.split('\n')
  const message =
    messageSplit.length > 1
      ? messageSplit[0] + ' ' + messageSplit[1]
      : (messageSplit[0] ?? '')

  return message
}

const VALIDATION_ERRORS = {
  BALANCE: 'Insufficient balance',
  ALLOWANCE: 'Need to approve use of tokens',
}

const isValidAtom = atom<[boolean, string]>((get) => {
  const mode = get(modeAtom)
  const amount = get(amountAtom)
  const indexDTF = get(indexDTFAtom)
  const balanceMap = get(balanceMapAtom)
  const allowanceMap = get(allowanceMapAtom)
  const requiredAmounts = get(assetAmountsMapAtom)

  if (
    !indexDTF ||
    isNaN(Number(amount)) ||
    Number(amount) <= 0 ||
    !Object.keys(balanceMap).length ||
    !Object.keys(allowanceMap).length ||
    !Object.keys(requiredAmounts).length
  ) {
    return [false, '']
  }

  // Simple case, on redeem just check if the balance is enough
  if (mode === 'sell') {
    const isValid = balanceMap[indexDTF.id] >= safeParseEther(amount)
    return [isValid, isValid ? '' : VALIDATION_ERRORS.BALANCE]
  }

  // On mint, check if the allowance and balance is enough for each asset
  for (const asset of Object.keys(requiredAmounts)) {
    if ((balanceMap[asset] ?? 0n) < requiredAmounts[asset]) {
      return [false, VALIDATION_ERRORS.BALANCE]
    }
    if ((allowanceMap[asset] ?? 0n) < requiredAmounts[asset]) {
      return [false, VALIDATION_ERRORS.ALLOWANCE]
    }
  }

  return [true, '']
})

// TODO: Maybe worth doing the new tx button?
const SubmitButton = () => {
  const chainId = useAtomValue(chainIdAtom)
  const mode = useAtomValue(modeAtom)
  const [amount, setAmount] = useAtom(amountAtom)
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
    chainId,
  })
  const requiredAmounts = useAtomValue(assetAmountsMapAtom)
  const [isValid, validationError] = useAtomValue(isValidAtom)
  const wallet = useAtomValue(walletAtom)
  const indexDTF = useAtomValue(indexDTFAtom)

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
        <Alert
          variant={
            validationError === VALIDATION_ERRORS.ALLOWANCE
              ? 'warning'
              : 'destructive'
          }
        >
          <AlertTitle className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />{' '}
            {validationError || 'Transaction failed'}
          </AlertTitle>
          {!!error && !validationError && (
            <AlertDescription className="ml-6">
              {getErrorMessage(error)}
            </AlertDescription>
          )}
        </Alert>
      )}
    </div>
  )
}

const IndexManualIssuance = () => {
  const mode = useAtomValue(modeAtom)
  return (
    <div>
      <div className="flex flex-col gap-2 border bg-card rounded-3xl p-4 h-fit">
        <ModeSelector />
        <InputBox />
        <SubmitButton />
      </div>
      <div className="mt-4 rounded-3xl border p-4 flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">Having issues minting?</p>
        <Link to={`../${ROUTES.ISSUANCE}`}>
          <Button variant="muted" size="xs">
            Switch to zap {mode === 'buy' ? 'minting' : 'redeeming'}
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default IndexManualIssuance
