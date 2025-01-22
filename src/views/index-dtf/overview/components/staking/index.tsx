import dtfIndexStakingVault from '@/abis/dtf-index-staking-vault'
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import Swap from '@/components/ui/swap'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAssetPrice } from '@/hooks/useAssetPrices'
import useERC20Balance from '@/hooks/useERC20Balance'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { formatCurrency } from '@/utils'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { Minus, Plus } from 'lucide-react'
import { ReactNode, useEffect } from 'react'
import { formatUnits, parseUnits } from 'viem'
import { useReadContract } from 'wagmi'
import {
  inputBalanceAtom,
  inputPriceAtom,
  stakingInputAtom,
  underlyingBalanceAtom,
  underlyingStTokenPriceAtom,
} from './atoms'
import SubmitStakeButton from './submit-stake-button'

const TABS = [
  {
    key: 'lock',
    label: 'Vote lock',
    icon: <Plus size={16} />,
  },
  {
    key: 'unlock',
    label: 'Unlock',
    icon: <Minus size={16} />,
  },
]

const Staking = ({ children }: { children: ReactNode }) => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const [input, onChange] = useAtom(stakingInputAtom)
  const inputPrice = useAtomValue(inputPriceAtom)
  const inputBalance = useAtomValue(inputBalanceAtom)
  const setUnderlyingPrice = useSetAtom(underlyingStTokenPriceAtom)
  const setUnderlyingBalance = useSetAtom(underlyingBalanceAtom)

  const { data: priceResponse } = useAssetPrice(
    indexDTF?.stToken?.underlying.address
  )

  const { data: balance } = useERC20Balance(
    indexDTF?.stToken?.underlying.address
  )

  const { data: shares } = useReadContract({
    abi: dtfIndexStakingVault,
    functionName: 'convertToShares',
    address: indexDTF?.stToken?.id,
    args: [parseUnits(input, indexDTF?.stToken?.underlying.decimals || 18)],
  })

  useEffect(() => {
    setUnderlyingPrice(priceResponse?.[0]?.price)
  }, [priceResponse, setUnderlyingPrice])

  useEffect(() => {
    setUnderlyingBalance(balance)
  }, [balance, setUnderlyingBalance])

  const onMax = () => {
    onChange(inputBalance)
  }

  if (!indexDTF || !indexDTF.stToken) {
    return null
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <Tabs
          defaultValue="lock"
          className="flex flex-col flex-grow overflow-hidden relative"
        >
          <DrawerTitle className="flex gap-2 mt-2 px-2 mb-2">
            <TabsList className="h-9">
              {TABS.map(({ key, label, icon }) => (
                <TabsTrigger
                  key={key}
                  value={key}
                  className="flex gap-1 items-center pl-2 pr-3 data-[state=active]:text-primary"
                >
                  {icon}
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </DrawerTitle>
          <TabsContent
            value="lock"
            className="flex-grow overflow-auto p-2 mt-0"
          >
            <Swap
              from={{
                title: 'You lock:',
                address: indexDTF.stToken.underlying.address,
                symbol: indexDTF.stToken.underlying.symbol,
                value: input,
                onChange,
                price: `$${formatCurrency(inputPrice)}`,
                balance: `${formatCurrency(Number(inputBalance))}`,
                onMax,
              }}
              to={{
                address: indexDTF.stToken.id,
                symbol: indexDTF.stToken.token.symbol,
                price: `$${formatCurrency(inputPrice)}`,
                value: shares
                  ? formatUnits(shares, indexDTF.stToken.token.decimals)
                  : '...',
              }}
            />
          </TabsContent>
          <TabsContent value="unlock" className="overflow-auto p-2 mt-0">
            unlock
          </TabsContent>
        </Tabs>
        <DrawerFooter>
          <SubmitStakeButton />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default Staking
