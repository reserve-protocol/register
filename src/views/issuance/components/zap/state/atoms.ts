import {
  Address,
  Searcher,
  Token,
  Universe,
} from '@reserve-protocol/token-zapper'
import {
  PERMIT2_ADDRESS,
  PermitTransferFrom,
  PermitTransferFromData,
  SignatureTransfer,
} from '@uniswap/permit2-sdk'
import { Getter, atom } from 'jotai'
import { loadable } from 'jotai/utils'
import {
  balancesAtom,
  chainIdAtom,
  isSmartWalletAtom,
  maxIssuanceAtom,
  rTokenAtom,
  rTokenStateAtom,
  walletAtom,
} from 'state/atoms'

import { defaultAbiCoder } from '@ethersproject/abi'
import { MaxUint256 } from '@ethersproject/constants'
import { id } from '@ethersproject/hash'
import atomWithDebounce from 'utils/atoms/atomWithDebounce'
import {
  atomWithOnWrite,
  onlyNonNullAtom,
  simplifyLoadable,
} from 'utils/atoms/utils'

import { EthereumConfigType } from '@reserve-protocol/token-zapper/types/configuration/ethereum'
import { type BaseSearcherResult } from '@reserve-protocol/token-zapper/types/searcher/SearcherResult'
import { type ZapTransaction } from '@reserve-protocol/token-zapper/types/searcher/ZapTransaction'
import { ChainId } from 'utils/chains'
import { resolvedZapState, zappableTokens, zapperState } from './zapper'
import { maxIssuableAtom } from 'views/issuance/atoms'

export const zapOutputSlippage = atom(100000n)

/**
 * I've tried to keep react effects to a minimum so most async code is triggered via some signal
 * either from a user interaction, or if a value changes.
 *
 * This file is functionality split in two sections:
 * 1. Atoms that are directly mutated by the user, the first small bit.
 * 2. All atoms that are derived as the zap flow progresses.
 *
 * The flow of data can more or less be read from top to bottom.
 *
 * The ui does not directly consume the derived state. Rather the atoms in the ui-atoms serves as the
 * view/controller.
 */

export const previousZapTransaction = atom<{
  result: BaseSearcherResult
  transaction: ZapTransaction
  permit2?: {
    permit: PermitTransferFrom
    signature: string
  }
} | null>(null)

export const previousRedeemZapTransaction = atom<{
  result: BaseSearcherResult
  transaction: ZapTransaction
  permit2?: {
    permit: PermitTransferFrom
    signature: string
  }
} | null>(null)
// The only actual state the user controls:
export const tokenToZapPopupState = atom(false)
export const collectDust = atom(true)

export const zapInputString = atomWithOnWrite(
  '' as string,
  (get, set, prev, newVal, backing) => {
    get(zapperState)
    set(permitSignature, null)
    set(previousZapTransaction, null)

    const max = get(maxZapInputSize)
    if (max == null || prev === newVal) {
      return
    }
    try {
      const currentValue = max.token.fromDecimal(newVal)
      if (currentValue.gt(max)) {
        set(backing as any, max.format())
      }
    } catch (e) {}
  }
)

export const zapRedeemInputString = atomWithOnWrite('', (get, set, __) => {
  get(zapperState)
  set(permitSignature, null)
  set(previousRedeemZapTransaction, null)
})
export const tokenToZapUserSelected = atomWithOnWrite(
  null as Token | null,
  (get, set, prev, next) => {
    if (prev !== next) {
      get(zapperState)
      set(zapRedeemInputString, '')
      set(zapInputString, '')
      set(tokenToZapPopupState, false)
      set(previousZapTransaction, null)
      set(previousRedeemZapTransaction, null)
    }
  }
)

// The hidden state of the UI. A lot of this could probably be refactored out via async atoms
export const permitSignature = atom(null as null | string)

// The amount of slippage we allow when zap involves a trade:
// This is not exposed in the UI yet, but probably should be.
const tradeSlippage = atom(0.0)

// We sent the zap transaction,
// and are waiting for the user to sign off on it and for it to commit
export const zapIsPending = atom(false)

// Tx hash for pending zap
export const zapTxHash = atom('')

// We sent the approval transaction,
// and are waiting for the user to sign off on it and for it to commit
export const approvalPending = atom(false)

