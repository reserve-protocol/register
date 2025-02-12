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
import { X } from 'lucide-react'
import { ReactNode, useEffect } from 'react'
import {
  currentZapMintTabAtom,
  indexDTFBalanceAtom,
  zapFetchingAtom,
  zapMintInputAtom,
  zapOngoingTxAtom,
  zapRefetchAtom,
} from './atom'
import Buy from './buy'
import RefreshQuote from './refresh-quote'
import Sell from './sell'

const ZapMint = ({ children }: { children: ReactNode }) => {
  const currentTab = useAtomValue(currentZapMintTabAtom)
  const indexDTF = useAtomValue(indexDTFAtom)
  const zapRefetch = useAtomValue(zapRefetchAtom)
  const zapFetching = useAtomValue(zapFetchingAtom)
  const zapOngoingTx = useAtomValue(zapOngoingTxAtom)
  const [input, setInput] = useAtom(zapMintInputAtom)
  const setIndexDTFBalance = useSetAtom(indexDTFBalanceAtom)
  const invalidInput = isNaN(Number(input)) || Number(input) === 0

  const { data: balance } = useERC20Balance(indexDTF?.id)

  useEffect(() => {
    setIndexDTFBalance(balance || 0n)
  }, [balance, setIndexDTFBalance])

  if (!indexDTF) return null

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        showClose={false}
        className="p-2 sm:rounded-3xl border-none"
      >
        <DialogTitle className="flex justify-between gap-2">
          <RefreshQuote
            small
            onClick={zapRefetch.fn}
            disabled={zapFetching || zapOngoingTx || invalidInput}
          />
          <DialogTrigger asChild>
            <Button variant="outline" className="h-[34px] px-2 rounded-xl">
              <X size={16} />
            </Button>
          </DialogTrigger>
        </DialogTitle>
        <div className="flex-grow overflow-auto relative mt-0">
          {currentTab === 'buy' ? <Buy /> : <Sell />}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ZapMint
