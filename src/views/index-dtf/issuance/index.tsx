import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import useERC20Balance from '@/hooks/useERC20Balance'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { ArrowLeft, Settings } from 'lucide-react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  currentZapMintTabAtom,
  defaultSelectedTokenAtom,
  indexDTFBalanceAtom,
  selectedTokenAtom,
  showZapSettingsAtom,
  tokensAtom,
  zapFetchingAtom,
  zapMintInputAtom,
  zapOngoingTxAtom,
  zapRefetchAtom,
} from '../overview/components/zap-mint/atom'
import Buy from '../overview/components/zap-mint/buy'
import RefreshQuote from '../overview/components/zap-mint/refresh-quote'
import Sell from '../overview/components/zap-mint/sell'
import ZapSettings from '../overview/components/zap-mint/zap-settings'

const IndexDTFIssuance = () => {
  const [currentTab, setCurrentTab] = useAtom(currentZapMintTabAtom)
  const [showSettings, setShowSettings] = useAtom(showZapSettingsAtom)
  const defaultToken = useAtomValue(defaultSelectedTokenAtom)
  const setSelectedToken = useSetAtom(selectedTokenAtom)
  const tokens = useAtomValue(tokensAtom)
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

  return (
    <div className="flex flex-col gap-4 sm:w-[560px] mx-auto">
      <div className="mt-14 bg-card rounded-xl p-2 border border-border">
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
                <TabsList className="h-9">
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
            <TabsContent value="buy">
              <Buy />
            </TabsContent>
            <TabsContent value="sell">
              <Sell />
            </TabsContent>
          </div>
        </Tabs>
      </div>
      <div className="w-full sm:w-[560px] mx-auto">
        <div className="rounded-xl border p-4 flex items-center gap-2 mx-0.5">
          <p className="text-sm text-muted-foreground mr-auto">
            Having issues {currentTab === 'buy' ? 'minting' : 'redeeming'}?
          </p>
          <Link to={`./manual`}>
            <Button variant="muted" size="xs">
              Switch to manual {currentTab === 'buy' ? 'minting' : 'redeeming'}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default IndexDTFIssuance
