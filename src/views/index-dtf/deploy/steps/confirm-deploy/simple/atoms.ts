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
import { Address, parseEther, parseUnits } from 'viem'
import { basketAtom, daoTokenAddressAtom } from '../../../atoms'
import { calculateRevenueDistribution } from '../../../utils'
import { indexDeployFormDataAtom } from '../atoms'
import { basketRequiredAmountsAtom, initialTokensAtom } from '../manual/atoms'

export const inputTokenAtom = atom<Token | undefined>(undefined)
export const inputAmountAtom = atom<string>('')

export const defaultInputTokenAtom = atom<Token>((get) => {
  const chainId = get(chainIdAtom)
  return zappableTokens[chainId][1]
})

export const inputBalanceAtom = atom<TokenBalance | undefined>((get) => {
  const balances = get(balancesAtom)
  const token = get(inputTokenAtom) || get(defaultInputTokenAtom)
  return balances[token.address]
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

  if (!formData || !initialTokens || !wallet || !Number(amountIn))
    return undefined

  const commonZapParams = {
    tokenIn: tokenIn.address,
    amountIn: parseUnits(amountIn, tokenIn.decimals).toString(),
    signer: wallet,
    slippage: undefined, // TODO: add
  }

  const basicDetails = {
    name: formData.name,
    symbol: formData.symbol,
    assets: basket.map((token) => token.address),
    amounts: basket.map((token) =>
      parseUnits(
        tokenAmounts[token.address].toString(),
        token.decimals
      ).toString()
    ),
  }

  const additionalDetails = {
    tradeDelay: BigInt(
      (formData.auctionDelay || formData.customAuctionDelay || 0)! * 60
    ).toString(),
    auctionLength: BigInt(
      (formData.auctionLength || formData.customAuctionLength || 0)! * 60
    ).toString(),
    feeRecipients: calculateRevenueDistribution(formData, wallet, stToken).map(
      ({ recipient, portion }) => ({ recipient, portion: portion.toString() })
    ),
    folioFee: BigInt(
      439591053.36 * (formData.folioFee || formData.customFolioFee || 0)!
    ).toString(),
    mintingFee: parseEther(
      ((formData.mintFee || formData.customMintFee || 0)! / 100).toString()
    ).toString(),
  }

  const existingTradeProposers = [] as Address[]
  const tradeLaunchers = [
    formData.auctionLauncher!,
    ...(formData.additionalAuctionLaunchers ?? []),
  ]
  const vibesOfficers = [formData.brandManagerAddress!]

  // Ungoverned DTF
  if (!stToken) {
    const owner = formData.governanceWalletAddress
    if (!owner) return undefined

    return {
      ...commonZapParams,
      owner,
      basicDetails,
      additionalDetails,
      existingTradeProposers,
      tradeLaunchers,
      vibesOfficers,
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
      (formData.governanceVotingQuorum ||
        formData.customGovernanceVotingQuorum ||
        0)!
    ).toString(),
    timelockDelay: BigInt(
      (formData.governanceExecutionDelay ||
        formData.customGovernanceExecutionDelay ||
        0)! * 60
    ).toString(),
    guardian: formData.guardianAddress!,
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
      (formData.basketVotingQuorum || formData.customBasketVotingQuorum || 0)!
    ).toString(),
    timelockDelay: BigInt(
      (formData.basketExecutionDelay ||
        formData.customBasketExecutionDelay ||
        0)! * 60
    ).toString(),
    guardian: formData.guardianAddress!,
  }

  return {
    ...commonZapParams,
    stToken,
    basicDetails,
    additionalDetails,
    ownerGovParams,
    tradingGovParams,
    existingTradeProposers,
    tradeLaunchers,
    vibesOfficers,
  }
})
