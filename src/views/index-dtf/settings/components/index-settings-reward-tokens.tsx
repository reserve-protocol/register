import TokenLogo from '@/components/token-logo'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { useAtomValue } from 'jotai'
import { InfoCard, InfoCardItem } from './settings-info-card'
import { useReadContract, useReadContracts } from 'wagmi'
import dtfStakingVaultAbi from '@/abis/dtf-index-staking-vault'
import { Address, erc20Abi } from 'viem'
import { Filter } from 'bad-words'

const ApprovedRevenueTokens = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const stToken = indexDTF && indexDTF.stToken

  const { data: rewards } = useReadContract({
    abi: dtfStakingVaultAbi,
    address: stToken?.id,
    functionName: 'getAllRewardTokens',
    chainId: indexDTF?.chainId,
    query: {
      enabled: Boolean(indexDTF?.stToken),
    },
  })

  const { data: tokens } = useReadContracts({
    contracts: (rewards ?? []).flatMap(
      (reward) =>
        [
          {
            address: reward,
            abi: erc20Abi,
            functionName: 'symbol',
            chainId: indexDTF?.chainId,
          },
        ] as const
    ),
    allowFailure: false,
    query: {
      enabled: (rewards ?? []).length > 0,
      select: (data) => {
        return (rewards ?? []).map((address, i) => {
          const symbol = data[i]

          const filter = new Filter()
          filter.removeWords('god')

          const token = {
            address: address.toLowerCase() as Address,
            symbol,
          } as const

          return token
        })
      },
    },
  })

  if (!tokens || tokens.length === 0) {
    return null
  }

  return (
    <InfoCard title="Approved Revenue Tokens">
      {tokens.map((token, i) => (
        <InfoCardItem
          key={token.address}
          label={`Reward #${i + 1}`}
          icon={
            <TokenLogo
              chain={indexDTF?.chainId}
              symbol={token.symbol}
              address={token.address}
              size="xl"
            />
          }
          value={token.symbol}
          address={token.address}
        />
      ))}
    </InfoCard>
  )
}

export default ApprovedRevenueTokens
