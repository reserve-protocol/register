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
import { reducedZappableTokens } from '@/views/yield-dtf/issuance/components/zapV2/constants'
import { atom } from 'jotai'
import { atomWithReset } from 'jotai/utils'
import { Address, parseUnits } from 'viem'
import { basketAtom, daoTokenAddressAtom } from '../../../atoms'
import {
  buildV6DeployParams,
  resolveGovernanceRecipient,
  type V6DeployParams,
} from '../../../utils/v6-deploy-params'
import { governanceRecipientAtom, indexDeployFormDataAtom } from '../atoms'
import { basketRequiredAmountsAtom } from '../manual/atoms'
import { PriceControl } from '@reserve-protocol/dtf-rebalance-lib'

export const inputTokenAtom = atom<Token | undefined>(undefined)
export const inputAmountAtom = atomWithReset<string>('')
export const slippageAtom = atomWithReset<string>('100')

export const defaultInputTokenAtom = atom<Token>((get) => {
  const chainId = get(chainIdAtom)
  return reducedZappableTokens[chainId][0]
})

export const inputBalanceAtom = atom<TokenBalance | undefined>((get) => {
  const balances = get(balancesAtom)
  const token = get(inputTokenAtom) || get(defaultInputTokenAtom)
  return balances[token.address]
})

export const tokensAtom = atom<(Token & { balance?: string })[]>((get) => {
  const chainId = get(chainIdAtom)
  const balances = get(balancesAtom)
  return reducedZappableTokens[chainId].map((token) => ({
    ...token,
    balance: balances[token.address]?.balance,
  }))
})

export const ongoingTxAtom = atom<boolean>(false)

const str = (value: bigint | number) => value.toString()
const feeTable = (table: readonly { recipient: Address; portion: bigint }[]) =>
  table.map(({ recipient, portion }) => ({ recipient, portion: str(portion) }))

export const zapDeployBuildErrorAtom = atom<string | undefined>((get) => {
  const formData = get(indexDeployFormDataAtom)
  const wallet = get(walletAtom)
  const governance = resolveGovernanceRecipient(
    get(daoTokenAddressAtom),
    get(governanceRecipientAtom)
  )
  if (governance.error) return governance.error
  if (!formData || !wallet || !governance.ready) return undefined
  try {
    buildV6DeployParams(formData, {
      deployer: wallet,
      governanceRecipient: governance.recipient,
    })
  } catch (error) {
    return error instanceof Error ? error.message : String(error)
  }
})

export const zapDeployPayloadAtom = atom<
  ZapDeployBody | ZapDeployUngovernedBody | undefined
>((get) => {
  const tokenIn = get(inputTokenAtom) || get(defaultInputTokenAtom)
  const amountIn = get(inputAmountAtom)
  const formData = get(indexDeployFormDataAtom)
  const tokenAmounts = get(basketRequiredAmountsAtom)
  const stToken = get(daoTokenAddressAtom)
  const basket = get(basketAtom)
  const wallet = get(walletAtom)
  const slippage = get(slippageAtom)
  const governance = resolveGovernanceRecipient(
    stToken,
    get(governanceRecipientAtom)
  )

  if (!formData || !wallet || !Number(amountIn) || !governance.ready) {
    return undefined
  }

  let params: V6DeployParams
  try {
    params = buildV6DeployParams(formData, {
      deployer: wallet,
      governanceRecipient: governance.recipient,
    })
  } catch (error) {
    console.error('[deploy] could not build the zap deploy body', error)
    return undefined
  }

  const { additionalDetails: details, governance: gov, roles, flags } = params

  const common = {
    tokenIn: tokenIn.address,
    amountIn: parseUnits(amountIn, tokenIn.decimals).toString(),
    signer: wallet,
    slippage: slippage && Number(slippage) ? 1 / Number(slippage) : undefined,
    basicDetails: {
      name: formData.tokenName,
      symbol: formData.symbol,
      assets: basket.map((token) => token.address),
      amounts: basket.map((token) =>
        parseUnits(
          tokenAmounts[token.address].toFixed(token.decimals),
          token.decimals
        ).toString()
      ),
    },
    additionalDetails: {
      maxAuctionLength: str(details.maxAuctionLength),
      feeRecipients: feeTable(details.feeRecipients),
      immutableFeeRecipients: feeTable(details.immutableFeeRecipients ?? []),
      tvlFee: str(details.tvlFee),
      mintFee: str(details.mintFee),
      folioFeeForSelf: str(details.selfFee ?? 0n),
      mandate: details.mandate,
    },
    folioFlags: {
      trustedFillerEnabled: flags.trustedFillerEnabled,
      rebalanceControl: {
        weightControl: flags.rebalanceControl.weightControl,
        priceControl: flags.rebalanceControl.priceControl as PriceControl,
      },
      bidsEnabled: flags.bidsEnabled,
    },
    basketManagers: [] as Address[],
    auctionLaunchers: [...(roles.auctionLaunchers ?? [])],
    brandManagers: [...(roles.brandManagers ?? [])],
  }

  if (!stToken) {
    const owner = formData.governanceWalletAddress
    if (!owner) return undefined
    return { ...common, owner }
  }

  return {
    ...common,
    stToken,
    govParams: {
      optimisticParams: {
        vetoDelay: str(gov.optimistic.vetoDelay),
        vetoPeriod: str(gov.optimistic.vetoPeriod),
        vetoThreshold: str(gov.optimistic.vetoThreshold),
      },
      standardParams: {
        votingDelay: str(gov.standard.votingDelay),
        votingPeriod: str(gov.standard.votingPeriod),
        voteExtension: str(gov.standard.voteExtension),
        proposalThreshold: str(gov.standard.proposalThreshold),
        quorumNumerator: str(gov.standard.quorumNumerator),
      },
      optimisticSelectors: [...gov.optimisticSelectors],
      optimisticProposers: [...gov.optimisticProposers],
      additionalGuardians: [...gov.additionalGuardians],
      timelockDelay: str(gov.timelockDelay),
      proposalThrottleCapacity: str(gov.proposalThrottleCapacity),
    },
  }
})
