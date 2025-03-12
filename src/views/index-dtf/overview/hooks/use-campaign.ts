import { ChainId } from '@/utils/chains'
import { useQuery } from '@tanstack/react-query'

const rewardTokens = {
  [ChainId.Mainnet]: {
    name: 'ETHPlus',
    symbol: 'ETH+',
    address: '0xE72B141DF173b999AE7c1aDcbF60Cc9833Ce56a8',
    url: 'https://app.reserve.org/ethereum/token/0xe72b141df173b999ae7c1adcbf60cc9833ce56a8/overview',
  },
  [ChainId.Base]: {
    name: 'Based ETH',
    symbol: 'bsdETH',
    address: '0xCb327b99fF831bF8223cCEd12B1338FF3aA322Ff',
    url: 'https://app.reserve.org/base/token/0xcb327b99ff831bf8223cced12b1338ff3aa322ff/overview',
  },
}

type Response = {
  chainId: number
  apr: number
  identifier: string
  status: string
  dailyRewards: number
}

const useCampaignRewards = () => {
  return useQuery({
    queryKey: ['campaign-rewards'],
    queryFn: async () => {
      const response = await fetch(
        'https://api.merkl.xyz/v4/opportunities/?tags=reserve'
      )
      const data = (await response.json()) as Response[]

      return data.reduce(
        (acc, curr) => {
          const rewardToken = rewardTokens[curr.chainId]
          acc[curr.identifier.toLowerCase()] = { ...curr, rewardToken }
          return acc
        },
        {} as Record<
          string,
          Response & {
            rewardToken?: (typeof rewardTokens)[keyof typeof rewardTokens]
          }
        >
      )
    },
  })
}

export const useDTFCampaign = (identifier: string) => {
  const { data: campaignRewards } = useCampaignRewards()
  const campaignData = campaignRewards?.[identifier.toLowerCase()]

  if (!campaignData || campaignData.status !== 'LIVE') return null

  return campaignData
}

export default useCampaignRewards
