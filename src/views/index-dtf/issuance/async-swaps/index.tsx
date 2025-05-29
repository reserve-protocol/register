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
import Updater from '../manual/updater'
import AsyncMint from './async-mint'
import AsyncRedeem from './async-redeem'
import {
  asyncSwapResponseAtom,
  fetchingQuotesAtom,
  indexDTFBalanceAtom,
  operationAtom,
  redeemAssetsAtom,
  refetchQuotesAtom,
  showSettingsAtom,
  successAtom,
  userInputAtom,
} from './atom'
import Collaterals, { showCollateralsAtom } from './collaterals'
import GnosisSafeRequired from './gnosis-safe-required'
import { GlobalProtocolKitProvider } from './providers/GlobalProtocolKitProvider'
import Success from './success'
import Config from './settings'

function Content() {
  const showSettings = useAtomValue(showSettingsAtom)
  const showCollaterals = useAtomValue(showCollateralsAtom)

  return (
    <div
      id="parent"
      className={cn('flex flex-1', showSettings ? 'hidden' : 'opacity-100')}
    >
      <div id="child-1">
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
        <Collaterals />
      </div>
    </div>
  )
}

const Header = () => {
  const [showSettings, setShowSettings] = useAtom(showSettingsAtom)
  const refetchQuote = useAtomValue(refetchQuotesAtom)
  const fetchingQuotes = useAtomValue(fetchingQuotesAtom)
  const input = useAtomValue(userInputAtom)
  const invalidInput = isNaN(Number(input)) || Number(input) === 0
  const asyncSwapResponse = useAtomValue(asyncSwapResponseAtom)
  const redeemAssets = useAtomValue(redeemAssetsAtom)
  const disableActions =
    !!asyncSwapResponse || Object.keys(redeemAssets).length > 0

  return (
    <div className="flex justify-between gap-2">
      {showSettings ? (
        <div className="bg-background p-1.5 rounded-2xl">
          <Button
            variant="outline"
            className="h-[34px] px-2 rounded-xl"
            onClick={() => setShowSettings(false)}
          >
            <ArrowLeft size={16} />
          </Button>
        </div>
      ) : (
        <>
          <div className="bg-background p-2 rounded-3xl">
            <TabsList className="h-8 px-0.5">
              <TabsTrigger
                value="mint"
                className="px-2 py-1 data-[state=active]:text-primary"
                disabled={disableActions}
              >
                Auto Mint
              </TabsTrigger>
              <TabsTrigger
                value="redeem"
                className="px-2 py-1 data-[state=active]:text-primary"
                disabled={disableActions}
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
              disabled={disableActions}
            >
              <Settings size={16} />
            </Button>
            <RefreshQuote
              small
              onClick={refetchQuote.fn}
              loading={fetchingQuotes}
              disabled={fetchingQuotes || invalidInput || disableActions}
            />
          </div>
        </>
      )}
    </div>
  )
}

const AsyncSwaps = () => {
  useTrackIndexDTFPage('mint-async-swap')
  const isSafeMultisig = useAtomValue(isSafeMultisigAtom)
  const [currentTab, setCurrentTab] = useAtom(operationAtom)
  const [showSettings, setShowSettings] = useAtom(showSettingsAtom)
  const indexDTF = useAtomValue(indexDTFAtom)
  const setIndexDTFBalance = useSetAtom(indexDTFBalanceAtom)
  const success = useAtomValue(successAtom)

  const { data: balance } = useERC20Balance(indexDTF?.id)

  useEffect(() => {
    setIndexDTFBalance(balance || 0n)
  }, [balance, setIndexDTFBalance])

  const reset = () => {
    setShowSettings(false)
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

  if (!isSafeMultisig) {
    return (
      <div className="container flex flex-col items-center sm:justify-start md:justify-center gap-2 lg:border-2 lg:border-secondary lg:bg-secondary/30 lg:h-[calc(100vh-100px)] dark:bg-card rounded-4xl w-full">
        <GnosisSafeRequired />
      </div>
    )
  }

  if (success) {
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
            <Header />

            {showSettings && (
              <div className="mt-1">
                <Config />
              </div>
            )}

            <Content />
          </Tabs>
        </div>
      </div>
    </div>
  )
}

const AsyncSwapsWithProvider = () => {
  return (
    <GlobalProtocolKitProvider>
      <AsyncSwaps />
    </GlobalProtocolKitProvider>
  )
}

export default AsyncSwapsWithProvider