// We're awaiting a permit signature from the user
export const signatureRequestPending = atom(false)

export const approvalRandomId = atom(0)

// All other atoms are derived from the above or from the environment
export const selectedZapTokenAtom = atom(
  (get) => get(tokenToZapUserSelected) ?? get(zappableTokens).at(0) ?? null
)

export const zapSender = atom((get) => {
  const account = get(walletAtom)
  try {
    return account ? Address.from(account) : null
  } catch (e) {
    return null
  }
})

const senderOrNullAddress = atom((get) => get(zapSender) ?? Address.ZERO)

export const zapperInputs = simplifyLoadable(
  loadable(
    onlyNonNullAtom(async (get) => {
      const selectedZapToken = get(selectedZapTokenAtom)
      const rToken = get(rTokenAtom)
      const universe = get(resolvedZapState)
      await universe.initialized
      return {
        tokenToZap: selectedZapToken,
        rToken: await universe.getToken(Address.from(rToken.address)),
        universe: universe,
        zapSearcher: new Searcher(universe as Universe<EthereumConfigType>),
      }
    })
  )
)

export const maxZapInputSize = simplifyLoadable(
  loadable(
    onlyNonNullAtom(async (get) => {
      const { issuanceAvailable } = get(rTokenStateAtom)
      const inputs = get(zapperInputs)
      await inputs.universe.initialized

      const maxOut = inputs.rToken.fromDecimal(issuanceAvailable)
      const maxOutValue = await inputs.universe.fairPrice(maxOut)

      const valueOfInputToken = await inputs.universe.fairPrice(
        inputs.tokenToZap.one
      )

      if (maxOutValue == null || valueOfInputToken == null) {
        return inputs.tokenToZap.fromDecimal(10000000)
      }

      const size = maxOutValue.div(valueOfInputToken).into(inputs.tokenToZap)
      const out = size.token.from(size.amount)
      return out
    })
  )
)

const parsedUserInput = onlyNonNullAtom((get) => {
  const out = get(selectedZapTokenAtom).fromDecimal(get(zapInputString))
  return out
})

const debouncedUserInputGenerator = atomWithDebounce(
  atom((get) => get(parsedUserInput)),
  400
).debouncedValueAtom

const parsedRedeemUserInput = onlyNonNullAtom((get) =>
  get(zapperInputs).rToken.from(get(zapRedeemInputString))
)
export const redeemZapQuoteInput = onlyNonNullAtom((get) => {
  const signer = get(senderOrNullAddress)
  const { rToken, tokenToZap, universe, zapSearcher } = get(zapperInputs)
  const inputQuantity = get(parsedRedeemUserInput, tokenToZap.zero)
  return {
    signer,
    inputQuantity,
    inputToken: rToken,
    output: tokenToZap,
    universe,
    zapSearcher,
  }
})
export const zapQuoteInput = onlyNonNullAtom((get) => {
  const signer = get(senderOrNullAddress)
  const { rToken, tokenToZap, universe, zapSearcher } = get(zapperInputs)
  const maxInputSize = get(maxZapInputSize)

  const inputQuantity = get(debouncedUserInputGenerator, tokenToZap.zero)
  return {
    signer,
    inputQuantity: maxInputSize.gte(inputQuantity)
      ? inputQuantity
      : maxInputSize,
    inputToken: tokenToZap,
    rToken: rToken,
    universe,
    zapSearcher,
  }
})

const debouncedRedeemZapUserInputGenerator = atomWithDebounce(
  atom((get) => get(redeemZapQuoteInput)),
  400
).debouncedValueAtom

export const redoZapQuote = atom(0)
export const zapQuotePromise = loadable(
  onlyNonNullAtom(async (get) => {
    get(redoZapQuote)
    const input = get(zapQuoteInput)

    if (input.inputQuantity.amount === 0n) {
      return null
    }
    const a = get(zapperInputs).zapSearcher.findSingleInputToRTokenZap(
      input.inputQuantity,
      input.rToken,
      input.signer,
      get(tradeSlippage)
    )
    a.catch((e) => {})

    const out = await a
    return out
  })
)

export const zapInputValuePromise = loadable(
  onlyNonNullAtom(async (get) => {
    const input = get(zapQuoteInput)
    await input.universe.initialized

    if (input.inputQuantity.amount === 0n) {
      return null
    }

    return input.universe.fairPrice(input.inputQuantity)
  })
)
export const zapInputValue = simplifyLoadable(zapInputValuePromise)

