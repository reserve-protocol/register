import { GRAPH_CLIENTS, INDEX_GRAPH_CLIENTS } from '@/state/atoms'
import { wagmiConfig } from '@/state/chain'
import { DeployInputs } from '@/views/index-dtf/deploy/form-fields'
import { gql } from 'graphql-request'
import { Address, erc20Abi, isAddress, parseAbi } from 'viem'
import { readContract } from 'wagmi/actions'
import { AvailableChain } from '@/utils/chains'

export const isERC20 = async (address: Address, chainId: number) => {
  try {
    await readContract(wagmiConfig, {
      abi: erc20Abi,
      functionName: 'symbol',
      address,
      chainId: chainId as AvailableChain,
    })
  } catch (e) {
    return false
  }
  return true
}

export const isAddressNotStrict = (address: string): address is Address => {
  return isAddress(address, { strict: false })
}

const stTokenQuery = gql`
  query getStakingToken($id: String!) {
    stakingToken(id: $id) {
      id
    }
  }
`

export const getStToken = async (address: Address, chainId: number) => {
  try {
    const data = await INDEX_GRAPH_CLIENTS[chainId].request(stTokenQuery, {
      id: address.toLowerCase(),
    })
    return data.stakingToken
  } catch (e) {
    return null
  }
}

export const isVoteLockAddress = async (address: Address, chainId: number) => {
  return Boolean(await getStToken(address, chainId))
}

const optimisticVaultAbi = parseAbi([
  'function getOptimisticVotes(address) view returns (uint256)',
  'function CLOCK_MODE() view returns (string)',
])

// Folio 6.0 governance needs an optimistic vote-lock vault on a timestamp clock; legacy vote-locks revert the deploy.
export const isOptimisticVault = async (address: Address, chainId: number) => {
  try {
    const [, clock] = await Promise.all([
      readContract(wagmiConfig, {
        abi: optimisticVaultAbi,
        functionName: 'getOptimisticVotes',
        args: [address],
        address,
        chainId: chainId as AvailableChain,
      }),
      readContract(wagmiConfig, {
        abi: optimisticVaultAbi,
        functionName: 'CLOCK_MODE',
        address,
        chainId: chainId as AvailableChain,
      }),
    ])
    return clock === 'mode=timestamp'
  } catch {
    return false
  }
}

export const isNotVoteLockAddress = async (
  address: Address,
  chainId: number
) => {
  return !(await isVoteLockAddress(address, chainId))
}

const stRSRQuery = gql`
  query getStRSR($id: String!) {
    rewardTokens(where: { token: $id }) {
      id
    }
  }
`
export const getStRSR = async (address: Address, chainId: number) => {
  try {
    const data = await GRAPH_CLIENTS[chainId].request(stRSRQuery, {
      id: address.toLowerCase(),
    })
    return data.rewardTokens.length > 0
  } catch (e) {
    return null
  }
}

export const isNotStRSR = async (address: Address, chainId: number) => {
  return !Boolean(await getStRSR(address, chainId))
}

export const noSpecialCharacters = (value: string) => {
  const alphanumericWithSpaces = /^[a-zA-Z0-9 .\-/&]*$/
  const containsEmoji =
    /[\p{Extended_Pictographic}\u{1F3FB}-\u{1F3FF}\u{1F9B0}-\u{1F9B3}]/u

  if (containsEmoji.test(value)) return false
  return alphanumericWithSpaces.test(value)
}

export const scrollToSection = (sectionId: string) => {
  // Wait for accordion animation to complete (200ms) plus a small buffer
  setTimeout(() => {
    const element = document.getElementById(`deploy-section-${sectionId}`)
    if (element) {
      const wrapper = document.getElementById('app-container')
      if (wrapper) {
        const count = element.offsetTop - wrapper.scrollTop - 72 // Fixed 72px offset as requested
        wrapper.scrollBy({ top: count, left: 0, behavior: 'smooth' })
      }
    }
  }, 250) // 200ms animation duration + 50ms buffer for safety
}
