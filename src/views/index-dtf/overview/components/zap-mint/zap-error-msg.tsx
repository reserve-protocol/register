import TransactionError from '@/components/transaction-error/TransactionError'
import { useAtomValue } from 'jotai'
import { currentZapMintTabAtom, zapSwapEndpointAtom } from './atom'
import Copy from '@/components/ui/copy'
import { Link } from 'react-router-dom'
import { getFolioRoute } from '@/utils'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { ROUTES } from '@/utils/constants'

const SWAP_ERROR_MSG =
  'Sorry, we’re having a hard time finding a route that makes sense for you. Please try again in a bit.'
const ERROR_MAP = {
  '404': SWAP_ERROR_MSG,
  '500': SWAP_ERROR_MSG,
  '504': SWAP_ERROR_MSG,
  'failed to construct swap': SWAP_ERROR_MSG,
  INSUFFICIENT_OUT:
    'Sorry, the market is volatile right now. Please increase slippage in your settings.',
}

const CopySwapButton = () => {
  const endpoint = useAtomValue(zapSwapEndpointAtom)
  return (
    <div className="flex items-center gap-1 text-xs mx-auto">
      <div>Copy swap params to share with engineering team</div>
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
        Having issues minting? (Zaps are in beta)
      </span>
      <span className="text-legend">Wait and try again or</span>{' '}
      <Link
        to={getFolioRoute(
          indexDTF.id,
          indexDTF.chainId,
          ROUTES.ISSUANCE + '/manual'
        )}
        className="text-primary underline"
      >
        switch to manual redeeming
      </Link>
    </div>
  )
}

const ZapErrorMsg = ({ error }: { error?: string }) => {
  if (!error) return null

  const errorMsg =
    Object.entries(ERROR_MAP).find(([key]) =>
      error.toLowerCase().includes(key.toLowerCase())
    )?.[1] || error

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
  if (!error) return null

  const errorMsg =
    Object.entries(ERROR_MAP).find(([key]) =>
      error?.message?.toLowerCase().includes(key.toLowerCase())
    )?.[1] || error?.message

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
