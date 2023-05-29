import {
  base,
  contracts,
  entities,
  searcher,
} from '@reserve-protocol/token-zapper'
import {
  PERMIT2_ADDRESS,
  PermitTransferFrom,
  PermitTransferFromData,
  SignatureTransfer,
} from '@uniswap/permit2-sdk'
import { ethers } from 'ethers'
import { atom, Getter } from 'jotai'
import { loadable } from 'jotai/utils'
import { rTokenAtom, walletAtom } from 'state/atoms'
import { tokenBalancesStore } from 'state/TokenBalancesUpdater'

import atomWithDebounce from 'utils/atoms/atomWithDebounce'
import {
  atomWithOnWrite,
  onlyNonNullAtom,
  simplifyLoadable,
} from 'utils/atoms/utils'

import {
  resolvedZapState,
  supportsPermit2Signatures,
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
export const zapInputString = atomWithOnWrite('', (_, set, __) => {
  set(permitSignature, null)
})
export const tokenToZapUserSelected = atomWithOnWrite(
  null as entities.Token | null,
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
  (get) => get(tokenToZapUserSelected) ?? get(zappableTokens).at(0) ?? null
)

export const zapSender = atom((get) => {
  try {
    return base.Address.from(get(walletAtom))
  } catch (e) {
    return null
  }
})

const senderOrNullAddress = atom((get) => get(zapSender) ?? base.Address.ZERO)
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
        rToken: await universe.getToken(base.Address.from(rToken.address)),
        universe: universe,
        zapSearcher: new searcher.Searcher(universe),
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

export const zapQuotePromise = loadable(
  onlyNonNullAtom(async (get) => {
    const input = get(debouncedUserInputGenerator)
    if (input.inputQuantity.amount === 0n) {
      return null
    }
    return await input.zapSearcher.findSingleInputToRTokenZap(
      input.inputQuantity,
      input.rToken,
      input.signer,
      get(tradeSlippage)
    )
  })
)

export const zapQuote = simplifyLoadable(zapQuotePromise)

export const selectedZapTokenBalance = onlyNonNullAtom((get) => {
  const token = get(selectedZapTokenAtom)
  const bal =
    get(tokenBalancesStore.getBalanceAtom(token.address.address)).value ??
    ethers.constants.Zero
  return token.from(bal)
})

export const approvalNeededAtom = loadable(
  onlyNonNullAtom(async (get) => {
    const token = get(selectedZapTokenAtom)
    const user = get(zapSender)
    const universe = get(resolvedZapState)
    get(approvalRandomId)

    let approvalNeeded = false
    let spender = base.Address.from(universe.config.addresses.zapperAddress)
    let usingPermit2 = false
    if (token !== universe.nativeToken) {
      if (
        get(supportsPermit2Signatures) &&
        !(await universe.approvalStore.needsApproval(
          token,
          user,
          base.Address.from(PERMIT2_ADDRESS)
        ))
      ) {
        spender = base.Address.from(PERMIT2_ADDRESS)
        usingPermit2 = true
        approvalNeeded = false
      } else {
        approvalNeeded = await universe.approvalStore.needsApproval(
          token,
          user,
          base.Address.from(universe.config.addresses.zapperAddress)
        )
      }
    }
    const out = {
      approvalNeeded,
      token,
      user,
      usingPermit2,
      spender,
      universe,
      tx: {
        to: token.address.address,
        data: erc20Iface.encodeFunctionData('approve', [
          spender.address,
          user.address,
        ]),
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
    spender: inputs.universe.chainConfig.config.addresses.zapperAddress.address,
    nonce,
    // signature deadline
    deadline: ethers.constants.MaxUint256,
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

const erc20Iface = contracts.IERC20__factory.createInterface()

export const approvalTxFee = loadable(
  onlyNonNullAtom(async (get) => {
    const approveTx = get(resolvedApprovalNeeded)
    const universe = get(resolvedZapState)
    const gasBalance = get(tokenBalancesStore.getGasBalanceAtom()).value
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

const totalGasBalance = onlyNonNullAtom(
  (get) =>
    get(tokenBalancesStore.getGasBalanceAtom()).value ?? ethers.constants.Zero
)
const hasSufficientGasTokenBalance = onlyNonNullAtom((get) => {
  const gasTokenBalanceBN = get(totalGasBalance)
  const gasTokenBalanceNeeded = get(totalGasTokenInput)
  return gasTokenBalanceBN.toBigInt() >= gasTokenBalanceNeeded.amount
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
