import TokenLogo from '@/components/token-logo'
import { chainIdAtom } from '@/state/atoms'
import { DecodedCalldata } from '@/types'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { useAtomValue } from 'jotai'
import { Address, erc20Abi } from 'viem'
import { useReadContracts } from 'wagmi'

const TokenRewardPreview = ({
  decodedCalldata,
}: {
  decodedCalldata: DecodedCalldata
}) => {
  const { signature, data } = decodedCalldata
  const tokenAddress = (data[0] as string) ?? ''
  const isRemoval = signature === 'removeRewardToken'
  const chainId = useAtomValue(chainIdAtom)
  const { data: token } = useReadContracts({
    contracts: [
      {
        abi: erc20Abi,
        address: tokenAddress as Address,
        functionName: 'name',
        args: [],
      },
      {
        abi: erc20Abi,
        address: tokenAddress as Address,
        functionName: 'symbol',
        args: [],
      },
    ],
    allowFailure: false,
    query: {
      enabled: !!tokenAddress,
      select: (data) => ({
        name: data[0],
        symbol: data[1],
        decimals: 18,
        address: tokenAddress,
      }),
    },
  })

  return (
    <div className="flex items-center gap-2">
      <TokenLogo size="lg" chain={chainId} address={tokenAddress} />
      <div className="flex flex-col mr-auto">
        <h4
          className={`text-xs ${isRemoval ? 'text-destructive' : 'text-success'}`}
        >
          {isRemoval ? 'Removed reward' : 'Added reward'}
        </h4>
        <a
          className="text-sm text-legend flex items-center gap-1"
          target="_blank"
          href={getExplorerLink(tokenAddress, chainId, ExplorerDataType.TOKEN)}
          tabIndex={0}
          aria-label={`View ${token?.symbol} on block explorer`}
        >
          {token?.name ?? 'Loading...'} (${token?.symbol ?? 'Loading...'})
        </a>
      </div>
    </div>
  )
}

export default TokenRewardPreview
