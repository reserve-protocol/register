import { useWeb3React } from '@web3-react/core'
import { ERC20__factory } from 'abis/types'
import { TransferEventObject } from 'abis/types/ERC20'
import { ethers, utils } from 'ethers'
import { Atom, atom, Getter, useAtomValue, WritableAtom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import { getDefaultStore } from 'jotai/vanilla'
import { useEffect, useMemo } from 'react'

const ETH_ADDR = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
const erc20Interface = ERC20__factory.createInterface()
const transfer = erc20Interface.getEvent('Transfer')
const transferTopic = erc20Interface.getEventTopic('Transfer')

type ValueType = {
  wallet: string
  address: string
  value: ethers.BigNumber | null
}
type UpdateType =
  | ValueType
  | null
  | ((prev: ethers.BigNumber | null) => ethers.BigNumber | null)

const allAtoms = new Set<WritableAtom<ValueType, UpdateType, void>>()
const tokens = atomFamily(
  (params: { wallet: string; address: string }) => {
    const defaultValue: ValueType = {
      wallet: params.wallet,
      address: params.address,
      value: null,
    }
    const self = atom(defaultValue)
    const getSelf = (get: Getter) => get(self)
    const out = atom(
      (get) => getSelf(get),
      (get, set, update: UpdateType) => {
        const current = getSelf(get)

        const nextValue =
          typeof update === 'function'
            ? update(current.value)
            : update?.value ?? current.value

        if (
          nextValue != null &&
          current.value != null &&
          nextValue.eq(current.value)
        ) {
          return
        }
        current.value = nextValue
        set(self, { ...current })
      }
    )
    allAtoms.add(out)
    return out
  },
  (a, b) => a.wallet === b.wallet && a.address === b.address
)

type AtomType = ReturnType<typeof tokens>

class TokenBalancesStore {
  private tokensGoingInFilter: any
  private tokensGoingOutFilter: any
  private account: string = ''

  public provider?: ethers.providers.Provider
  private setters = new Map<any, (v: any) => void>()
  private initBlock: Promise<number> = Promise.resolve(0)
  constructor() {}

  private async handleEvent(log: ethers.providers.Log) {
    const initBlock = await this.initBlock
    if (log.blockNumber <= initBlock) {
      return
    }
    const event = erc20Interface.decodeEventLog(
      transfer,
      log.data,
      log.topics
    ) as unknown as TransferEventObject

    this.handleTransfer(
      log.address,
      event,
      event.to === this.account ? 'TO_USER' : 'FROM_USER'
    )
  }
  private initIfNeeded(token: string) {
    const a = tokens({ wallet: this.account, address: token })
    a.onMount = (setter) => {
      this.setters.set(a, setter)
      setter(getDefaultStore().get(a))
    }
    const store = getDefaultStore()
    const currentBalance = store.get(a)

    if (currentBalance.value == null) {
      this.initBalance(a)
    }

    return a
  }
  private async handleTransfer(
    tokenAddress: string,
    event: TransferEventObject,
    type: 'TO_USER' | 'FROM_USER'
  ) {
    const a = tokens({ wallet: this.account, address: tokenAddress })

    const currentValue = a.read(getDefaultStore().get)
    if (currentValue.value == null) {
      await this.initBalance(a)
      return
    }

    if (type === 'TO_USER') {
      this.updateAtom(a, (val) => (val == null ? null : val.add(event.value)))
    } else if (type === 'FROM_USER') {
      this.updateAtom(a, (val) => (val == null ? null : val.sub(event.value)))
    }
  }
  private updateAtom(
    atom: AtomType,
    update: (prev: ethers.BigNumber | null) => ethers.BigNumber | null
  ) {
    const store = getDefaultStore()
    atom.write(store.get, store.set, update)
    this.setters.get(atom)?.(store.get(atom))
  }

  private async initBalance(a: AtomType) {
    if (this.provider == null) {
      return
    }

    const store = getDefaultStore()
    const stored = store.get(a)
    if (stored.address === ETH_ADDR) {
      const balance = await this.provider.getBalance(stored.wallet)
      this.updateAtom(a, () => {
        return balance
      })
    } else {
      const balance = await ERC20__factory.connect(
        stored.address,
        this.provider
      ).balanceOf(this.account)
      this.updateAtom(a, () => {
        return balance
      })
    }
  }

  init(provider: ethers.providers.Provider, account: string) {
    if (this.account === account && this.provider === provider) {
      return
    }
    const store = getDefaultStore()
    for (const tokenAtom of allAtoms) {
      const currentlyStoredValue = store.get(tokenAtom)
      currentlyStoredValue.value = null
      tokenAtom.write(store.get, store.set, currentlyStoredValue)
      this.setters.get(tokenAtom)?.(currentlyStoredValue)
      if (currentlyStoredValue.wallet === this.account) {
        void this.initBalance(tokenAtom)
      }
    }
    this.initBlock = provider.getBlockNumber()
    const toTopic = '0x000000000000000000000000' + account.slice(2)
    this.account = account
    this.provider = provider

    this.tokensGoingInFilter = {
      topics: [transferTopic, null, toTopic],
    }
    this.tokensGoingOutFilter = {
      topics: [transferTopic, toTopic, null],
    }
    provider.on(this.tokensGoingInFilter, this.handleEvent.bind(this))
    provider.on(this.tokensGoingOutFilter, this.handleEvent.bind(this))
  }
  deInit() {
    const { provider } = this
    if (provider == null) {
      return
    }
    provider.off(this.tokensGoingInFilter, this.handleEvent.bind(this))
    provider.off(this.tokensGoingOutFilter, this.handleEvent.bind(this))
  }

  getBalanceAtom(token: string) {
    return this.initIfNeeded(token)
  }

  getGasBalanceAtom() {
    return this.initIfNeeded(ETH_ADDR)
  }
}
export const tokenBalancesStore = new TokenBalancesStore()

export const useTokenBalance = (token: string) => {
  const atom = useMemo(() => tokenBalancesStore.getBalanceAtom(token), [token])

  return useAtomValue(atom)
}

const atomZeroLen: Atom<ValueType[]> = atom([])

export const useTokenBalances = (tokens: string[]) => {
  const out = useMemo(() => {
    if (tokens.length === 0) {
      return atomZeroLen
    }

    return atom((get) =>
      tokens.map((t) =>
        get(tokenBalancesStore.getBalanceAtom(utils.getAddress(t)))
      )
    )
  }, [tokens.join()])

  return useAtomValue(out)
}
export const TokenBalancesUpdater = () => {
  const { account, provider } = useWeb3React()
  useEffect(() => {
    if (provider == null || account == null) {
      return
    }
    tokenBalancesStore.init(provider, account)
    return () => {
      tokenBalancesStore.deInit()
    }
  }, [account, provider, tokenBalancesStore])

  return null
}
