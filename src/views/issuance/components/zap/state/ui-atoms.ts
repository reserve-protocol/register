import { Address, Token } from '@reserve-protocol/token-zapper'
import { notifyError, notifySuccess } from 'hooks/useNotification'
import { Getter, SetStateAction, Setter, atom } from 'jotai'
import { atomWithStorage, loadable } from 'jotai/utils'
import { Atom } from 'jotai/vanilla'
import mixpanel from 'mixpanel-browser'
import {
  chainIdAtom,
  ethPriceAtom,
  gasFeeAtom,
  isWalletModalVisibleAtom,
  rTokenAtom,
  rTokenBalanceAtom,
} from 'state/atoms'
import {
  addTransactionAtom,
  updateTransactionAtom,
} from 'state/chain/atoms/transactionAtoms'
import { onlyNonNullAtom } from 'utils/atoms/utils'
import {
  approvalNeededAtom,
  approvalNeededForRedeemAtom,
  approvalPending,
  approvalRandomId,
  approximateGasUsage,
  hasSufficientGasTokenAndERC20TokenBalance,
  maxSelectedZapTokenBalance,
  noZapActive,
  permit2ToSignAtom,
  permitSignature,
  previousRedeemZapTransaction,
  previousZapTransaction,
  redeemZapQuote,
  redeemZapQuoteInput,
  redeemZapQuotePromise,
  redeemZapTransaction,
  redoZapQuote,
  resolvedApprovalNeeded,
  resolvedApprovalTxFee,
  resolvedRedeemApprovalNeeded,
  resolvedRedeemZapTransaction,
  resolvedZapTransaction,
  resolvedZapTransactionGasEstimateUnits,
  selectedZapTokenAtom,
  selectedZapTokenBalance,
  signatureRequestPending,
  tokenToZapPopupState,
  tokenToZapUserSelected,
  zapInputString,
  zapIsPending,
  zapQuote,
  zapQuoteInput,
  zapQuotePromise,
  zapRedeemInputString,
  zapSender,
  zapTransaction,
  zapTxHash,
  zapperInputs,
} from './atoms'
import { FOUR_DIGITS, formatQty } from './formatTokenQuantity'
import { resolvedZapState, zappableTokens, zapperState } from './zapper'
import { GetWalletClientResult } from 'wagmi/dist/actions'
import { waitForTransaction } from 'wagmi/actions'
import {
  JsonRpcProvider,
  JsonRpcSigner,
  Provider,
  Web3Provider,
} from '@ethersproject/providers'
import { BaseSearcherResult } from '@reserve-protocol/token-zapper/types/searcher/SearcherResult'
import { TransactionRequest } from 'viem'

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

  const tx = get(previousZapTransaction) ?? get(resolvedZapTransaction)

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
    ? Number(
        tx.result.universe.nativeToken
          .from(tx.transaction.feeEstimate(gasPrice ?? 1n))
          .format()
      ) * gasUsdPrice
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

  const dust = quote.swaps.outputs.filter(
    (i) => i.token !== rTokenOut && i.amount !== 0n
  )
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
  const dustUSD = await Promise.all(
    dust.map(async (d) => ({
      dustQuantity: d,
      usdValueOfDust: await quote.universe.fairPrice(d),
    }))
  )

  let total = 0n
  for (const d of dustUSD) {
    total += d.usdValueOfDust?.amount ?? 0n
  }
  return {
    dust: dustUSD,
    total: quote.universe.usd.from(total),
  }
})

export const redeemZapOutputAmount = atom((get) => {
  const previous = get(previousRedeemZapTransaction)
  const quote = get(redeemZapQuote) ?? previous?.result
  const outputToken = quote?.outputToken
  if (quote == null || outputToken == null) {
    return '0.0'
  }
  return formatQty(
    quote.swaps.outputs.find((r) => r.token === outputToken) ??
      outputToken.zero,
    FOUR_DIGITS
  )
})

export const redeemZapDust = atom((get) => {
  const tx = get(previousRedeemZapTransaction)
  const quote = tx?.result ?? get(redeemZapQuote)
  if (quote == null) {
    return []
  }

  const rTokenOut = quote.outputToken

  const dust = quote.swaps.outputs.filter(
    (i) => i.token !== rTokenOut && i.amount !== 0n
  )
  return dust
})

