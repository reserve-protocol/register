import { Address, Token, Searcher } from '@reserve-protocol/token-zapper'
import {
  PERMIT2_ADDRESS,
  PermitTransferFrom,
  PermitTransferFromData,
  SignatureTransfer,
} from '@uniswap/permit2-sdk'
import { atom, Getter } from 'jotai'
import { loadable } from 'jotai/utils'
import { balancesAtom, rTokenAtom, walletAtom } from 'state/atoms'

import { defaultAbiCoder } from '@ethersproject/abi'
import { id } from '@ethersproject/hash'
import { MaxUint256 } from '@ethersproject/constants'
import atomWithDebounce from 'utils/atoms/atomWithDebounce'
import {
  atomWithOnWrite,
  onlyNonNullAtom,
  simplifyLoadable,
} from 'utils/atoms/utils'

import {
  resolvedZapState,
  zappableTokens,
} from './zapper'

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

// The only actual state the user controls:
export const tokenToZapPopupState = atom(false)
export const collectDust = atom(true)
export const zapInputString = atomWithOnWrite('', (_, set, __) => {
  set(permitSignature, null)
})
export const tokenToZapUserSelected = atomWithOnWrite(
  null as Token | null,
  (_, set, prev, next) => {
    if (prev !== next) {
      set(zapInputString, '')
      set(tokenToZapPopupState, false)
    }
  }
)

// The hidden state of the UI. A lot of this could probably be refactored out via async atoms
export const permitSignature = atom(null as null | string)

// The amount of slippage we allow when zap involves a trade:
// This is not exposed in the UI yet, but probably should be.
const tradeSlippage = atom(0.01)

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
  (get) => get(tokenToZapUserSelected) ?? get(zappableTokens).at(1) ?? null
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
const parsedUserInput = onlyNonNullAtom((get) =>
  get(selectedZapTokenAtom).fromDecimal(get(zapInputString))
)

export const zapperInputs = simplifyLoadable(
  loadable(
    onlyNonNullAtom(async (get) => {
      const selectedZapToken = get(selectedZapTokenAtom)
      const rToken = get(rTokenAtom)
      const universe = get(resolvedZapState)
      return {
        tokenToZap: selectedZapToken,
        rToken: await universe.getToken(Address.from(rToken.address)),
        universe: universe,
        zapSearcher: new Searcher(universe),
      }
    })
  )
)
export const zapQuoteInput = onlyNonNullAtom((get) => {
  const signer = get(senderOrNullAddress)
  const { rToken, tokenToZap, universe, zapSearcher } = get(zapperInputs)
  const inputQuantity = get(parsedUserInput, tokenToZap.zero)
  return {
    signer,
    inputQuantity,
    inputToken: tokenToZap,
    rToken: rToken,
    universe,
    zapSearcher,
  }
})

const debouncedUserInputGenerator = atomWithDebounce(
  atom((get) => get(zapQuoteInput)),
  400
).debouncedValueAtom

let firstTime = true
export const zapQuotePromise = loadable(
  onlyNonNullAtom(async (get) => {
    const input = get(debouncedUserInputGenerator)
    if (input.inputQuantity.amount === 0n) {
      return null
    }
    // I suspect that the first time we call this function it's too slow because caches are being populated.
    // This seems to cause the estimate to fail. So we call it once before we actually need it.
    if (firstTime) {
      try {
        await input.zapSearcher.findSingleInputToRTokenZap(
          input.inputQuantity,
          input.rToken,
          input.signer,
          get(tradeSlippage)
        )
      } catch (e) {
        console.log(e)
      }
      await new Promise((resolve) => setTimeout(resolve, 1000))
      firstTime = false
    }
    const a = input.zapSearcher.findSingleInputToRTokenZap(
      input.inputQuantity,
      input.rToken,
      input.signer,
      get(tradeSlippage)
    )
    a.catch((e) => console.log(e.message))

    const out = await a
    console.log(out)
    return out
  })
)

export const zapQuote = simplifyLoadable(zapQuotePromise)

export const selectedZapTokenBalance = onlyNonNullAtom((get) => {
  const token = get(selectedZapTokenAtom)
  const quantities = get(balancesAtom) ?? {}
  const bal = quantities[token.address.address as any]?.balance ?? 0n

  return token.from(bal)
})

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
      approvalNeeded =
        (input.amount === 0n ? 2n ** 64n : input.amount) >
        allowance.toBigInt()
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

export const zapTransaction = loadable(
  atom(async (get) => {
    const result = get(zapQuote)
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

    return {
      result,
      transaction: await result.toTransaction({
        permit2,
        returnDust: get(collectDust),
      }),
      permit2,
    }
  })
)
export const resolvedZapTransaction = simplifyLoadable(zapTransaction)

export const zapTransactionGasEstimateUnits = loadable(
  onlyNonNullAtom(async (get) => {
    const tx = get(resolvedZapTransaction)
    const needsApproval = get(resolvedApprovalNeeded)
    if (
      needsApproval.approvalNeeded ||
      (needsApproval.usingPermit2 === true && tx.permit2 == null)
    ) {
      return null
    }
    for (let i = 0; i < 3; i++) {
      try {
        return await tx.result.universe.provider
          .estimateGas({
            to: tx.transaction.tx.to,
            data: tx.transaction.tx.data,
            value: tx.transaction.tx.value,
            from: tx.transaction.tx.from,
          })
          .then((bn) => {
            const out = bn.toBigInt()
            return out + out / 10n
          })
      } catch (e) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        continue
      }
    }
    throw new Error('Failed to estimate gas')
  })
)

export const resolvedZapTransactionGasEstimateUnits = simplifyLoadable(
  zapTransactionGasEstimateUnits
)

const zapTransactionGasEstimateFee = onlyNonNullAtom((get) => {
  const quote = get(zapQuote)
  const estimate = get(resolvedZapTransactionGasEstimateUnits, 0n)
  return quote.universe.nativeToken
    .from(estimate ?? 0n)
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
  return gasTokenBalanceBN >= gasTokenBalanceNeeded.amount
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
