import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import useERC20Balance from '@/hooks/useERC20Balance'
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

const ZapMint = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useAtom(openZapMintModalAtom)
  const currentTab = useAtomValue(currentZapMintTabAtom)
  const [showSettings, setShowSettings] = useAtom(showZapSettingsAtom)
  const defaultToken = useAtomValue(defaultSelectedTokenAtom)
  const setSelectedToken = useSetAtom(selectedTokenAtom)
  const indexDTF = useAtomValue(indexDTFAtom)
  const zapRefetch = useAtomValue(zapRefetchAtom)
  const zapFetching = useAtomValue(zapFetchingAtom)
  const zapOngoingTx = useAtomValue(zapOngoingTxAtom)
  const input = useAtomValue(zapMintInputAtom)
  const setIndexDTFBalance = useSetAtom(indexDTFBalanceAtom)
  const invalidInput = isNaN(Number(input)) || Number(input) === 0

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
          <DialogTrigger asChild>
            <Button variant="outline" className="h-[34px] px-2 rounded-xl">
              <X size={16} />
            </Button>
          </DialogTrigger>
        </DialogTitle>
        {showSettings && <ZapSettings />}
        <div className={showSettings ? 'hidden' : 'opacity-100'}>
          {currentTab === 'buy' ? <Buy /> : <Sell />}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ZapMint
