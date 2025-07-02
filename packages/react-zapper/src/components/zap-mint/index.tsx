import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { ArrowLeft, Settings, X } from 'lucide-react'
import { ReactNode, useEffect } from 'react'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '../ui/dialog'
import { indexDTFAtom, chainIdAtom } from '../../state/atoms'
import {
  zapperCurrentTabAtom,
  defaultSelectedTokenAtom,
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
import ZapHealthcheck from './zap-healthcheck'
import RefreshQuote from './refresh-quote'
import Sell from './sell'
import ZapSettings from './zap-settings'
import {
  trackZapperModal,
  trackSettings,
  trackQuoteRefresh,
} from '../../utils/tracking'

const ZapMint = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useAtom(openZapMintModalAtom)
  const currentTab = useAtomValue(zapperCurrentTabAtom)
  const [showSettings, setShowSettings] = useAtom(showZapSettingsAtom)
  const defaultToken = useAtomValue(defaultSelectedTokenAtom)
  const [selectedToken, setSelectedToken] = useAtom(selectedTokenAtom)
  const indexDTF = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)
  const zapRefetch = useAtomValue(zapRefetchAtom)
  const zapFetching = useAtomValue(zapFetchingAtom)
  const zapOngoingTx = useAtomValue(zapOngoingTxAtom)
  const input = useAtomValue(zapMintInputAtom)
  const invalidInput = isNaN(Number(input)) || Number(input) === 0

  // Balance management is handled externally via props

  useEffect(() => {
    if (open) {
      setShowSettings(false)
      setSelectedToken(defaultToken)
      // Track modal open
      trackZapperModal('open', indexDTF?.token.symbol, indexDTF?.id, chainId)
    }
    return () => {
      setShowSettings(false)
      setSelectedToken(defaultToken)
      // Track modal close if it was open
      if (open) {
        trackZapperModal('close', indexDTF?.token.symbol, indexDTF?.id, chainId)
      }
    }
  }, [open, defaultToken, setSelectedToken, setShowSettings, indexDTF, chainId])

  if (!indexDTF) return null

  const handleSettingsOpen = () => {
    setShowSettings(true)
    trackSettings(
      'open',
      undefined,
      undefined,
      indexDTF?.token.symbol,
      indexDTF?.id,
      chainId
    )
  }

  const handleSettingsClose = () => {
    setShowSettings(false)
    trackSettings(
      'close',
      undefined,
      undefined,
      indexDTF?.token.symbol,
      indexDTF?.id,
      chainId
    )
  }

  const handleQuoteRefresh = () => {
    zapRefetch.fn?.()
    trackQuoteRefresh('manual', indexDTF?.token.symbol, indexDTF?.id, chainId, {
      amount: input,
      tab: currentTab,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        showClose={false}
        className="p-2 rounded-t-2xl sm:rounded-3xl border-none"
      >
        <DialogTitle className="flex justify-between gap-2 p-2 sm:p-0">
          {showSettings ? (
            <Button
              variant="outline"
              className="h-[34px] px-2 rounded-xl"
              onClick={handleSettingsClose}
            >
              <ArrowLeft size={16} />
            </Button>
          ) : (
            <div className="flex justify-between gap-1">
              <Button
                variant="outline"
                className="h-[34px] px-2 rounded-xl"
                onClick={handleSettingsOpen}
              >
                <Settings size={16} />
              </Button>
              <RefreshQuote
                small
                onClick={handleQuoteRefresh}
                loading={zapFetching}
                disabled={zapFetching || zapOngoingTx || invalidInput}
              />
            </div>
          )}
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
            <ZapHealthcheck />
            {currentTab === 'buy' ? <Buy /> : <Sell />}
          </div>
        </div>
        <div className="sm:hidden p-3 rounded-3xl mt-2 text-center text-sm">
          <span className="font-semibold block">
            Having issues? (Zaps are in beta)
          </span>
          <span className="text-legend">
            Wait and try again or consider using manual mode
          </span>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ZapMint
