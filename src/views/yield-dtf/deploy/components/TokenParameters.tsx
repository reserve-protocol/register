import { Trans } from '@lingui/macro'
import ChainLogo from 'components/icons/ChainLogo'
import { backupCollateralAtom, basketAtom } from 'components/rtoken-setup/atoms'
import { useAtom, useAtomValue } from 'jotai'
import { useResetAtom } from 'jotai/utils'
import { useFormContext } from 'react-hook-form'
import { chainIdAtom, walletChainAtom } from 'state/atoms'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { AvailableChain, ChainId } from 'utils/chains'
import { CHAIN_TAGS, supportedChainList } from 'utils/constants'
import TokenForm from './TokenForm'
import { useEffect } from 'react'
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
  onChange,
}: {
  chainId: number
  checked?: boolean
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}) => {
  return (
    <label className="flex items-center justify-between flex-grow gap-1 bg-background border border-border rounded-lg p-3 cursor-pointer">
      <div className="flex items-center gap-2">
        <ChainLogo chain={chainId} width={20} height={20} />
        <Trans>{CHAIN_TAGS[chainId]}</Trans>
      </div>
      <input
        type="radio"
        name="chain-selector"
        value={chainId}
        onChange={onChange}
        checked={checked}
        className="w-4 h-4"
      />
    </label>
  )
}

const ChainSelector = () => {
  const [chainId, setChain] = useAtom(chainIdAtom)
  const walletChainId = useAtomValue(walletChainAtom)
  const resetBasket = useResetAtom(basketAtom)
  const resetBackup = useResetAtom(backupCollateralAtom)
  const { setValue } = useFormContext()
  const { switchChain } = useSwitchChain()

  const filteredSupportedChainList = supportedChainList.filter(
    (chain) => chain !== ChainId.Arbitrum
  )

  useEffect(() => {
    if (walletChainId && filteredSupportedChainList.includes(walletChainId)) {
      setChain(walletChainId as AvailableChain)
    }
  }, [])

  const handleChainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newChain = +e.target.value

    if (chainId !== newChain) {
      resetBasket()
      resetBackup()

      const defaults =
        newChain === ChainId.Mainnet ? mainnetDefaults : l2Defaults

      for (const [key, value] of defaults) {
        setValue(key, value)
      }

      setChain(newChain as AvailableChain)
      switchChain && switchChain({ chainId: newChain })
    }
  }

  return (
    <div className="mb-3">
      <span className="text-xs ml-3 mb-2 block text-muted-foreground">
        Chain
      </span>
      <div className="flex flex-col xl:flex-row gap-2 max-[1430px]:flex-col">
        {filteredSupportedChainList.map((chain) => (
          <ChainOption
            key={chain}
            chainId={chain}
            checked={chain === chainId}
            onChange={handleChainChange}
          />
        ))}
      </div>
    </div>
  )
}

interface TokenParametersProps {
  className?: string
}

/**
 * View: Deploy -> Token setup
 * Display token forms
 */
const TokenParameters = ({ className }: TokenParametersProps) => (
  <Card className={`p-4 bg-secondary ${className || ''}`}>
    <span className="text-xl font-medium">
      <Trans>Basics</Trans>
    </span>
    <Separator className="my-4 -mx-4 border-muted" />
    <ChainSelector />
    <TokenForm />
  </Card>
)

export default TokenParameters