export const redeemZapDustValue = atom(async (get) => {
  const dust = get(redeemZapDust)
  if (dust == null) {
    return null
  }
  const tx = get(previousRedeemZapTransaction)
  const quote = tx?.result ?? get(redeemZapQuote)
  if (quote == null) {
    return null
  }
  const dustUSD = await Promise.all(
    dust.map(async (d) => ({
      dustQuantity: d,
      usdValueOfDust: await quote.universe.fairPrice(d),
    }))
  )

  let total = 0n
  for (const d of dustUSD) {
    total += d.usdValueOfDust?.amount ?? 0n
  }
  return {
    dust: dustUSD,
    total: quote.universe.usd.from(total),
  }
})

const mkZapState = (
  zapPromise: typeof zapQuotePromise,
  approvalPromise: typeof approvalNeededAtom,
  zapTx: typeof zapTransaction,
  hasSufficient: typeof hasSufficientGasTokenAndERC20TokenBalance
) => {
  return atom((get) => {
    const quotePromise = get(zapPromise)
    const approvePromise = get(approvalPromise)
    const tx = get(zapTx)
    const balances = get(hasSufficient)

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

    return 'send_tx'
  })
}
const zapState = mkZapState(
  zapQuotePromise,
  approvalNeededAtom,
  zapTransaction,
  hasSufficientGasTokenAndERC20TokenBalance
)

const redeemZapState = mkZapState(
  redeemZapQuotePromise,
  approvalNeededForRedeemAtom,
  redeemZapTransaction as any,
  hasSufficientGasTokenAndERC20TokenBalance
)

type UIState = typeof zapState extends Atom<infer T> ? T : never
const buttonEnabledStates = new Set<UIState>([
  'approval',
  'sign_permit',
  'send_tx',
])
const loadingStates = new Set<UIState>([
  'quote_loading',
  // 'approval_loading',
  'tx_loading',
  'tx_sent_loading',
  // 'approval_sent_loading',
  'signature_loading',
])

export const _zapEnabledAtom = atomWithStorage('zap-enabled', false)
export const zapEnabledAtom = atom(
  (get) =>
    get(_zapEnabledAtom) && import.meta.env.VITE_ZAP_MAINTENANCE !== 'true'
)

export const zapAvailableAtom = loadable(
  atom(async (get) => {
    const state = get(resolvedZapState)
    const rtoken = get(rTokenAtom)
    if (state == null || rtoken == null) {
      return null
    }
    await state.initialized
    if (approximateGasUsage[rtoken.address.toLowerCase()]) {
      return { canZap: true, tokensMissings: [] }
    }
    const token = await state.getToken(Address.from(rtoken.address))

    for (let i = 0; i < 2; i++) {
      try {
        const o = await state.canZapIntoRToken(token)
        if (o != null) {
          return o
        }
      } catch (e) {}
    }
    return null
  })
)

