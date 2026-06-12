import TransactionError from '@/components/transaction-error/TransactionError'
import { msg } from '@lingui/core/macro'
import type { MessageDescriptor } from '@lingui/core'
import { Trans, useLingui } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import { currentZapMintTabAtom, zapSwapEndpointAtom } from './atom'
import Copy from '@/components/ui/copy'
import { Link } from 'react-router-dom'
import { getFolioRoute } from '@/utils'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { ROUTES } from '@/utils/constants'

const SWAP_ERROR_MSG = msg`Sorry, we’re having a hard time finding a route that makes sense for you. Please try again in a bit.`
const ERROR_MAP: Record<string, MessageDescriptor> = {
  '404': SWAP_ERROR_MSG,
  '500': SWAP_ERROR_MSG,
  '504': SWAP_ERROR_MSG,
  'failed to construct swap': SWAP_ERROR_MSG,
  INSUFFICIENT_OUT: msg`Sorry, the market is volatile right now. Please increase slippage in your settings.`,
}

const CopySwapButton = () => {
  const endpoint = useAtomValue(zapSwapEndpointAtom)
  return (
    <div className="flex items-center gap-1 text-xs mx-auto">
      <div>
        <Trans>Copy swap params to share with engineering team</Trans>
      </div>
      <Copy value={endpoint} />
    </div>
  )
}

const GoToManualRedeem = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const currentTab = useAtomValue(currentZapMintTabAtom)
  const isRedeem = currentTab === 'sell'

  if (!isRedeem || !indexDTF) return null

  return (
    <div className="mt-2 hidden sm:block p-3 rounded-3xl text-center text-sm">
      <span className="font-semibold block">
        <Trans>Having issues minting? (Zaps are in beta)</Trans>
      </span>
      <span className="text-legend">
        <Trans>Wait and try again or</Trans>
      </span>{' '}
      <Link
        to={getFolioRoute(
          indexDTF.id,
          indexDTF.chainId,
          ROUTES.ISSUANCE + '/manual'
        )}
        className="text-primary underline"
      >
        <Trans>switch to manual redeeming</Trans>
      </Link>
    </div>
  )
}

const ZapErrorMsg = ({ error }: { error?: string }) => {
  const { t } = useLingui()
  if (!error) return null

  const match = Object.entries(ERROR_MAP).find(([key]) =>
    error.toLowerCase().includes(key.toLowerCase())
  )?.[1]
  const errorMsg = match ? t(match) : error

  return (
    <>
      <div className="flex flex-col gap-2 items-center justify-center">
        <div className="text-red-500 text-sm text-center mt-2">{errorMsg}</div>
        <CopySwapButton />
      </div>
      <GoToManualRedeem />
    </>
  )
}

export const ZapTxErrorMsg = ({ error }: { error?: Error | null }) => {
  const { t } = useLingui()
  if (!error) return null

  const match = Object.entries(ERROR_MAP).find(([key]) =>
    error?.message?.toLowerCase().includes(key.toLowerCase())
  )?.[1]
  const errorMsg = match ? t(match) : error?.message

  const newError = new Error(errorMsg)

  return (
    <>
      <TransactionError
        error={newError}
        className="text-center"
        withName={false}
      />
      {error && <CopySwapButton />}
    </>
  )
}

export default ZapErrorMsg
