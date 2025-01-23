import { INDEX_GRAPH_CLIENTS } from '@/state/atoms'
import { wagmiConfig } from '@/state/chain'
import { ChainId } from '@/utils/chains'
import { gql } from 'graphql-request'
import { Address, erc20Abi } from 'viem'
import { readContract } from 'wagmi/actions'

export const isERC20 = async (address: Address) => {
  try {
    await readContract(wagmiConfig, {
      abi: erc20Abi,
      functionName: 'symbol',
      address,
    })
  } catch (e) {
    return false
  }
  return true
}

const stTokenQuery = gql`
  query getStakingToken($id: String!) {
    stakingToken(id: $id) {
      id
    }
  }
`

export const getStToken = async (address: Address) => {
  try {
    const data = await INDEX_GRAPH_CLIENTS[ChainId.Base].request(stTokenQuery, {
      id: address.toLowerCase(),
    })
    return data.stakingToken
  } catch (e) {
    return null
  }
}

export const isVoteLockAddress = async (address: Address) => {
  return Boolean(await getStToken(address))
}
