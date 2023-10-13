import { Token, TokenQuantity } from '@reserve-protocol/token-zapper'
import { atom, Getter, SetStateAction, Setter } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { Atom } from 'jotai/vanilla'
import { ethPriceAtom, gasFeeAtom, gasPriceAtom, isWalletModalVisibleAtom, rTokenAtom } from 'state/atoms'
import { onlyNonNullAtom } from 'utils/atoms/utils'

import { notifyError, notifySuccess } from 'hooks/useNotification'
import mixpanel from 'mixpanel-browser'
import { addTransactionAtom } from 'state/chain/atoms/transactionAtoms'
import {
  approvalNeededAtom,
  approvalPending,
  approvalRandomId,
  hasSufficientGasTokenAndERC20TokenBalance,
  noZapActive,
  permit2ToSignAtom,
  permitSignature,
  resolvedApprovalNeeded,
  resolvedApprovalTxFee,
  resolvedZapTransaction,
  resolvedZapTransactionGasEstimateUnits,
  selectedZapTokenAtom,
  selectedZapTokenBalance,
  signatureRequestPending,
  tokenToZapPopupState,
  tokenToZapUserSelected,
  zapInputString,
  zapIsPending,
  zapperInputs,
  zapQuote,
  zapQuoteInput,
  zapQuotePromise,
  redoQuote,
  zapSender,
  zapTransaction,
  zapTransactionGasEstimateUnits,
  zapTxHash,
  previousZapTransaction,
} from './atoms'
import { formatQty, FOUR_DIGITS } from './formatTokenQuantity'
import { resolvedZapState, zappableTokens, zapperState } from './zapper'

/**
 * This file contains atoms that are used to control the UI state of the Zap component.
 *
 * The code is split as the atoms.ts file was getting a bit large, and this code mainly deals with
 * exposing the atoms to the UI.
 *
 * atoms.ts deals with quoting, estimating gas, generating transactions etc.
 *
 * ui-atoms.ts consumes the derived atoms, and handles triggering/running anything web3
 */

const zapTransactionFeeDisplayAtom = onlyNonNullAtom((get) => {
  const { nativeToken, gasPrice } = get(resolvedZapState)
  if (get(noZapActive)) {
    return `Zap tx 0.0 ${nativeToken.symbol}`
  }

  const approval = get(resolvedApprovalTxFee)
  if (approval.approvalNeeded.approvalNeeded === true) {
    return ['Approval tx', formatQty(approval.fee, FOUR_DIGITS)].join(' ')
  }

  const tx = get(resolvedZapTransaction)

  if (
    get(zapTransactionGasEstimateUnits).state === 'loading' ||
    get(zapTransactionGasEstimateUnits).state === 'hasError' ||
    (approval.approvalNeeded.usingPermit2 === true && tx.permit2 == null)
  ) {
    return [
      'Zap tx',
      formatQty(
        nativeToken.fromBigInt(tx.transaction.feeEstimate(gasPrice)),
        FOUR_DIGITS
      ),
      '(estimate)',
    ].join(' ')
  }

  const zapTxUnits = get(resolvedZapTransactionGasEstimateUnits, 0n)
  return [
    'Zap tx',
    formatQty(nativeToken.from(zapTxUnits).scalarMul(gasPrice), FOUR_DIGITS),
  ].join(' ')
})

export const approvalTxFeeAtom = atom((get) => {
  const approval = get(resolvedApprovalTxFee)
  const gasUsdPrice = get(ethPriceAtom)

  return approval?.fee ? +approval.fee.format() * gasUsdPrice : 0
})

export const zapTxFeeAtom = atom((get) => {
  const tx = get(resolvedZapTransaction)
  const gasPrice = get(gasFeeAtom)
  const gasUsdPrice = get(ethPriceAtom)
  return tx?.transaction?.gasEstimate
    ? Number(tx.result.universe.nativeToken.from(tx.transaction.feeEstimate(gasPrice ?? 1n)).format()) * gasUsdPrice
    : 0
})

export const zapTransactionFeeDisplay = onlyNonNullAtom((get) => {
  const { nativeToken } = get(resolvedZapState)
  get(zapQuote)
  return get(
    zapTransactionFeeDisplayAtom,
    ['Zap tx', `⌛️ ${nativeToken.symbol}`].join(' ')
  )
})

