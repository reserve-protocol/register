import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { ArrowLeft, Settings, X } from 'lucide-react'
import React, { useEffect } from 'react'
import { chainIdAtom, indexDTFAtom } from '../state/atoms'
import { ZapperProps } from '../types'
import { setCustomApiUrl } from '../types/api'
import { cn } from '../utils/cn'
import {
  trackQuoteRefresh,
  trackSettings,
  trackTabSwitch,
} from '../utils/tracking'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogTitle } from './ui/dialog'
import { Toaster } from './ui/sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import Updaters from './updaters'
import {
  defaultSelectedTokenAtom,
  openZapMintModalAtom,
  selectedTokenAtom,
  showZapSettingsAtom,
  zapFetchingAtom,
  zapMintInputAtom,
  zapOngoingTxAtom,
  zapperCurrentTabAtom,
  zapRefetchAtom,
} from './zap-mint/atom'
import Buy from './zap-mint/buy'
import LowLiquidityWarning from './zap-mint/low-liquidity-warning'
import RefreshQuote from './zap-mint/refresh-quote'
import Sell from './zap-mint/sell'
import ZapHealthcheck from './zap-mint/zap-healthcheck'
import ZapSettings from './zap-mint/zap-settings'

interface ZapperContentProps {
  mode: 'modal' | 'inline'
  onClose?: () => void
  className?: string
}

const ZapperContent: React.FC<ZapperContentProps> = ({
  mode,
  onClose,
  className,
}) => {
  const [currentTab, setCurrentTab] = useAtom(zapperCurrentTabAtom)
  const [showSettings, setShowSettings] = useAtom(showZapSettingsAtom)
  const defaultToken = useAtomValue(defaultSelectedTokenAtom)
  const setSelectedToken = useSetAtom(selectedTokenAtom)
  const chainId = useAtomValue(chainIdAtom)
  const indexDTF = useAtomValue(indexDTFAtom)
  const zapRefetch = useAtomValue(zapRefetchAtom)
  const zapFetching = useAtomValue(zapFetchingAtom)
  const zapOngoingTx = useAtomValue(zapOngoingTxAtom)
  const input = useAtomValue(zapMintInputAtom)
  const invalidInput = isNaN(Number(input)) || Number(input) === 0

  useEffect(() => {
    setShowSettings(false)
    setSelectedToken(defaultToken)
    return () => {
      setShowSettings(false)
      setSelectedToken(defaultToken)
    }
  }, [defaultToken, setSelectedToken, setShowSettings])

  const handleSettingsClick = () => {
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

  const handleRefreshClick = () => {
    zapRefetch.fn?.()
    trackQuoteRefresh('manual', indexDTF?.token.symbol, indexDTF?.id, chainId, {
      amount: input,
      tab: currentTab,
    })
  }

  const handleTabChange = (value: string) => {
    const newTab = value as 'buy' | 'sell'
    setCurrentTab(newTab)
    trackTabSwitch(newTab, indexDTF?.token.symbol, indexDTF?.id, chainId)
  }

  if (mode === 'inline') {
    return (
      <div className={cn('w-full max-w-md mx-auto', className)}>
        {showSettings ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(false)}
              >
                <ArrowLeft size={16} />
                Back
              </Button>
              <h3 className="font-semibold">Settings</h3>
            </div>
            <ZapSettings />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Zap</h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSettingsClick}
                >
                  <Settings size={16} />
                </Button>
                <RefreshQuote
                  small
                  onClick={handleRefreshClick}
                  loading={zapFetching}
                  disabled={zapFetching || zapOngoingTx || invalidInput}
                />
              </div>
            </div>

            <Tabs value={currentTab} onValueChange={handleTabChange}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="buy">Buy</TabsTrigger>
                <TabsTrigger value="sell">Sell</TabsTrigger>
              </TabsList>

              <div className="mt-4 space-y-4">
                <LowLiquidityWarning />
                <ZapHealthcheck />

                <TabsContent value="buy" className="mt-0">
                  <Buy />
                </TabsContent>
                <TabsContent value="sell" className="mt-0">
                  <Sell />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        )}
      </div>
    )
  }

  // Modal mode content
  return (
    <>
      <DialogTitle className="flex justify-between gap-2 sm:p-0">
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
              onClick={handleSettingsClick}
            >
              <Settings size={16} />
            </Button>
            <RefreshQuote
              small
              onClick={handleRefreshClick}
              loading={zapFetching}
              disabled={zapFetching || zapOngoingTx || invalidInput}
            />
          </div>
        )}
        {onClose && (
          <Button
            variant="outline"
            className="h-[34px] px-2 rounded-xl"
            onClick={onClose}
          >
            <X size={16} />
          </Button>
        )}
      </DialogTitle>

      {showSettings && <ZapSettings />}

      <div className={showSettings ? 'hidden' : 'opacity-100'}>
        <div className="flex flex-col gap-2">
          <LowLiquidityWarning />
          <ZapHealthcheck />
          {currentTab === 'buy' ? <Buy /> : <Sell />}
        </div>
      </div>
    </>
  )
}

// Hook to open the zapper modal
export const useZapperModal = () => {
  const setOpen = useSetAtom(openZapMintModalAtom)

  return {
    open: () => setOpen(true),
    close: () => setOpen(false),
  }
}

export const Zapper: React.FC<ZapperProps> = ({
  mode = 'modal',
  chain,
  dtfAddress,
  apiUrl,
}) => {
  const [open, setOpen] = useAtom(openZapMintModalAtom)

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
  }

  const handleClose = () => {
    handleOpenChange(false)
  }

  // Set custom API URL if provided
  useEffect(() => {
    if (apiUrl) {
      setCustomApiUrl(apiUrl)
    }
  }, [apiUrl])

  // Modal mode only - as per original implementation
  return (
    <>
      <Updaters dtfAddress={dtfAddress} chainId={chain} />
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          showClose={false}
          className="p-2 rounded-t-2xl sm:rounded-3xl border-none"
        >
          <ZapperContent mode={mode} onClose={handleClose} />
        </DialogContent>
      </Dialog>
      <Toaster />
    </>
  )
}

export default Zapper
