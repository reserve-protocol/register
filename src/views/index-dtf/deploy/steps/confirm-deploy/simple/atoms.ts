import {
  balancesAtom,
  chainIdAtom,
  TokenBalance,
  walletAtom,
} from '@/state/atoms'
import { Token } from '@/types'
import {
  ZapDeployBody,
  ZapDeployUngovernedBody,
} from '@/views/yield-dtf/issuance/components/zapV2/api/types'
import { zappableTokens } from '@/views/yield-dtf/issuance/components/zapV2/constants'
import { atom } from 'jotai'
import { Address, parseEther, parseUnits, zeroAddress } from 'viem'
import { basketAtom, daoTokenAddressAtom } from '../../../atoms'
import { calculateRevenueDistribution } from '../../../utils'
import { indexDeployFormDataAtom } from '../atoms'
import { basketRequiredAmountsAtom, initialTokensAtom } from '../manual/atoms'
import { atomWithReset } from 'jotai/utils'

export const inputTokenAtom = atom<Token | undefined>(undefined)
export const inputAmountAtom = atomWithReset<string>('')
export const slippageAtom = atomWithReset<string>('100')

export const defaultInputTokenAtom = atom<Token>((get) => {
  const chainId = get(chainIdAtom)
  return zappableTokens[chainId][1]
})

export const inputBalanceAtom = atom<TokenBalance | undefined>((get) => {
  const balances = get(balancesAtom)
  const token = get(inputTokenAtom) || get(defaultInputTokenAtom)
  return balances[token.address]
})

export const tokensAtom = atom<(Token & { balance?: string })[]>((get) => {
  const chainId = get(chainIdAtom)
  const balances = get(balancesAtom)
  return zappableTokens[chainId].map((token) => ({
    ...token,
    balance: balances[token.address]?.balance,
  }))
})

export const zapDeployPayloadAtom = atom<
  ZapDeployBody | ZapDeployUngovernedBody | undefined
>((get) => {
  const tokenIn = get(inputTokenAtom) || get(defaultInputTokenAtom)
  const amountIn = get(inputAmountAtom)
  const formData = get(indexDeployFormDataAtom)
  const initialTokens = get(initialTokensAtom)
  const tokenAmounts = get(basketRequiredAmountsAtom)
  const stToken = get(daoTokenAddressAtom)
  const basket = get(basketAtom)
  const wallet = get(walletAtom)
  const slippage = get(slippageAtom)

  if (!formData || !initialTokens || !wallet || !Number(amountIn))
    return undefined

  const commonZapParams = {
    tokenIn: tokenIn.address,
    amountIn: parseUnits(amountIn, tokenIn.decimals).toString(),
    signer: wallet,
    slippage: slippage ? Number(slippage) : undefined,
  }

  const basicDetails = {
    name: formData.name,
    symbol: formData.symbol,
    assets: basket.map((token) => token.address),
    amounts: basket.map((token) =>
      parseUnits(
        tokenAmounts[token.address]?.toString() || '0',
        token.decimals
      ).toString()
    ),
  }

  const additionalDetails = {
    tradeDelay: BigInt(
      Math.floor(
        (formData.auctionDelay || formData.customAuctionDelay || 0)! * 60
      )
    ).toString(),
    auctionLength: BigInt(
      Math.floor(
        (formData.auctionLength || formData.customAuctionLength || 0)! * 60
      )
    ).toString(),
    feeRecipients: calculateRevenueDistribution(formData, wallet, stToken).map(
      ({ recipient, portion }) => ({ recipient, portion: portion.toString() })
    ),
    tvlFee: parseEther(
      ((formData.folioFee || formData.customFolioFee || 0)! / 100).toString()
    ).toString(),
    mintFee: parseEther(
      ((formData.mintFee || formData.customMintFee || 0)! / 100).toString()
    ).toString(),
    mandate: formData.mandate || '',
  }

  const existingAuctionApprovers = [] as Address[]
  const auctionLaunchers = [
    ...(formData.auctionLauncher ? [formData.auctionLauncher!] : []),
    ...(formData.additionalAuctionLaunchers ?? []),
  ]
  const brandManagers = [
    ...(formData.brandManagerAddress ? [formData.brandManagerAddress!] : []),
  ]

  // Ungoverned DTF
  if (!stToken) {
    const owner = formData.governanceWalletAddress
    if (!owner) return undefined

    return {
      ...commonZapParams,
      owner,
      basicDetails,
      additionalDetails,
      existingAuctionApprovers,
      auctionLaunchers,
      brandManagers,
    }
  }

  // Governed DTF
  const ownerGovParams = {
    votingDelay: (
      (formData.governanceVotingDelay ||
        formData.customGovernanceVotingDelay ||
        0)! * 60
    ).toString(),
    votingPeriod: (
      (formData.governanceVotingPeriod ||
        formData.customGovernanceVotingPeriod ||
        0)! * 60
    ).toString(),
    proposalThreshold: parseEther(
      (formData.governanceVotingThreshold ||
        formData.customGovernanceVotingThreshold ||
        0)!.toString()
    ).toString(),
    quorumPercent: BigInt(
      Math.floor(
        (formData.governanceVotingQuorum ||
          formData.customGovernanceVotingQuorum ||
          0)!
      )
    ).toString(),
    timelockDelay: BigInt(
      Math.floor(
        (formData.governanceExecutionDelay ||
          formData.customGovernanceExecutionDelay ||
          0)! * 60
      )
    ).toString(),
    guardian: formData.guardianAddress ?? zeroAddress,
  }

  const tradingGovParams = {
    votingDelay: (
      (formData.basketVotingDelay || formData.customBasketVotingDelay || 0)! *
      60
    ).toString(),
    votingPeriod: (
      (formData.basketVotingPeriod || formData.customBasketVotingPeriod || 0)! *
      60
    ).toString(),
    proposalThreshold: parseEther(
      (formData.basketVotingThreshold ||
        formData.customBasketVotingThreshold ||
        0)!.toString()
    ).toString(),
    quorumPercent: BigInt(
      Math.floor(
        (formData.basketVotingQuorum || formData.customBasketVotingQuorum || 0)!
      )
    ).toString(),
    timelockDelay: BigInt(
      Math.floor(
        (formData.basketExecutionDelay ||
          formData.customBasketExecutionDelay ||
          0)! * 60
      )
    ).toString(),
    guardian: formData.guardianAddress ?? zeroAddress,
  }

  return {
    ...commonZapParams,
    stToken,
    basicDetails,
    additionalDetails,
    ownerGovParams,
    tradingGovParams,
    existingAuctionApprovers,
    auctionLaunchers,
    brandManagers,
  }
})
