import { Button } from '@/components/ui/button'
import Swap from '@/components/ui/swap'
import { useChainlinkPrice } from '@/hooks/useChainlinkPrice'
import useDebounce from '@/hooks/useDebounce'
import { useZapDeployQuery } from '@/hooks/useZapDeployQuery'
import { chainIdAtom } from '@/state/atoms'
import { formatCurrency } from '@/utils'
import zapper from '@/views/yield-dtf/issuance/components/zapV2/api'
import { Trans } from '@lingui/macro'
import { useAtom, useAtomValue } from 'jotai'
import { RefreshCw } from 'lucide-react'
import { Address, formatEther, parseUnits } from 'viem'
import { indexDeployFormDataAtom } from '../atoms'
import {
  defaultInputTokenAtom,
  inputAmountAtom,
  inputBalanceAtom,
  inputTokenAtom,
  zapDeployPayloadAtom,
} from './atoms'
import SimpleDeployButton from './simple-deploy-button'

const RefreshQuote = () => {
  return (
    <Button className="gap-2 text-legend" variant="ghost">
      <RefreshCw size={16} />
      <Trans>Refresh quote</Trans>
    </Button>
  )
}

const SimpleIndexDeploy = () => {
  const chainId = useAtomValue(chainIdAtom)
  const inputToken = useAtomValue(inputTokenAtom)
  const inputBalance = useAtomValue(inputBalanceAtom)
  const defaultInputToken = useAtomValue(defaultInputTokenAtom)
  const form = useAtomValue(indexDeployFormDataAtom)
  const [inputAmount, setInputAmount] = useAtom(inputAmountAtom)
  const zapDeployPayload = useAtomValue(zapDeployPayloadAtom)

  const url = form?.governanceWalletAddress
    ? zapper.zapDeployUngoverned(chainId)
    : zapper.zapDeploy(chainId)
  const requestBody = useDebounce(zapDeployPayload, 500)

  const tokenIn = inputToken || defaultInputToken
  const tokenPrice = useChainlinkPrice(chainId, tokenIn?.address as Address)
  const inputPrice = (tokenPrice || 0) * Number(inputAmount)

  const onMax = () => {
    setInputAmount(inputBalance?.balance || '0')
  }

  const insufficientBalance = inputBalance?.value
    ? parseUnits(inputAmount, tokenIn.decimals) > inputBalance?.value
    : false

  const { data, isLoading, error } = useZapDeployQuery(
    url,
    requestBody,
    insufficientBalance
  )

  const priceTo = data?.result?.amountOutValue
  const valueTo = data?.result?.amountOut

  if (!form) return null

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow">
        <div className="flex items-center mx-6">
          <h4 className="font-bold mr-auto">How much do you want to mint?</h4>
          <RefreshQuote />
        </div>
        <div className="px-2">
          <Swap
            from={{
              price: `$${formatCurrency(inputPrice)}`,
              address: tokenIn.address,
              symbol: tokenIn.symbol,
              balance: `${formatCurrency(Number(inputBalance?.balance || '0'))}`,
              value: inputAmount,
              onChange: setInputAmount,
              onMax,
            }}
            to={{
              title: 'You mint:',
              price: priceTo ? `$${formatCurrency(priceTo)}` : undefined,
              symbol: form.symbol,
              value: formatEther(BigInt(valueTo || 0)),
            }}
          />{' '}
        </div>
      </div>
      <div className="p-2">
        {data?.status === 'success' && data?.result && !insufficientBalance ? (
          <SimpleDeployButton data={data?.result} />
        ) : (
          <>
            <Button size="lg" className="w-full" disabled>
              {isLoading
                ? 'Loading...'
                : error || data?.status === 'error'
                  ? insufficientBalance
                    ? 'Insufficient balance'
                    : 'Error'
                  : 'Deploy'}
            </Button>
            {data?.error && (
              <div className="text-red-500 text-sm text-center mt-2">
                {data.error}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default SimpleIndexDeploy
