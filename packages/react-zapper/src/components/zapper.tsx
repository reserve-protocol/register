import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { ArrowLeft, Settings, X } from 'lucide-react'
import React, { useEffect } from 'react'
import { chainIdAtom, indexDTFAtom } from '../state/atoms'
import { ZapperProps } from '../types'
import { setCustomApiUrl } from '../types/api'
import {
  trackQuoteRefresh,
  trackSettings,
  trackTabSwitch,
} from '../utils/tracking'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogTitle } from './ui/dialog'
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
import useNotification from '../hooks/use-notification'

interface ZapperContentProps {
  mode: 'modal' | 'inline'
  onClose?: () => void
  className?: string
}

const ZapperContent: React.FC<ZapperContentProps> = ({ mode, className }) => {
  const [open, setOpen] = useAtom(openZapMintModalAtom)
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

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
  }

  const handleClose = () => {
    handleOpenChange(false)
  }

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
      <Tabs
        value={currentTab}
        className="flex flex-col flex-grow"
        onValueChange={handleTabChange}
      >
        <div className="flex justify-between gap-2">
          {showSettings ? (
            <Button
              variant="outline"
              className="h-[34px] px-2 rounded-xl"
              onClick={() => setShowSettings(false)}
            >
              <ArrowLeft size={16} />
            </Button>
          ) : (
            <>
              <TabsList className="h-9 px-0.5">
                <TabsTrigger value="buy">Buy</TabsTrigger>
                <TabsTrigger value="sell">Sell</TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  className="h-[34px] px-2 rounded-xl"
                  onClick={() => setShowSettings(true)}
                >
                  <Settings size={16} />
                </Button>
                <RefreshQuote
                  small
                  onClick={zapRefetch.fn}
                  loading={zapFetching}
                  disabled={zapFetching || zapOngoingTx || invalidInput}
                />
              </div>
            </>
          )}
        </div>
        {showSettings && (
          <div className="mt-2">
            <ZapSettings />
          </div>
        )}

        <div className={showSettings ? 'hidden' : 'opacity-100'}>
          <div className="flex flex-col">
            <LowLiquidityWarning className="mt-2" />
            <ZapHealthcheck className="mt-2" />
            <TabsContent value="buy">
              <Buy />
            </TabsContent>
            <TabsContent value="sell">
              <Sell />
            </TabsContent>
          </div>
        </div>
      </Tabs>
    )
  }

  // Modal mode content
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showClose={false}
        className="p-2 rounded-t-2xl sm:rounded-3xl border-none"
      >
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
          <Button
            variant="outline"
            className="h-[34px] px-2 rounded-xl"
            onClick={handleClose}
          >
            <X size={16} />
          </Button>
        </DialogTitle>

        {showSettings && <ZapSettings />}

        <div className={showSettings ? 'hidden' : 'opacity-100'}>
          <div className="flex flex-col gap-2">
            <LowLiquidityWarning />
            <ZapHealthcheck />
            {currentTab === 'buy' ? <Buy /> : <Sell />}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export const Zapper: React.FC<ZapperProps> = ({
  mode = 'modal',
  chain,
  dtfAddress,
  apiUrl,
}) => {
  useEffect(() => {
    if (apiUrl) {
      setCustomApiUrl(apiUrl)
    }
  }, [apiUrl])

  return (
    <>
      <Updaters dtfAddress={dtfAddress} chainId={chain} />
      <ZapperContent mode={mode} />
    </>
  )
}

export default Zapper
