import { Button } from '@/components/ui/button'
import Swap from '@/components/ui/swap'
import { useChainlinkPrice } from '@/hooks/useChainlinkPrice'
import { chainIdAtom } from '@/state/atoms'
import { formatCurrency } from '@/utils'
import { Trans } from '@lingui/macro'
import { useAtom, useAtomValue } from 'jotai'
import { RefreshCw } from 'lucide-react'
import { Address } from 'viem'
import { indexDeployFormDataAtom } from '../atoms'
import {
  defaultInputTokenAtom,
  inputAmountAtom,
  inputBalanceAtom,
  inputTokenAtom,
  zapDeployPayloadAtom,
} from './atoms'
import useDebounce from '@/hooks/useDebounce'
import zapper from '@/views/yield-dtf/issuance/components/zapV2/api'
import { useZapDeployQuery } from '@/hooks/useZapDeployQuery'

const SimpleDeployButton = () => {
  return (
    <div className="m-2">
      <Button size="lg" className="w-full">
        Create
      </Button>
    </div>
  )
}

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

  const { data, isLoading, error } = useZapDeployQuery(url, requestBody)

  console.log({ data, isLoading, error })

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
              price: undefined,
              symbol: form.symbol,
              balance: undefined,
              value: undefined,
            }}
          />{' '}
        </div>
      </div>
      <SimpleDeployButton />
    </div>
  )
}

export default SimpleIndexDeploy