export const redeemInputValuePromise = loadable(
  onlyNonNullAtom(async (get) => {
    const input = get(debouncedRedeemZapUserInputGenerator)
    await input.universe.initialized
    if (input.inputQuantity.amount === 0n) {
      return null
    }
    return input.universe.fairPrice(input.inputQuantity)
  })
)
export const redeemInputValue = simplifyLoadable(redeemInputValuePromise)
export const zapQuote = simplifyLoadable(zapQuotePromise)

export const redoRedeemZapQuote = atom(0)
export const redeemZapQuotePromise = loadable(
  onlyNonNullAtom(async (get) => {
    get(redoZapQuote)
    const input = get(debouncedRedeemZapUserInputGenerator)
    if (input.inputQuantity.amount === 0n) {
      return null
    }
    const a = get(zapperInputs).zapSearcher.findRTokenIntoSingleTokenZap(
      input.inputQuantity,
      input.output,
      input.signer,
      get(tradeSlippage)
    )
    a.catch((e) => console.log(e.message))

    const out = await a
    return out
  })
)
export const redeemZapQuote = simplifyLoadable(redeemZapQuotePromise)

export const approximateGasUsage: Record<string, bigint> = {
  '0xa0d69e286b938e21cbf7e51d71f6a4c8918f482f': 3_000_000n,
  '0xe72b141df173b999ae7c1adcbf60cc9833ce56a8': 3_000_000n,
  '0xacdf0dba4b9839b96221a8487e9ca660a48212be': 6_000_000n,
  '0xf2098092a5b9d25a3cc7ddc76a0553c9922eea9e': 3_000_000n,
  '0x9b451beb49a03586e6995e5a93b9c745d068581e': 3_000_000n,
  '0xfc0b1eef20e4c68b3dcf36c4537cfa7ce46ca70b': 3_000_000n,
  '0x50249c768a6d3cb4b6565c0a2bfbdb62be94915c': 3_000_000n,
  '0xcc7ff230365bd730ee4b352cc2492cedac49383e': 6_000_000n,
  '0xcb327b99ff831bf8223cced12b1338ff3aa322ff': 3_000_000n,
}
export const selectedZapTokenBalance = atom((get) => {
  const token = get(selectedZapTokenAtom)
  if (token == null) {
    return null
  }
  const zapState = get(resolvedZapState)
  if (zapState == null) {
    return null
  }
  const quantities = get(balancesAtom) ?? {}
  const fr = quantities[token.address.address as any]?.balance ?? '0'
  let bal = token.from(fr)
  return bal
})

export const maxSelectedZapTokenBalance = atom((get) => {
  const token = get(selectedZapTokenAtom)
  if (token == null) {
    return null
  }
  const zapState = get(resolvedZapState)
  if (zapState == null) {
    return null
  }
  const rtoken = get(rTokenAtom)
  const zapTransaction = get(resolvedZapTransaction)
  const quantities = get(balancesAtom) ?? {}
  const fr = quantities[token.address.address as any]?.balance ?? '0'
  let bal = token.from(fr)
  if (token.address.address === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
    const a =
      zapState.gasPrice *
      (zapTransaction?.transaction.gasEstimate ??
        approximateGasUsage[rtoken?.address.toLowerCase() ?? ''] ??
        2_500_000n)
    bal = bal.sub(token.from(a))
    bal = bal.amount < 0n ? token.zero : bal
  }
  return bal
})

export const approvalNeededForRedeemAtom = loadable(
  onlyNonNullAtom(async (get) => {
    const zapInput = get(redeemZapQuoteInput)
    const universe = zapInput.universe
    const token = zapInput.inputToken
    const user = zapInput.signer
    const input = zapInput.inputQuantity
    get(approvalRandomId)

    let approvalNeeded = false
    let spender = Address.from(universe.config.addresses.zapperAddress)
    if (token !== universe.nativeToken) {
      const allowance = await universe.approvalsStore.queryAllowance(
        token,
        user,
        spender
      )
      const needed = input.amount === 0n ? 2n ** 64n : input.amount
      approvalNeeded = needed > allowance.toBigInt()
    }
    const data =
      id('approve(address,uint256)').slice(0, 10) +
      defaultAbiCoder
        .encode(['address', 'uint256'], [spender.address, MaxUint256])
        .slice(2)
    const out = {
      approvalNeeded,
      token,
      user,
      usingPermit2: false,
      spender,
      universe,
      tx: {
        to: token.address.address,
        data,
        from: user.address,
      },
    }
    return out
  })
)
export const resolvedRedeemApprovalNeeded = simplifyLoadable(
  approvalNeededForRedeemAtom
)

