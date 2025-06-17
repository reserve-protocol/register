import ChainLogo from '@/components/icons/ChainLogo'
import { FormField } from '@/components/ui/form'
import { cn } from '@/lib/utils'
import { useAtom } from 'jotai'
import { CheckIcon } from 'lucide-react'
import { ControllerFieldState, useFormContext } from 'react-hook-form'
import { chainIdAtom } from 'state/atoms'
import { AvailableChain, ChainId } from 'utils/chains'
import { CHAIN_TAGS } from 'utils/constants'
import { useSwitchChain } from 'wagmi'

const SUPPORTED_CHAINS = [ChainId.Mainnet, ChainId.Base, ChainId.BSC]

const ChainOption = ({
  chainId,
  checked,
  onClick,
  state,
}: {
  chainId: number
  checked?: boolean
  onClick?: (newChain: AvailableChain) => void
  state?: ControllerFieldState
}) => {
  return (
    <div
      className={cn(
        'flex flex-1 items-center gap-4 justify-between border rounded-xl p-4 text-base cursor-pointer',
        checked
          ? 'bg-card border-primary text-primary'
          : 'bg-muted border-muted',
        state?.invalid ? 'border-destructive' : ''
      )}
      role="button"
      onClick={() => onClick && onClick(chainId as AvailableChain)}
    >
      <div className="flex items-center gap-2 font-bold">
        <ChainLogo chain={chainId} width={20} height={20} />
        {CHAIN_TAGS[chainId]}
      </div>
      <div className="flex justify-end w-6 text-primary">
        {checked && <CheckIcon size={20} strokeWidth={1.6} />}
      </div>
    </div>
  )
}

const ChainSelector = () => {
  const form = useFormContext()
  const [chainId, setChain] = useAtom(chainIdAtom)
  const { watch, setValue, resetField } = useFormContext()
  const { switchChain } = useSwitchChain()
  const formChainId = watch('chain')

  const handleChainChange = (newChain: AvailableChain) => {
    resetField('chain')
    setValue('chain', newChain)
    if (chainId !== newChain) {
      setChain(newChain)
      switchChain && switchChain({ chainId: newChain })
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-2 p-2 flex-wrap">
      {SUPPORTED_CHAINS.map((chain) => (
        <FormField
          name="chain"
          control={form.control}
          render={({ fieldState }) => (
            <ChainOption
              key={chain}
              chainId={chain}
              checked={chain === formChainId}
              onClick={handleChainChange}
              state={fieldState}
            />
          )}
        />
      ))}
    </div>
  )
}

export default ChainSelector
