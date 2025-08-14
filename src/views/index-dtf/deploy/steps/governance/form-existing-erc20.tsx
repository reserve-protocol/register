import { Separator } from '@/components/ui/separator'
import { chainIdAtom } from '@/state/atoms'
import { useAtomValue } from 'jotai'
import { ArrowUpRightIcon } from 'lucide-react'
import { useFormContext } from 'react-hook-form'
import { erc20Abi, isAddress } from 'viem'
import { useReadContract } from 'wagmi'
import BasicInput from '../../components/basic-input'
import { ChainId } from '@/utils/chains'

const createMyTokenUrls = {
  [ChainId.Mainnet]:
    'https://www.createmytoken.com/token-generator/create-token-on-ethereum/',
  [ChainId.Base]:
    'https://www.createmytoken.com/token-generator/create-token-on-base/',
  [ChainId.Arbitrum]:
    'https://www.createmytoken.com/token-generator/create-token-on-arbitrum/',
  [ChainId.BSC]:
    'https://www.createmytoken.com/token-generator/create-token-on-bnb-smart-chain/',
} as const

const LaunchTokenBanner = () => {
  const { watch } = useFormContext()
  const chainId = useAtomValue(chainIdAtom)
  const formChainId = watch('chain')

  return (
    <div
      className="flex items-center gap-2 justify-between"
      role="button"
      onClick={() => window.open(createMyTokenUrls[formChainId ?? chainId])}
    >
      <div className="flex items-center gap-2">
        <img
          alt="hero-splash"
          src="https://storage.reserve.org/create-my-token.png"
          className="h-5"
        />
        <div>
          <div className="font-bold">
            Want to launch a new ERC20 for governance?
          </div>
          <div className="text-muted-foreground">
            We recommend launching your new ERC20 token on{' '}
            <span className="text-primary">CreateMyToken</span>
          </div>
        </div>
      </div>
      <div className="bg-muted-foreground/10 rounded-full p-1" role="button">
        <ArrowUpRightIcon size={24} strokeWidth={1.5} />
      </div>
    </div>
  )
}

const GovernanceExistingERC20 = () => {
  const chainId = useAtomValue(chainIdAtom)
  const { watch } = useFormContext()
  const governanceERC20address = watch('governanceERC20address')

  const { data: symbol } = useReadContract({
    abi: erc20Abi,
    functionName: 'symbol',
    address: governanceERC20address,
    query: { enabled: isAddress(governanceERC20address) },
    chainId,
  })

  return (
    <div className="px-4">
      <BasicInput
        fieldName="governanceERC20address"
        label={symbol || 'ERC20 address'}
        placeholder="0x..."
        highlightLabel={!!symbol}
      />
      <Separator className="my-4" />
      <LaunchTokenBanner />
    </div>
  )
}

export default GovernanceExistingERC20