export const approvalNeededAtom = loadable(
  onlyNonNullAtom(async (get) => {
    const token = get(selectedZapTokenAtom)
    const user = get(zapSender)
    const universe = get(resolvedZapState)
    const input = get(parsedUserInput)
    get(approvalRandomId)

    let approvalNeeded = false
    let spender = Address.from(universe.config.addresses.zapperAddress)
    let usingPermit2 = false
    if (token !== universe.nativeToken) {
      const allowance = await universe.approvalsStore.queryAllowance(
        token,
        user,
        spender
      )
      const needed = input.amount === 0n ? 2n ** 64n : input.amount
      approvalNeeded =
        allowance.toBigInt() === 0n || needed > allowance.toBigInt()
      // console.log('allowance', allowance.toBigInt())
      // console.log('allowance.toBigInt() === 0n', allowance.toBigInt() === 0n)
      // console.log(
      //   'needed > allowance.toBigInt()',
      //   needed > allowance.toBigInt()
      // )
    }

    const data =
      id('approve(address,uint256)').slice(0, 10) +
      defaultAbiCoder
        .encode(['address', 'uint256'], [spender.address, MaxUint256])
        .slice(2)
    const out = {
      approvalNeeded,
      token,
      user,
      usingPermit2,
      spender,
      universe,
      tx: {
        to: token.address.address,
        data,
        from: user.address,
      },
    }
    return out
  })
)
export const resolvedApprovalNeeded = simplifyLoadable(approvalNeededAtom)

const permit2ToSign = (get: Getter) => {
  get(approvalRandomId)
  const inputs = get(zapperInputs)
  const qty = get(zapQuoteInput)
  if (inputs == null || qty == null) {
    return null
  }
  const nonce = Math.floor(Math.random() * 1000000000)
  const permit: PermitTransferFrom = {
    permitted: {
      // token we are permitting to be transferred
      token: qty.inputQuantity.token.address.address,
      // amount we are permitting to be transferred
      amount: qty.inputQuantity.amount,
    },
    // who can transfer the tokens
    spender: inputs.universe.config.addresses.zapperAddress.address,
    nonce,
    // signature deadline
    deadline: BigInt(Number.MAX_SAFE_INTEGER),
  }
  return {
    data: SignatureTransfer.getPermitData(
      permit,
      PERMIT2_ADDRESS,
      inputs.universe.chainId
    ) as unknown as PermitTransferFromData,
    permit,
  }
}

export const permit2ToSignAtom = atom((get) => permit2ToSign(get))

export const approvalTxFee = loadable(
  onlyNonNullAtom(async (get) => {
    const approveTx = get(resolvedApprovalNeeded)
    const universe = get(resolvedZapState)
    const gasBalance =
      get(balancesAtom)['0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE']?.value ??
      0n
    const gasUnits =
      approveTx.approvalNeeded === true
        ? (await universe.provider.estimateGas(approveTx.tx)).toBigInt()
        : 0n
    return {
      approvalNeeded: approveTx,
      tx: approveTx.tx,
      gasBalance,
      gasUnits,
      fee: universe.nativeToken.from(universe.gasPrice).scalarMul(gasUnits),
    }
  })
)

export const resolvedApprovalTxFee = simplifyLoadable(approvalTxFee)

const useMaxIssueance: Record<number, boolean> = {
  [ChainId.Mainnet]: true,
  [ChainId.Base]: true,
}

