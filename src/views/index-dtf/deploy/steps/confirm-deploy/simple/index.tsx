import { TransactionButtonContainer } from '@/components/old/button/TransactionButton'
import { Button } from '@/components/ui/button'
import Copy from '@/components/ui/copy'
import Swap, { SlippageSelector } from '@/components/ui/swap'
import { useChainlinkPrice } from '@/hooks/useChainlinkPrice'
import useDebounce from '@/hooks/useDebounce'
import { useZapDeployQuery } from '@/hooks/useZapDeployQuery'
import { chainIdAtom } from '@/state/atoms'
import { formatCurrency } from '@/utils'
import zapper from '@/views/yield-dtf/issuance/components/zapV2/api'
import { Trans } from '@lingui/macro'
import { useAtom, useAtomValue } from 'jotai'
import { RefreshCw } from 'lucide-react'
import { useEffect } from 'react'
import { Address, formatEther, parseUnits } from 'viem'
import { indexDeployFormDataAtom } from '../atoms'
import {
  defaultInputTokenAtom,
  inputAmountAtom,
  inputBalanceAtom,
  inputTokenAtom,
  ongoingTxAtom,
  slippageAtom,
  tokensAtom,
  zapDeployPayloadAtom,
} from './atoms'
import SimpleDeployButton from './simple-deploy-button'

const CopyPayloadButton = () => {
  const zapDeployPayload = useAtomValue(zapDeployPayloadAtom)

  return (
    <div className="flex items-center gap-1 text-xs">
      <div>Copy payload to share with engineering team</div>
      <Copy value={JSON.stringify(zapDeployPayload)} />
    </div>
  )
}
const RefreshQuote = ({
  onClick,
  disabled,
}: {
  onClick?: () => void
  disabled?: boolean
}) => {
  return (
    <Button
      className="gap-2 text-legend rounded-xl"
      variant="ghost"
      onClick={onClick}
      disabled={disabled}
    >
      <RefreshCw size={16} />
      <Trans>Refresh quote</Trans>
    </Button>
  )
}

const SimpleIndexDeploy = () => {
  const chainId = useAtomValue(chainIdAtom)
  const [inputToken, setInputToken] = useAtom(inputTokenAtom)
  const inputBalance = useAtomValue(inputBalanceAtom)
  const defaultInputToken = useAtomValue(defaultInputTokenAtom)
  const form = useAtomValue(indexDeployFormDataAtom)
  const [inputAmount, setInputAmount] = useAtom(inputAmountAtom)
  const [slippage, setSlippage] = useAtom(slippageAtom)
  const zapDeployPayload = useAtomValue(zapDeployPayloadAtom)
  const tokens = useAtomValue(tokensAtom)
  const [ongoingTx, setOngoingTx] = useAtom(ongoingTxAtom)
  const formChainId = form?.chain

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

  const { data, isLoading, isFetching, refetch, failureReason } =
    useZapDeployQuery(url, requestBody, insufficientBalance || ongoingTx)

  const priceTo = data?.result?.amountOutValue
  const valueTo = data?.result?.amountOut

  useEffect(() => {
    setOngoingTx(false)
  }, [])

  if (!form) return null

  return (
    <div className="flex flex-col h-full gap-2">
      <div>
        <div className="flex items-center mx-2 mb-1">
          <h4 className="font-bold ml-4 mr-auto">
            How much do you want to mint?
          </h4>
          <RefreshQuote
            onClick={refetch}
            disabled={isFetching || ongoingTx || !zapDeployPayload}
          />
        </div>
        <div className="flex flex-col gap-1 px-2">
          <Swap
            from={{
              price: `$${formatCurrency(inputPrice)}`,
              address: tokenIn.address,
              symbol: tokenIn.symbol,
              balance: `${formatCurrency(Number(inputBalance?.balance || '0'))}`,
              value: inputAmount,
              onChange: setInputAmount,
              onMax,
              tokens,
              onTokenSelect: setInputToken,
            }}
            to={{
              title: 'You mint:',
              price: priceTo ? `$${formatCurrency(priceTo)}` : undefined,
              symbol: form.symbol,
              value: formatEther(BigInt(valueTo || 0)),
            }}
          />
          <SlippageSelector value={slippage} onChange={setSlippage} />
        </div>
      </div>
      <div className="p-2 pb-4">
        <TransactionButtonContainer chain={formChainId}>
          {data?.status === 'success' &&
          data?.result &&
          !insufficientBalance &&
          !isFetching &&
          !failureReason ? (
            <SimpleDeployButton data={data?.result} />
          ) : (
            <>
              <Button size="lg" className="w-full" disabled>
                {isLoading || isFetching
                  ? 'Loading...'
                  : insufficientBalance
                    ? 'Insufficient balance'
                    : 'Deploy'}
              </Button>
              {(data?.error || failureReason?.message) && (
                <div className="flex flex-col items-center gap-2">
                  <div className="text-red-500 text-sm text-center mt-2">
                    {data?.error || failureReason?.message}
                  </div>
                  <CopyPayloadButton />
                </div>
              )}
            </>
          )}
        </TransactionButtonContainer>
      </div>
    </div>
  )
}

export default SimpleIndexDeploy