export const zapOutputAmount = atom((get) => {
  const previous = get(previousZapTransaction)
  const quote = get(zapQuote) ?? previous?.result
  const rTokenOut = quote?.outputToken
  if (quote == null || rTokenOut == null) {
    return '0.0'
  }
  return formatQty(
    quote.swaps.outputs.find((r) => r.token === rTokenOut) ?? rTokenOut.zero,
    FOUR_DIGITS
  )
})

export const zapDust = atom((get) => {
  const tx = get(previousZapTransaction)
  const quote = tx?.result ?? get(zapQuote)
  if (quote == null) {
    return []
  }

  const rTokenOut = quote.outputToken

  const dust = quote.swaps.outputs.filter(i => i.token !== rTokenOut && i.amount !== 0n)
  return dust
})

export const zapDustValue = atom(async (get) => {
  const dust = get(zapDust)
  if (dust == null) {
    return null
  }
  const tx = get(previousZapTransaction)
  const quote = tx?.result ?? get(zapQuote)
  if (quote == null) {
    return null
  }
  const dustUSD = await Promise.all(dust.map(async d => ({
    dustQuantity: d,
    usdValueOfDust: await quote.universe.fairPrice(d)
  })))

  let total = 0n
  for (const d of dustUSD) {
    total += d.usdValueOfDust?.amount ?? 0n
  }
  return {
    dust: dustUSD,
    total: quote.universe.usd.from(total)
  }
})

export const zapOutputValue = onlyNonNullAtom((get) => {
  const quote = get(zapQuote)
  const rTokenOut = get(zapperInputs).rToken
  const qty =
    quote.swaps.outputs.find((r) => r.token == rTokenOut) ?? rTokenOut.zero

  return qty.format()
}, '0')


const state = atom((get) => {
  const quotePromise = get(zapQuotePromise)
  const approvePromise = get(approvalNeededAtom)
  const prev = get(previousZapTransaction)
  const tx = get(zapTransaction)
  const units = get(zapTransactionGasEstimateUnits)
  const balances = get(hasSufficientGasTokenAndERC20TokenBalance)

  if (balances?.gas.hasSufficient === false) {
    return 'insufficient_gas_balance'
  }
  if (balances?.tokens.hasSufficient === false) {
    return 'insufficient_token_balance'
  }

  if (get(zapIsPending)) {
    return 'tx_sent_loading'
  }
  if (get(approvalPending)) {
    return 'approval_sent_loading'
  }
  if (get(signatureRequestPending)) {
    return 'signature_loading'
  }

  if (quotePromise.state === 'loading') return 'quote_loading'
  if (quotePromise.state === 'hasError') return 'quote_error'
  if (quotePromise.data == null) {
    return 'initial'
  }
  if (approvePromise.state === 'loading') return 'approval_loading'
  if (approvePromise.state === 'hasError') return 'approval_error'
  if (approvePromise.data == null) {
    return 'approval_loading'
  }

  if (approvePromise.data.approvalNeeded === true) {
    return 'approval'
  }

  if (tx.state === 'loading') return 'tx_loading'
  if (tx.state === 'hasError') return 'tx_error'
  if (tx.data == null) {
    return 'tx_loading'
  }
  if (approvePromise.data.usingPermit2 === true && tx.data.permit2 == null) {
    return 'sign_permit'
  }

  if (units.state === 'loading') return 'tx_estimate_loading'
  if (units.state === 'hasError') return 'tx_estimate_error'
  if (units.data == null) return 'tx_estimate_error'

  return 'send_tx'
})
type UIState = typeof state extends Atom<infer T> ? T : never
const buttonEnabledStates = new Set<UIState>([
  'approval',
  'sign_permit',
  'send_tx',
])
const loadingStates = new Set<UIState>([
  'quote_loading',
  // 'approval_loading',
  'tx_estimate_loading',
  'tx_loading',
  'tx_sent_loading',
  // 'approval_sent_loading',
  'signature_loading',
])
const buttonEnabled = atom((get) => buttonEnabledStates.has(get(state)) || get(previousZapTransaction) != null)
const buttonIsLoading = atom((get) => loadingStates.has(get(state)))
const buttonLabel = atom((get) => {
  if (get(zapSender) == null) {
    return 'Connect Wallet'
  }
  const loadedState = get(zapperInputs)
  if (loadedState == null) {
    return '+ Zap'
  }

  if (get(previousZapTransaction) != null) {
    return `+ Mint ${loadedState.rToken.symbol}`
  }

  switch (get(state)) {
    case 'insufficient_gas_balance':
      return 'Insufficient ETH balance'
    case 'insufficient_token_balance':
      return `Insufficient ${loadedState.tokenToZap.symbol} balance`
    case 'quote_error':
      return 'Failed to find zap'
    case 'approval_error':
      return 'Approval failed'
    case 'tx_error':
      return 'Failed to construct zap'
    case 'tx_estimate_error':
      return 'Failed to estimate gas - try with different input'
    case 'sign_permit':
      return `Sign & Zap ${loadedState.tokenToZap.symbol} for ${loadedState.rToken.symbol}`
    default:
      return `+ Mint ${loadedState.rToken.symbol}`
  }
})
const buttonLoadingLabel = atom((get) => {
  switch (get(state)) {
    case 'tx_estimate_loading':
      return 'Estimating gas'
    case 'quote_loading':
      return `Finding zap`
    case 'tx_loading':
      return `Creating transaction`
    case 'tx_sent_loading':
      return `Waiting for zap`
    default:
      return `Loading..`
  }
})

