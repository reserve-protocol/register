import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import useERC20Balance from '@/hooks/useERC20Balance'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { getFolioRoute } from '@/utils'
import { ROUTES } from '@/utils/constants'
import { useTrackIndexDTFZapClick } from '@/views/index-dtf/hooks/useTrackIndexDTFPage'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { ArrowLeft, Settings, X } from 'lucide-react'
import { ReactNode, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  asyncZapModeAtom,
  currentZapMintTabAtom,
  defaultSelectedTokenAtom,
  indexDTFBalanceAtom,
  openZapMintModalAtom,
  selectedTokenAtom,
  showZapSettingsAtom,
  zapFetchingAtom,
  zapMintInputAtom,
  zapOngoingTxAtom,
  zapRefetchAtom,
} from './atom'
import Buy from './buy'
import LowLiquidityWarning from './low-liquidity-warning'
import RefreshQuote from './refresh-quote'
import Sell from './sell'
import ZapSettings from './zap-settings'
import Help from '@/components/ui/help'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import AsyncMint from '../../../issuance/async-swaps/async-mint'
import AsyncRedeem from '../../../issuance/async-swaps/async-redeem'
import Collaterals from '../../../issuance/async-swaps/collaterals'
import OrderStatusUpdater from '../../../issuance/async-swaps/order-status-updater'
import { cn } from '@/lib/utils'
import { asyncSwapResponseAtom } from '../../../issuance/async-swaps/atom'

const ZapMint = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useAtom(openZapMintModalAtom)
  const currentTab = useAtomValue(currentZapMintTabAtom)
  const [asyncZapMode, setAsyncZapMode] = useAtom(asyncZapModeAtom)
  const [showSettings, setShowSettings] = useAtom(showZapSettingsAtom)
  const defaultToken = useAtomValue(defaultSelectedTokenAtom)
  const [selectedToken, setSelectedToken] = useAtom(selectedTokenAtom)
  const indexDTF = useAtomValue(indexDTFAtom)
  const zapRefetch = useAtomValue(zapRefetchAtom)
  const zapFetching = useAtomValue(zapFetchingAtom)
  const zapOngoingTx = useAtomValue(zapOngoingTxAtom)
  const input = useAtomValue(zapMintInputAtom)
  const asyncSwapResponse = useAtomValue(asyncSwapResponseAtom)
  const setIndexDTFBalance = useSetAtom(indexDTFBalanceAtom)
  const invalidInput = isNaN(Number(input)) || Number(input) === 0

  const { trackClick } = useTrackIndexDTFZapClick('overview', 'overview')

  const { data: balance } = useERC20Balance(indexDTF?.id)

  useEffect(() => {
    setIndexDTFBalance(balance || 0n)
  }, [balance, setIndexDTFBalance])

  useEffect(() => {
    if (open) {
      setShowSettings(false)
      setSelectedToken(defaultToken)
    }
    return () => {
      setShowSettings(false)
      setSelectedToken(defaultToken)
    }
  }, [open, defaultToken, setSelectedToken, setShowSettings])

  if (!indexDTF) return null

  const tokenIn =
    currentTab === 'buy' ? selectedToken || defaultToken : indexDTF.token
  const tokenOut =
    currentTab === 'sell' ? indexDTF.token : selectedToken || defaultToken

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        showClose={false}
        className={cn(
          'p-2 rounded-t-2xl sm:rounded-3xl border-none',
          asyncZapMode &&
            asyncSwapResponse &&
            'flex items-center gap-2 min-w-[840px]'
        )}
      >
        <div>
          <DialogTitle className="flex justify-between gap-2 p-2 sm:p-0 mb-2">
            {showSettings ? (
              <Button
                variant="outline"
                className="h-[34px] px-2 rounded-xl"
                onClick={() => setShowSettings(false)}
              >
                <ArrowLeft size={16} />
              </Button>
            ) : (
              <div className="flex justify-between gap-1">
                <Button
                  variant="outline"
                  className="h-[34px] px-2 rounded-xl"
                  onClick={() => {
                    trackClick('zap_settings', tokenIn.symbol, tokenOut.symbol)
                    setShowSettings(true)
                  }}
                >
                  <Settings size={16} />
                </Button>
                <RefreshQuote
                  small
                  onClick={() => {
                    trackClick('zap_refresh', tokenIn.symbol, tokenOut.symbol)
                    zapRefetch.fn?.()
                  }}
                  loading={zapFetching}
                  disabled={zapFetching || zapOngoingTx || invalidInput}
                />
              </div>
            )}
            <div className="ml-auto flex items-center gap-1 text-sm font-light">
              <Label className="flex items-center gap-1 text-sm font-light">
                Enable Async Zaps
                <Help
                  content={
                    <span className="text-sm text-wrap font-light">
                      Enable Async Zaps
                    </span>
                  }
                  size={14}
                  className="text-muted-foreground"
                />
              </Label>
              <Switch
                id="async-zap-mode"
                size="xs"
                checked={asyncZapMode}
                onCheckedChange={setAsyncZapMode}
              />
            </div>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-[34px] px-2 rounded-xl">
                <X size={16} />
              </Button>
            </DialogTrigger>
          </DialogTitle>
          {showSettings && <ZapSettings />}
          <div className={showSettings ? 'hidden' : 'opacity-100'}>
            <div className="flex flex-col gap-2">
              <LowLiquidityWarning />
              {!asyncZapMode && (currentTab === 'buy' ? <Buy /> : <Sell />)}
              {asyncZapMode &&
                (currentTab === 'buy' ? <AsyncMint /> : <AsyncRedeem />)}
            </div>
          </div>
          <div className="sm:hidden p-3 rounded-3xl mt-2 text-center text-sm">
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
              switch to manual {currentTab === 'buy' ? 'minting' : 'redeeming'}
            </Link>
          </div>
        </div>
        {asyncZapMode && (
          <div>
            <OrderStatusUpdater />
            <Collaterals />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default ZapMint
