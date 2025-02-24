import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTrigger,
} from '@/components/ui/drawer'
import useERC20Balance from '@/hooks/useERC20Balance'
import useMediaQuery from '@/hooks/useMediaQuery'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { ArrowLeft, Settings, X } from 'lucide-react'
import { ReactNode, useEffect } from 'react'
import {
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
import RefreshQuote from './refresh-quote'
import Sell from './sell'
import ZapSettings from './zap-settings'
import { useTrackIndexDTFZapClick } from '@/views/index-dtf/hooks/useTrackIndexDTFPage'
import LowLiquidityWarning from './low-liquidity-warning'

const ZapMint = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useAtom(openZapMintModalAtom)
  const currentTab = useAtomValue(currentZapMintTabAtom)
  const [showSettings, setShowSettings] = useAtom(showZapSettingsAtom)
  const defaultToken = useAtomValue(defaultSelectedTokenAtom)
  const [selectedToken, setSelectedToken] = useAtom(selectedTokenAtom)
  const indexDTF = useAtomValue(indexDTFAtom)
  const zapRefetch = useAtomValue(zapRefetchAtom)
  const zapFetching = useAtomValue(zapFetchingAtom)
  const zapOngoingTx = useAtomValue(zapOngoingTxAtom)
  const input = useAtomValue(zapMintInputAtom)
  const setIndexDTFBalance = useSetAtom(indexDTFBalanceAtom)
  const invalidInput = isNaN(Number(input)) || Number(input) === 0
  const isDesktop = useMediaQuery('(min-width: 768px)')

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

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent
          showClose={false}
          className="p-2 sm:rounded-3xl border-none"
        >
          <DialogTitle className="flex justify-between gap-2">
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
              {currentTab === 'buy' ? <Buy /> : <Sell />}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen} direction="bottom">
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent
        showClose={false}
        className="bottom-0 top-auto left-0 right-0 rounded-b-none overflow-hidden"
      >
        <DrawerHeader className="flex justify-between gap-2">
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
          )}
          <DrawerClose asChild>
            <Button variant="outline" className="h-[34px] px-2 rounded-xl">
              <X size={16} />
            </Button>
          </DrawerClose>
        </DrawerHeader>
        <div className="p-2 ">
          {showSettings && <ZapSettings />}
          <div className={showSettings ? 'hidden' : 'opacity-100'}>
            {currentTab === 'buy' ? <Buy /> : <Sell />}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default ZapMint
