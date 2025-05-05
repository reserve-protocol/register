import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import useERC20Balance from '@/hooks/useERC20Balance'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { ArrowLeft, Settings } from 'lucide-react'
import { useEffect } from 'react'
import useTrackIndexDTFPage from '../../hooks/useTrackIndexDTFPage'
import {
  defaultSelectedTokenAtom,
  indexDTFBalanceAtom,
  selectedTokenAtom,
  tokensAtom,
} from '../../overview/components/zap-mint/atom'
import LowLiquidityWarning from '../../overview/components/zap-mint/low-liquidity-warning'
import RefreshQuote from '../../overview/components/zap-mint/refresh-quote'
import ZapSettings from '../../overview/components/zap-mint/zap-settings'
import AsyncMint from './async-mint'
import AsyncRedeem from './async-redeem'
import {
  asyncSwapFetchingAtom,
  asyncSwapInputAtom,
  asyncSwapOngoingTxAtom,
  asyncSwapRefetchAtom,
  currentAsyncSwapTabAtom,
  showAsyncSwapSettingsAtom,
} from './atom'
import Collaterals from './collaterals'
import OrderStatusUpdater from './order-status-updater'
import { isSafeMultisigAtom } from '@/state/atoms'
import GnosisSafeRequired from './gnosis-safe-required'

const AsyncSwaps = () => {
  useTrackIndexDTFPage('mint-async-swap')
  const isSafeMultisig = useAtomValue(isSafeMultisigAtom)
  const [currentTab, setCurrentTab] = useAtom(currentAsyncSwapTabAtom)
  const [showSettings, setShowSettings] = useAtom(showAsyncSwapSettingsAtom)
  const defaultToken = useAtomValue(defaultSelectedTokenAtom)
  const setSelectedToken = useSetAtom(selectedTokenAtom)
  const tokens = useAtomValue(tokensAtom)
  const indexDTF = useAtomValue(indexDTFAtom)
  const asyncSwapRefetch = useAtomValue(asyncSwapRefetchAtom)
  const asyncSwapFetching = useAtomValue(asyncSwapFetchingAtom)
  const asyncSwapOngoingTx = useAtomValue(asyncSwapOngoingTxAtom)
  const input = useAtomValue(asyncSwapInputAtom)
  const setIndexDTFBalance = useSetAtom(indexDTFBalanceAtom)
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
    setCurrentTab(tab as 'buy' | 'sell')
    setSelectedToken(tab === 'buy' ? tokens[0] : tokens[1])
  }

  useEffect(() => {
    return () => {
      reset()
    }
  }, [])

  if (!indexDTF) return null

  if (!isSafeMultisig) {
    return (
      <div className="container flex flex-col items-center sm:justify-start md:justify-center gap-2 lg:border-2 lg:border-secondary lg:bg-secondary/40 lg:h-[calc(100vh-100px)] dark:bg-card rounded-4xl w-full">
        <GnosisSafeRequired />
      </div>
    )
  }

  return (
    <div className="container flex flex-col items-center sm:justify-start md:justify-center gap-2 lg:border-2 lg:border-secondary lg:bg-secondary/40 lg:h-[calc(100vh-100px)] dark:bg-card rounded-4xl w-full">
      <div className="flex flex-col w-fit rounded-4xl p-1 ">
        <div className="bg-card rounded-3xl border-2 border-secondary lg:border-none sm:w-[420px] p-2 m-auto">
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

            <div className={showSettings ? 'hidden' : 'opacity-100'}>
              <div className="flex flex-col gap-1">
                <LowLiquidityWarning className="mt-3" />
                <TabsContent value="buy">
                  <AsyncMint />
                </TabsContent>
                <TabsContent value="sell">
                  <AsyncRedeem />
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </div>
      </div>
      <div>
        <OrderStatusUpdater />
        <Collaterals />
      </div>
    </div>
  )
}

export default AsyncSwaps