const zapEnabledForRTokens = new Set<string>([
  '0xa0d69e286b938e21cbf7e51d71f6a4c8918f482f',
  '0xe72b141df173b999ae7c1adcbf60cc9833ce56a8',
  '0xacdf0dba4b9839b96221a8487e9ca660a48212be',
  '0xf2098092a5b9d25a3cc7ddc76a0553c9922eea9e',
  '0x9b451beb49a03586e6995e5a93b9c745d068581e',
  '0xfc0b1eef20e4c68b3dcf36c4537cfa7ce46ca70b',
  '0x50249c768a6d3cb4b6565c0a2bfbdb62be94915c',
  '0xcc7ff230365bd730ee4b352cc2492cedac49383e'
])

export const zapEnabledAtom = atomWithStorage('zap-enabled', false)
export const zapAvailableAtom = atom((get) => {
  const rTokenAddress = get(rTokenAtom)?.address.toLowerCase()
  return rTokenAddress != null && zapEnabledForRTokens.has(rTokenAddress)
})
let errors = 0
export const ui = {
  zapWidgetEnabled: atom((get) => get(zapEnabledAtom) && get(zapAvailableAtom)),
  zapState: atom((get) => {
    const zapState = get(zapperState)

    return [zapState.state === 'loading', zapState.state === 'hasError']
  }),
  input: {
    tokenSelector: {
      popup: atom<boolean, SetStateAction<boolean>>(
        (get) => get(tokenToZapPopupState),
        (_, set, update) => {
          set(tokenToZapPopupState, update)
        }
      ),
      tokenSelector: atom(
        (get) => get(zappableTokens),
        (_, set, update: Token) => {
          set(tokenToZapUserSelected, update)
        }
      ),
      selectedToken: atom((get) => get(selectedZapTokenAtom)),
    },
    maxAmount: atom(
      (get) => {
        const currentBalance = get(selectedZapTokenBalance)
        if (currentBalance == null) {
          return '0'
        }
        return currentBalance.format()
      },
      (get, set, _) => {
        const currentBalance = get(selectedZapTokenBalance)
        if (currentBalance == null) {
          return
        }
        set(zapInputString, currentBalance.format())
      }
    ),
  },
  output: {
    textBox: atom((get) => {
      const zapPromise = get(zapQuotePromise)
      const output = get(zapOutputAmount)
      if (get(previousZapTransaction) != null) {
        return output ?? '0.0'
      }
      if (zapPromise.state === 'hasData' && zapPromise.data == null) {
        return ''
      }
      if (zapPromise.state === 'loading') {
        return 'Finding zap'
      }
      if (zapPromise.state === 'hasError') {
        return ''
      }
      return output ?? '0.0'
    }),
    txFee: atom((get) =>
      get(zapSender) == null ? '' : get(zapTransactionFeeDisplay) ?? ''
    ),
  },
  state,
  button: atom(
    (get) => ({
      loadingLabel: get(buttonLoadingLabel),
      enabled: (get(zapSender) == null || get(buttonEnabled)),
      loading: get(previousZapTransaction) == null && get(buttonIsLoading),
      label: get(buttonLabel),
    }),
    async (get, set, _) => {
      if (get(zapSender) == null) {
        set(isWalletModalVisibleAtom, true)
      }
      const flowState = get(state)
      const data = getZapActionState(get)

      if (data == null) {
        return
      }
      if (flowState === 'tx_loading') {
        errors = 0
      }
      else if (flowState === 'tx_error') {
        if (errors < 5) {
          console.log("Requoting..")
          set(redoQuote, Math.random())
          errors += 1
        }
      } else if (flowState === 'approval') {
        await approve(get, set, data)
      } else if (flowState === 'send_tx') {
        mixpanel.track('Confirmed Zap', {
          RToken: data.rToken.address.toString().toLowerCase() ?? '',
          inputToken: data.inputToken.symbol,
        })
        await sendTx(get, set, data)
      } else if (flowState === 'sign_permit') {
        await signAndSendTx(get, set, data)
      } else {
        console.log('Invalid state', flowState)
      }
    }
  ),
}

