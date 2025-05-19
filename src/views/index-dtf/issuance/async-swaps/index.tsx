import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import useERC20Balance from '@/hooks/useERC20Balance'
import { cn } from '@/lib/utils'
import { isSafeMultisigAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { ArrowLeft, Settings } from 'lucide-react'
import { useEffect } from 'react'
import useTrackIndexDTFPage from '../../hooks/useTrackIndexDTFPage'
import RefreshQuote from '../../overview/components/zap-mint/refresh-quote'
import ZapSettings from '../../overview/components/zap-mint/zap-settings'
import Updater from '../manual/updater'
import AsyncMint from './async-mint'
import AsyncRedeem from './async-redeem'
import {
  asyncSwapFetchingAtom,
  asyncSwapInputAtom,
  asyncSwapOngoingTxAtom,
  asyncSwapRefetchAtom,
  currentAsyncSwapTabAtom,
  defaultSelectedTokenAtom,
  indexDTFBalanceAtom,
  mintTxHashAtom,
  selectedTokenAtom,
  showAsyncSwapSettingsAtom,
} from './atom'
import Collaterals, { showCollateralsAtom } from './collaterals'
import GnosisSafeRequired from './gnosis-safe-required'
import OrderStatusUpdater from './order-status-updater'
import Success from './success'

function Content() {
  const showSettings = useAtomValue(showAsyncSwapSettingsAtom)
  const showCollaterals = useAtomValue(showCollateralsAtom)

  return (
    <div id="parent" className="flex flex-1">
      <div
        id="child-1"
        className={cn('flex-1', showSettings ? 'hidden' : 'opacity-100')}
      >
        <div className="flex flex-col gap-1 sm:w-[420px] h-full">
          <TabsContent value="mint" className="mt-1">
            <AsyncMint />
          </TabsContent>
          <TabsContent value="redeem" className="mt-1">
            <AsyncRedeem />
          </TabsContent>
        </div>
      </div>
      <div
        id="child-2"
        className={cn(
          'bg-background rounded-3xl flex-1 flex flex-col mt-1 border-secondary',
          showCollaterals && 'border-l-4'
        )}
      >
        <OrderStatusUpdater />
        <Collaterals />
      </div>
    </div>
  )
}

const AsyncSwaps = () => {
  useTrackIndexDTFPage('mint-async-swap')
  const isSafeMultisig = useAtomValue(isSafeMultisigAtom)
  const [currentTab, setCurrentTab] = useAtom(currentAsyncSwapTabAtom)
  const [showSettings, setShowSettings] = useAtom(showAsyncSwapSettingsAtom)
  const defaultToken = useAtomValue(defaultSelectedTokenAtom)
  const setSelectedToken = useSetAtom(selectedTokenAtom)
  const indexDTF = useAtomValue(indexDTFAtom)
  const asyncSwapRefetch = useAtomValue(asyncSwapRefetchAtom)
  const asyncSwapFetching = useAtomValue(asyncSwapFetchingAtom)
  const asyncSwapOngoingTx = useAtomValue(asyncSwapOngoingTxAtom)
  const input = useAtomValue(asyncSwapInputAtom)
  const setIndexDTFBalance = useSetAtom(indexDTFBalanceAtom)
  const mintTxHash = useAtomValue(mintTxHashAtom)
  const invalidInput = isNaN(Number(input)) || Number(input) === 0

  const { data: balance } = useERC20Balance(indexDTF?.id)

  useEffect(() => {
    setIndexDTFBalance(balance || 0n)
  }, [balance, setIndexDTFBalance])

  const reset = () => {
    setShowSettings(false)
    setSelectedToken(defaultToken)
  }

  const changeTab = (tab: string) => {
    setCurrentTab(tab as 'mint' | 'redeem')
  }

  useEffect(() => {
    return () => {
      reset()
    }
  }, [])

  if (!indexDTF) return null

  if (isSafeMultisig) {
    return (
      <div className="container flex flex-col items-center sm:justify-start md:justify-center gap-2 lg:border-2 lg:border-secondary lg:bg-secondary/30 lg:h-[calc(100vh-100px)] dark:bg-card rounded-4xl w-full">
        <GnosisSafeRequired />
      </div>
    )
  }

  if (mintTxHash) {
    return (
      <div className="container flex items-center sm:justify-start md:justify-center gap-2 lg:border-2 lg:border-secondary lg:bg-secondary/30 lg:h-[calc(100vh-100px)] dark:bg-card rounded-4xl w-full">
        <div className="flex flex-col w-fit rounded-4xl p-1">
          <div className="rounded-3xl border-2 border-secondary lg:border-none sm:min-w-[420px] p-1 m-auto">
            <Success />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container flex items-center sm:justify-start md:justify-center gap-2 lg:border-2 lg:border-secondary lg:bg-secondary/30 lg:h-[calc(100vh-100px)] dark:bg-card rounded-4xl w-full">
      <div className="flex flex-col w-fit rounded-4xl p-1">
        <Updater />
        <div className="bg-secondary rounded-3xl border-2 border-secondary lg:border-none sm:min-w-[420px] p-1 m-auto">
          <Tabs
            value={currentTab}
            className="flex flex-col flex-grow"
            onValueChange={changeTab}
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
                  <div className="bg-background p-2 rounded-3xl">
                    <TabsList className="h-8 px-0.5">
                      <TabsTrigger
                        value="mint"
                        className="px-2 py-1 data-[state=active]:text-primary"
                      >
                        Auto Mint
                      </TabsTrigger>
                      <TabsTrigger
                        value="redeem"
                        className="px-2 py-1 data-[state=active]:text-primary"
                      >
                        Auto Redeem
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  <div className="flex items-center gap-1 bg-background px-2 rounded-3xl">
                    <Button
                      variant="outline"
                      className="h-[34px] px-2 rounded-xl"
                      onClick={() => setShowSettings(true)}
                    >
                      <Settings size={16} />
                    </Button>
                    <RefreshQuote
                      small
                      onClick={asyncSwapRefetch.fn}
                      loading={asyncSwapFetching}
                      disabled={
                        asyncSwapFetching || asyncSwapOngoingTx || invalidInput
                      }
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

            <Content />
          </Tabs>
        </div>
      </div>
    </div>
  )
}

export default AsyncSwaps
