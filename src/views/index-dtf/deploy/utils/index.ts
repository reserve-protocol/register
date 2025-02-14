import { GRAPH_CLIENTS, INDEX_GRAPH_CLIENTS } from '@/state/atoms'
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
    const dataBase = await INDEX_GRAPH_CLIENTS[ChainId.Base].request(
      stTokenQuery,
      {
        id: address.toLowerCase(),
      }
    )
    const dataMainnet = await INDEX_GRAPH_CLIENTS[ChainId.Mainnet].request(
      stTokenQuery,
      {
        id: address.toLowerCase(),
      }
    )
    return dataBase.stakingToken || dataMainnet.stakingToken
  } catch (e) {
    return null
  }
}

export const isVoteLockAddress = async (address: Address) => {
  return Boolean(await getStToken(address))
}

export const isNotVoteLockAddress = async (address: Address) => {
  return !(await isVoteLockAddress(address))
}

const stRSRQuery = gql`
  query getStRSR($id: String!) {
    rewardTokens(where: { token: $id }) {
      id
    }
  }
`
export const getStRSR = async (address: Address) => {
  try {
    const data = await GRAPH_CLIENTS[ChainId.Base].request(stRSRQuery, {
      id: address.toLowerCase(),
    })
    return data.rewardTokens.length > 0
  } catch (e) {
    return null
  }
}

export const isNotStRSR = async (address: Address) => {
  return !Boolean(await getStRSR(address))
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

export const noSpecialCharacters = (value: string) => {
  const alphanumericWithSpaces = /^[a-zA-Z0-9\s.]*$/
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
