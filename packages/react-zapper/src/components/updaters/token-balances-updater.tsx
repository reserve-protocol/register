import { useEffect } from 'react'
import { useSetAtom } from 'jotai'
import { useAccount, useBalance, useReadContracts } from 'wagmi'
import { Address, erc20Abi } from 'viem'
import { balancesAtom } from '../../state/atoms'
import { reducedZappableTokens } from '../../utils/constants'
import { Token, TokenBalance } from '../../types'

interface TokenBalancesUpdaterProps {
  chainId: number
}

export const TokenBalancesUpdater: React.FC<TokenBalancesUpdaterProps> = ({
  chainId,
}) => {
  const { address } = useAccount()
  const setBalances = useSetAtom(balancesAtom)

  // Get tokens for the current chain
  const chainTokens = reducedZappableTokens[chainId as keyof typeof reducedZappableTokens] || []

  // Get ETH balance
  const { data: ethBalance } = useBalance({
    address,
    chainId,
  })

  // Get ERC20 token balances
  const { data: tokenBalances } = useReadContracts({
    contracts: chainTokens
      .filter(token => token.address !== '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE')
      .map(token => ({
        address: token.address as Address,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [address!],
        chainId,
      })),
    query: {
      enabled: !!address,
      refetchInterval: 30000, // Refetch every 30 seconds
    },
  })

  useEffect(() => {
    if (!address) {
      setBalances({})
      return
    }

    const newBalances: Record<string, TokenBalance> = {}

    // Add ETH balance
    const ethToken = chainTokens.find(
      token => token.address === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
    )
    if (ethToken && ethBalance) {
      newBalances[ethToken.address.toLowerCase()] = {
        token: {
          address: ethToken.address as Address,
          symbol: ethToken.symbol,
          name: ethToken.name,
          decimals: ethToken.decimals,
          chainId,
        },
        balance: ethBalance.value.toString(),
      }
    }

    // Add ERC20 token balances
    if (tokenBalances) {
      chainTokens
        .filter(token => token.address !== '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE')
        .forEach((token, index) => {
          const balance = tokenBalances[index]
          if (balance.status === 'success' && balance.result) {
            newBalances[token.address.toLowerCase()] = {
              token: {
                address: token.address as Address,
                symbol: token.symbol,
                name: token.name,
                decimals: token.decimals,
                chainId,
              },
              balance: (balance.result as bigint).toString(),
            }
          }
        })
    }

    setBalances(newBalances)
  }, [address, ethBalance, tokenBalances, chainId, chainTokens, setBalances])

  return null
}

export default TokenBalancesUpdater