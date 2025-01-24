import { INDEX_GRAPH_CLIENTS } from '@/state/atoms'
import { wagmiConfig } from '@/state/chain'
import { ChainId } from '@/utils/chains'
import { DeployInputs } from '@/views/index-dtf/deploy/form-fields'
import { gql } from 'graphql-request'
import { Address, erc20Abi, parseEther } from 'viem'
import { readContract } from 'wagmi/actions'
import { FeeRecipient } from '../steps/confirm-deploy/manual/components/confirm-manual-deploy-button'

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

const calculateShare = (sharePercentage: number, denominator: number) => {
  const share = sharePercentage / 100

  if (denominator > 0) {
    const shareNumerator = share / denominator
    return parseEther(shareNumerator.toString())
  }

  return parseEther(share.toString())
}

export const calculateRevenueDistribution = (
  formData: DeployInputs,
  wallet: Address,
  stToken?: Address
) => {
  const totalSharesDenominator = (100 - formData.fixedPlatformFee) / 100

  let revenueDistribution: FeeRecipient[] = (
    formData.additionalRevenueRecipients || []
  ).map((recipient) => ({
    recipient: recipient.address,
    portion: calculateShare(recipient.share, totalSharesDenominator),
  }))

  // Add deployer share if not the last one
  if (formData.deployerShare > 0) {
    revenueDistribution.push({
      recipient: wallet,
      portion: calculateShare(formData.deployerShare, totalSharesDenominator),
    })
  }

  // Add governance share if not the last one
  if (formData.governanceShare > 0 && stToken) {
    revenueDistribution.push({
      recipient: stToken,
      portion: calculateShare(formData.governanceShare, totalSharesDenominator),
    })
  }

  // Calculate sum of all portions so far
  if (revenueDistribution.length > 1) {
    const currentSum = revenueDistribution
      .slice(0, -1)
      .reduce((sum, item) => sum + item.portion, 0n)

    revenueDistribution[revenueDistribution.length - 1].portion =
      parseEther('1') - currentSum
  }

  revenueDistribution.sort((a, b) => (a.recipient < b.recipient ? -1 : 1))

  return revenueDistribution
}