const mkButton = (
  previousTxAtom: typeof previousZapTransaction,
  txAtom: typeof resolvedZapTransaction,
  state: typeof zapState,
  zQuote: typeof zapQuote,
  zInput: typeof zapQuoteInput,
  approvalNeeded: typeof resolvedApprovalNeeded
) => {
  let errors = 0

  const zapStateAtom = atom((get) => {
    const quote = get(zQuote)
    const approval = get(approvalNeeded)
    const zapInputs = get(zInput)
    if (!(quote && approval && zapInputs)) {
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
      approvalNeeded: approval,
    }
  })
  const buttonEnabled = atom((get) => {
    const inp = get(zInput)
    if (
      inp == null ||
      inp.signer == null ||
      inp.inputQuantity == null ||
      inp.inputQuantity.amount == 0n
    ) {
      return false
    }
    const s = get(state)
    if (
      s === 'insufficient_gas_balance' ||
      s === 'insufficient_token_balance'
    ) {
      return false
    }
    return buttonEnabledStates.has(s) || get(previousTxAtom) != null
  })
  const buttonIsLoading = atom((get) => loadingStates.has(get(state)))
  const buttonLabel = atom((get) => {
    if (get(zapSender) == null) {
      return 'Connect Wallet'
    }
    const loadedState = get(zapperInputs)
    if (loadedState == null) {
      return '+ Zap'
    }
    const s = get(state)

    switch (s) {
      case 'insufficient_gas_balance':
        return 'Insufficient ETH balance'
      case 'insufficient_token_balance':
        return `Insufficient ${loadedState.tokenToZap.symbol} balance`
    }
    if (get(previousTxAtom) != null) {
      return `+ Mint ${loadedState.rToken.symbol}`
    }
    switch (s) {
      case 'quote_error':
        return 'Failed to find zap'
      case 'approval_error':
        return 'Approval failed'
      case 'tx_error':
        return 'Failed to construct zap'
      case 'sign_permit':
        return `Sign & Zap ${loadedState.tokenToZap.symbol} for ${loadedState.rToken.symbol}`
      default:
        return `+ Mint ${loadedState.rToken.symbol}`
    }
  })
  const redeemButtonLabel = atom((get) => {
    if (get(zapSender) == null) {
      return 'Connect Wallet'
    }
    const loadedState = get(zapperInputs)
    if (loadedState == null) {
      return '+ Redeem'
    }
    const s = get(state)

    switch (s) {
      case 'insufficient_gas_balance':
        return 'Insufficient ETH balance'
      case 'insufficient_token_balance':
        return `Insufficient ${loadedState.rToken.symbol} balance`
    }
    if (get(previousTxAtom) != null) {
      return `Redeem for ${loadedState.tokenToZap.symbol}`
    }
    switch (s) {
      case 'quote_error':
        return 'Failed to find zap'
      case 'approval_error':
        return 'Approval failed'
      case 'tx_error':
        return 'Failed to construct zap'
      case 'sign_permit':
        return `Sign & Zap ${loadedState.tokenToZap.symbol} for ${loadedState.rToken.symbol}`
      case 'approval':
        return 'Approve'
      case 'approval_sent_loading':
        return 'Approving..'
      default:
        return `Redeem for ${loadedState.tokenToZap.symbol}`
    }
  })
  const buttonLoadingLabel = atom((get) => {
    switch (get(state)) {
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

  //// ACTIONS
  type ZapperAction = (
    get: Getter,
    set: Setter,
    state: {
      approvalNeeded: { tx: any }
      inputToken: Token
      signer: any
      provider: Provider
      rToken: Token
      quote: BaseSearcherResult
    }
  ) => Promise<void>

  const approve: ZapperAction = async (
    _,
    set,
    { approvalNeeded, inputToken, signer }
  ) => {
    set(approvalPending, true)
    try {
      const resp = await (signer as Provider).sendTransaction(approvalNeeded.tx)
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
      console.log(e)
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

  const sendTx: ZapperAction = async (
    get,
    set,
    { inputToken, rToken, signer }
  ) => {
    const zapTx = get(txAtom)

    if (zapTx == null) {
      return
    }
    set(zapIsPending, true)
    try {
      const resp = await signer.sendTransaction({
        value: '0x0',
        ...zapTx.transaction.tx,
        gasLimit: zapTx.transaction.gasEstimate,
      })
      const receipt = await resp.wait(1)
      if (receipt.status === 0) {
        notifyError('Zap failed', 'Transaction reverted on chain')
        mixpanel.track('Zap on-chain transaction reverted', {
          RToken: rToken.address.toString().toLowerCase() ?? '',
          inputToken: inputToken.symbol,
        })
      } else {
        notifySuccess(
          'Zap successful',
          `Zapped ${inputToken.symbol} for ${rToken.symbol}`
        )
        mixpanel.track('Zap Success', {
          RToken: rToken.address.toString().toLowerCase() ?? '',
          inputToken: inputToken.symbol,
        })
      }

      set(zapTxHash, resp.hash)
      set(permitSignature, null)
      set(zapInputString, '')
      set(zapRedeemInputString, '')
      set(addTransactionAtom, [resp.hash, `Easy mint ${rToken.symbol}`])
      const data = await waitForTransaction({ hash: resp.hash })
      set(updateTransactionAtom, [
        resp.hash,
        'success',
        Number(data.blockNumber),
      ])
    } catch (e: any) {
      console.log(e)
      if (e.code === 'ACTION_REJECTED') {
        mixpanel.track('User Rejected Zap', {
          RToken: rToken.address.toString().toLowerCase() ?? '',
          inputToken: inputToken.symbol,
        })
        notifyError('Zap failed', 'User rejected')
      } else {
        mixpanel.track('Zap Execution Error', {
          RToken: rToken.address.toString().toLowerCase() ?? '',
          inputToken: inputToken.symbol,
          error: e,
        })
        notifyError('Zap failed', 'Unknown error ' + e.code)
      }
    } finally {
      resetTxAtoms(set)
    }
  }

  return atom(
    (get) => ({
      loadingLabel: get(buttonLoadingLabel),
      enabled: get(buttonEnabled),
      loading: get(previousTxAtom) == null && get(buttonIsLoading),
      label: get(buttonLabel),
      redeemButtonLabel: get(redeemButtonLabel),
    }),
    async (get, set, client: GetWalletClientResult) => {
      if (get(zapSender) == null) {
        set(isWalletModalVisibleAtom, true)
      }
      const flowState = get(state)
      const data = get(zapStateAtom)

      if (data == null) {
        return
      }

      const provider: Web3Provider = new Web3Provider(
        async (method, params) => {
          const out = await client!.request({ method, params } as any)
          return out
        }
      )

      data.signer = {
        ...provider,
        sendTransaction: async (tx: TransactionRequest) => {
          const hash = await client?.sendTransaction(tx)
          return await provider.getTransaction(hash!)
        },
      }
      if (flowState === 'tx_loading') {
        errors = 0
      } else if (flowState === 'tx_error') {
        if (errors < 5) {
          set(redoZapQuote, Math.random())
          errors += 1
        }
      } else if (flowState === 'approval') {
        await approve(get, set, data)
      } else if (flowState === 'send_tx') {
        // mixpanel.track('Confirmed Zap', {
        //   RToken: (data.rToken??(data as any).output).address.toString().toLowerCase() ?? '',
        //   inputToken: data.inputToken.symbol,
        // })

        await sendTx(get, set, data)
      } else if (flowState === 'sign_permit') {
        // await signAndSendTx(get, set, data)
      } else {
        console.log('Invalid state', flowState)
      }
    }
  )
}
export const ui = {
  zapSettingsOpen: atom(false),
  zapRedeemSettingsOpen: atom(false),
  zapWidgetEnabled: atom((get) => {
    const rtoken = get(rTokenAtom)
    const chainId = get(chainIdAtom)
    if (!get(zapEnabledAtom)) {
      return { state: 'disabled' as const, missingTokens: [] }
    }
    const available = get(zapAvailableAtom)

    if (available.state === 'loading') {
      return { state: 'loading' as const, missingTokens: [] }
    }
    if (available.state === 'hasError') {
      return { state: 'loading' as const, missingTokens: [] }
    }
    if (available.data == null) {
      return { state: 'loading' as const, missingTokens: [] }
    }
    if (available.data.canZap === true) {
      return { state: 'enabled' as const, missingTokens: [] }
    }
    mixpanel.track('Unsuported RToken', {
      chainId: chainId,
      RToken: [rtoken?.symbol, rtoken?.address].join(':'),
      missingCollterals: available.data.tokensMissings
        .map((t) => [t.symbol, t.address].join(':'))
        .join(', '),
    })
    return {
      state: 'not-supported' as const,
      missingTokens: available.data.tokensMissings,
    }
  }),
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
        const currentBalance = get(maxSelectedZapTokenBalance)
        if (currentBalance == null) {
          return
        }
        set(zapInputString, currentBalance.format())
      }
    ),
    maxRedeemAmount: atom(
      (get) => {
        const currentBalance = get(rTokenBalanceAtom)
        if (currentBalance == null) {
          return '0'
        }
        return currentBalance.balance
      },
      (get, set, _) => {
        const currentBalance = get(rTokenBalanceAtom)
        if (currentBalance == null) {
          return
        }
        set(zapRedeemInputString, currentBalance.balance)
      }
    ),
  },
  zapRedeemOutput: {
    textBox: atom((get) => {
      const zapPromise = get(redeemZapQuotePromise)
      const output = get(redeemZapOutputAmount)
      if (get(previousRedeemZapTransaction) != null) {
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
  },
  zapOutput: {
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
  zapTxState: zapState,
  zapButton: mkButton(
    previousZapTransaction,
    resolvedZapTransaction,
    zapState,
    zapQuote,
    zapQuoteInput,
    resolvedApprovalNeeded
  ),

  redeemZapTxState: zapState,
  redeemZapButton: mkButton(
    previousRedeemZapTransaction,
    resolvedRedeemZapTransaction as any,
    redeemZapState,
    redeemZapQuote,
    redeemZapQuoteInput as any,
    resolvedRedeemApprovalNeeded
  ),
}