const redeemZapTxAtom = atom(async (get) => {
  const result = get(redeemZapQuote)
  const chainId = get(chainIdAtom)
  const approvalNeeded = get(resolvedRedeemApprovalNeeded)
  if (!(approvalNeeded && result)) {
    return null
  }
  const txp = result.toTransactionWithRetry({
    outputSlippage: get(zapOutputSlippage),
    maxIssueance: useMaxIssueance[chainId] ?? false,
    returnDust: get(collectDust),
  })
  txp.catch((e) => console.log(e.message))
  const tx = await txp

  // console.log("=== abstract zap transaction ===")
  // console.log(result.describe().join("\n"))
  return {
    result,
    transaction: tx,
  }
})

export const redeemZapTransaction = loadable(redeemZapTxAtom)
export const resolvedRedeemZapTransaction =
  simplifyLoadable(redeemZapTransaction)

const zapTxAtom = atom(async (get) => {
  const result = get(zapQuote)
  const chainId = get(chainIdAtom)
  const approvalNeeded = get(resolvedApprovalNeeded)

  if (!(approvalNeeded && result)) {
    return null
  }

  let permit2 = undefined
  if (approvalNeeded.usingPermit2 === true) {
    const permit = get(permit2ToSignAtom)
    const signature = get(permitSignature)
    permit2 =
      signature != null && permit != null
        ? {
            permit: permit.permit,
            signature,
          }
        : undefined
  }
  const tx = await result.toTransactionWithRetry({
    outputSlippage: get(zapOutputSlippage),
    maxIssueance: useMaxIssueance[chainId] ?? false,
    returnDust: get(collectDust),
  })
  console.log(tx.describe().join('\n'))
  return {
    result,
    transaction: tx,
    permit2,
  }
})

export const zapTransaction = loadable(zapTxAtom)
const resolvedZapTransaction_ = simplifyLoadable(zapTransaction)

export const resolvedZapTransaction = atom((get) => {
  const state = get(resolvedZapState)
  const current = get(resolvedZapTransaction_)
  if (current != null) {
    if (current.result.universe === state) {
      return current
    }
    return null
  }
  const previous = get(previousZapTransaction)
  if (previous != null && state === previous.result.universe) {
    return previous
  }
  return null
})

export const resolvedZapTransactionGasEstimateUnits = onlyNonNullAtom((get) => {
  const tx = get(resolvedZapTransaction)
  const needsApproval = get(resolvedApprovalNeeded)
  if (needsApproval.approvalNeeded) {
    return 100000n
  }
  return tx.transaction.gasEstimate
})

const zapTransactionGasEstimateFee = onlyNonNullAtom((get) => {
  const quote = get(zapQuote)
  const estimate = get(resolvedZapTransactionGasEstimateUnits)
  return quote.universe.nativeToken
    .from(estimate)
    .scalarMul(quote.universe.gasPrice)
})

export const noZapActive = atom(
  (get) => get(zapQuotePromise).state === 'loading'
)

const totalGasTokenInput = onlyNonNullAtom((get) => {
  const input = get(zapQuoteInput)
  const universe = get(resolvedZapState)
  let gasTokenInput =
    input.inputQuantity.token === universe.nativeToken
      ? input.inputQuantity
      : universe.nativeToken.zero

  return gasTokenInput.add(get(zapTransactionGasEstimateFee))
})

// TODO: Fix gas balance
const totalGasBalance = onlyNonNullAtom(
  (get) =>
    get(balancesAtom)['0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE']?.value ?? 0n
)

const hasSufficientGasTokenBalance = onlyNonNullAtom((get) => {
  const gasTokenBalanceBN = get(totalGasBalance)
  const gasTokenBalanceNeeded = get(totalGasTokenInput)
  const isSmartWallet = get(isSmartWalletAtom) // Smart wallets don't need ETH to pay for tx
  return isSmartWallet || gasTokenBalanceBN >= gasTokenBalanceNeeded.amount
})

const hasSufficientTokeBalance = onlyNonNullAtom((get) => {
  const inputQty = get(parsedUserInput)
  const totalBalance = get(selectedZapTokenBalance)
  return totalBalance.gte(inputQty)
})

export const hasSufficientGasTokenAndERC20TokenBalance = onlyNonNullAtom(
  (get) => ({
    gas: {
      hasSufficient: get(hasSufficientGasTokenBalance, false),
      total: get(totalGasBalance),
      input: get(totalGasTokenInput),
    },
    tokens: {
      hasSufficient: get(hasSufficientTokeBalance, false),
      total: get(selectedZapTokenBalance),
      input: get(parsedUserInput),
    },
  })
)