//// ACTIONS
const getZapActionState = (get: Getter) => {
  const quote = get(zapQuote)
  const approvalNeeded = get(resolvedApprovalNeeded)
  const zapInputs = get(zapQuoteInput)
  if (!(quote && approvalNeeded && zapInputs)) {
    return null
  }
  const {
    inputQuantity,
    rToken,
    inputToken,
    universe: { provider: p },
  } = zapInputs
  const provider = p as any
  const signer = provider.getSigner(zapInputs.signer.address)

  return {
    signer,
    inputQuantity,
    rToken,
    provider,
    inputToken,
    quote,
    approvalNeeded,
  }
}
type ZapActionState = NonNullable<ReturnType<typeof getZapActionState>>
type ZapperAction = (
  get: Getter,
  set: Setter,
  state: ZapActionState
) => Promise<void>
const approve: ZapperAction = async (
  _,
  set,
  { approvalNeeded, inputToken, signer }
) => {
  set(approvalPending, true)
  try {
    const resp = await signer.sendTransaction(approvalNeeded.tx)
    const receipt = await resp.wait(1)

    if (receipt.status === 0) {
      notifyError('Approval failed', 'Transaction reverted on chain')
    } else {
      notifySuccess(
        'Approval successful',
        `Approved ${inputToken.symbol} for Zap`
      )
    }
  } catch (e: any) {
    if (e.code === 'ACTION_REJECTED') {
      notifyError('Approval failed', 'User rejected')
    } else {
      notifyError('Approval failed', 'Unknown error ' + e.code)
    }
  } finally {
    set(approvalRandomId, Math.random())
    set(approvalPending, false)
  }
}

const resetTxAtoms = (set: Setter) => {
  set(approvalRandomId, Math.random())
  set(zapIsPending, false)
  set(signatureRequestPending, false)
}

const signAndSendTx: ZapperAction = async (
  get,
  set,
  { signer, provider, rToken, quote }
) => {
  try {
    const permit = get(permit2ToSignAtom)
    if (permit == null) {
      return
    }
    set(signatureRequestPending, true)
    const signature = await signer._signTypedData(
      permit.data.domain,
      permit.data.types,
      permit.data.values
    )
    set(permitSignature, signature)
    set(signatureRequestPending, false)

    set(zapIsPending, true)
    const tx = await quote.toTransaction({
      returnDust: false,
      permit2: {
        permit: permit.permit,
        signature,
      },
    })

    const limit = await provider.estimateGas({
      to: tx.tx.to,
      data: tx.tx.data,
      from: tx.tx.from,
      value: tx.tx.value,
    })
    const resp = await signer.sendTransaction({
      ...tx.tx,
      gasLimit: limit,
    })
    set(permitSignature, null)
    set(zapTxHash, resp.hash)
    set(zapInputString, '')
    set(addTransactionAtom, [resp.hash, `Easy mint ${rToken.symbol}`])
  } catch (e: any) {
    if (e.code === 'ACTION_REJECTED') {
      notifyError('Zap failed', 'User rejected signature request')
    } else {
      notifyError('Zap failed', 'Unknown error ' + e.code)
    }
  } finally {
    resetTxAtoms(set)
  }
}
const sendTx: ZapperAction = async (
  get,
  set,
  { inputQuantity, rToken, signer }
) => {
  const zapTx = get(resolvedZapTransaction)
  const gasLimit = get(resolvedZapTransactionGasEstimateUnits)

  if (!(zapTx && gasLimit)) {
    return
  }
  set(zapIsPending, true)
  try {
    const resp = await signer.sendTransaction({
      ...zapTx.transaction.tx,
      gasLimit,
    })

    set(zapTxHash, resp.hash)
    set(permitSignature, null)
    set(zapInputString, '')
    set(addTransactionAtom, [resp.hash, `Easy mint ${rToken.symbol}`])
  } catch (e: any) {
    if (e.code === 'ACTION_REJECTED') {
      notifyError('Zap failed', 'User rejected')
    } else {
      notifyError('Zap failed', 'Unknown error ' + e.code)
    }
  } finally {
    resetTxAtoms(set)
  }
}
