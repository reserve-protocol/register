import ChainLogo from '@/components/icons/ChainLogo'
import { cn } from '@/lib/utils'
import { backupCollateralAtom, basketAtom } from 'components/rtoken-setup/atoms'
import { useAtom, useAtomValue } from 'jotai'
import { useResetAtom } from 'jotai/utils'
import { CheckIcon } from 'lucide-react'
import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { chainIdAtom, walletChainAtom } from 'state/atoms'
import { AvailableChain, ChainId } from 'utils/chains'
import { CHAIN_TAGS, supportedChainList } from 'utils/constants'
import { useSwitchChain } from 'wagmi'

type Defaults = [string, string][]

const mainnetDefaults: Defaults = [
  ['withdrawalLeak', '5'],
  ['dutchAuctionLength', '1800'],
  ['minTrade', '1000'],
]
const l2Defaults: Defaults = [
  ['withdrawalLeak', '1'],
  ['dutchAuctionLength', '900'],
  ['minTrade', '100'],
]

const ChainOption = ({
  chainId,
  checked,
  onClick,
}: {
  chainId: number
  checked?: boolean
  onClick?: (newChain: AvailableChain) => void
}) => {
  return (
    <div
      className={cn(
        'flex flex-1 items-center gap-4 justify-between border rounded-xl p-4 text-base cursor-pointer',
        checked ? 'bg-card border-border' : 'bg-muted border-muted'
      )}
      role="button"
      onClick={() => onClick && onClick(chainId as AvailableChain)}
    >
      <div className="flex items-center gap-2 font-bold">
        <ChainLogo chain={chainId} width={20} height={20} />
        {CHAIN_TAGS[chainId]}
      </div>
      <div className="flex justify-end w-6">
        {checked && <CheckIcon size={16} strokeWidth={1.2} />}
      </div>
    </div>
  )
}

const ChainSelector = () => {
  const [chainId, setChain] = useAtom(chainIdAtom)
  const walletChainId = useAtomValue(walletChainAtom)
  const resetBasket = useResetAtom(basketAtom)
  const resetBackup = useResetAtom(backupCollateralAtom)
  const { setValue } = useFormContext()
  const { switchChain } = useSwitchChain()

  useEffect(() => {
    if (walletChainId && supportedChainList.includes(walletChainId)) {
      setChain(walletChainId as AvailableChain)
    } else {
      setChain(chainId)
    }
  }, [chainId, setChain, walletChainId])

  const handleChainChange = (newChain: AvailableChain) => {
    if (chainId !== newChain) {
      resetBasket()
      resetBackup()

      const defaults =
        newChain === ChainId.Mainnet ? mainnetDefaults : l2Defaults

      for (const [key, value] of defaults) {
        setValue(key, value)
      }
      switchChain && switchChain({ chainId: newChain })
    }
  }

  useEffect(() => {
    if (chainId !== ChainId.Base) {
      handleChainChange(ChainId.Base as AvailableChain)
    }
  }, [])

  return (
    <div className="flex flex-col lg:flex-row gap-2 p-2">
      {[ChainId.Mainnet, ChainId.Base].map((chain) => (
        <ChainOption
          key={chain}
          chainId={chain}
          checked={chain === chainId}
          onClick={handleChainChange}
        />
      ))}
    </div>
  )
}

export default ChainSelector
