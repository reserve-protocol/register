import TokenLogo from '@/components/token-logo'
import TokenSelectorDrawer from '@/components/token-selector-drawer'
import { Button } from '@/components/ui/button'
import { DrawerTrigger } from '@/components/ui/drawer'
import { Switch } from '@/components/ui/switch'
import useTokenList from '@/hooks/use-token-list'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFBasketAtom } from '@/state/dtf/atoms'
import { Token } from '@/types'
import { shortenAddress } from '@/utils'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import BasicInput from '@/views/index-dtf/deploy/components/basic-input'
import { Trans, useLingui } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import {
  ArrowUpRight,
  ListChecks,
  PlusIcon,
  ShieldCheck,
  XIcon,
} from 'lucide-react'
import { useMemo } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { erc20Abi, getAddress, isAddress, type Address } from 'viem'
import { useReadContracts } from 'wagmi'

const FIELD = 'tradeAllowlistTokens'

const toKey = (address: string) => address.toLowerCase()
const isTokenAddress = (value: string) =>
  !!value && isAddress(value, { strict: false })

type TokenMeta = Pick<Token, 'symbol' | 'name' | 'logoURI'>

// Names come from the zapper token list and the basket; anything else is read on-chain.
const useTokenMeta = (addresses: string[]) => {
  const chainId = useAtomValue(chainIdAtom)
  const basket = useAtomValue(indexDTFBasketAtom)
  const { data: tokenList } = useTokenList(chainId)

  const known = useMemo(() => {
    const map = new Map<string, TokenMeta>()
    for (const token of [...(tokenList ?? []), ...(basket ?? [])]) {
      map.set(toKey(token.address), token)
    }
    return map
  }, [tokenList, basket])

  const unknown = addresses.filter((address) => !known.has(toKey(address)))
  const { data: reads } = useReadContracts({
    contracts: unknown.flatMap((address) => [
      { address: address as Address, abi: erc20Abi, functionName: 'symbol', chainId },
      { address: address as Address, abi: erc20Abi, functionName: 'name', chainId },
    ]),
    query: { enabled: unknown.length > 0 },
  })

  return (address: string): TokenMeta | undefined => {
    const meta = known.get(toKey(address))
    if (meta) return meta
    const index = unknown.findIndex((item) => toKey(item) === toKey(address))
    const symbol = reads?.[index * 2]
    const name = reads?.[index * 2 + 1]
    if (symbol?.status !== 'success') return undefined
    return {
      symbol: symbol.result as string,
      name: name?.status === 'success' ? (name.result as string) : '',
    }
  }
}

const RemoveButton = ({ index }: { index: number }) => {
  const { t } = useLingui()
  const { getValues, setValue } = useFormContext()

  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full shrink-0"
      aria-label={t`Remove token`}
      data-testid="settings-allowlist-remove"
      onClick={() =>
        setValue(
          FIELD,
          (getValues(FIELD) as string[]).filter((_, i) => i !== index),
          { shouldDirty: true, shouldValidate: true }
        )
      }
    >
      <XIcon size={18} strokeWidth={1.5} />
    </Button>
  )
}

const TokenRow = ({
  address,
  meta,
  index,
}: {
  address: string
  meta?: TokenMeta
  index: number
}) => {
  const chainId = useAtomValue(chainIdAtom)

  return (
    <div
      data-testid="settings-allowlist-row"
      className="flex items-center gap-3 rounded-xl bg-card px-3 py-2"
    >
      <TokenLogo
        src={meta?.logoURI}
        symbol={meta?.symbol}
        address={address}
        chain={chainId}
        size="lg"
      />
      <div className="flex flex-col min-w-0 mr-auto">
        <span className="font-bold truncate">
          {meta?.symbol ?? <Trans>Unknown token</Trans>}
        </span>
        <span className="flex gap-1 text-sm text-muted-foreground min-w-0">
          {!!meta?.name && <span className="truncate">{meta.name} ·</span>}
          <span className="shrink-0">{shortenAddress(address)}</span>
        </span>
      </div>
      <a
        href={getExplorerLink(address, chainId, ExplorerDataType.TOKEN)}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-full text-muted-foreground hover:bg-muted-foreground/10"
      >
        <ArrowUpRight size={18} strokeWidth={1.5} />
      </a>
      <RemoveButton index={index} />
    </div>
  )
}

const AddressRow = ({ index }: { index: number }) => {
  const { t } = useLingui()

  return (
    <div className="flex items-center gap-2">
      <BasicInput
        className="w-full"
        fieldName={`${FIELD}[${index}]`}
        label={t`Token address`}
        placeholder="0x..."
      />
      <RemoveButton index={index} />
    </div>
  )
}

const AllowlistActions = ({
  values,
  meta,
}: {
  values: string[]
  meta: (address: string) => TokenMeta | undefined
}) => {
  const { setValue } = useFormContext()
  const basket = useAtomValue(indexDTFBasketAtom)

  const listed = values.filter(isTokenAddress)
  const pending = values.filter((value) => !isTokenAddress(value))
  const listedKeys = new Set(listed.map(toKey))
  const missingBasket = (basket ?? []).filter(
    (token) => !listedKeys.has(toKey(token.address))
  )

  const update = (next: string[]) =>
    setValue(FIELD, next, { shouldDirty: true, shouldValidate: true })

  // The drawer returns the whole selection, so a token unchecked there leaves the list.
  const onSelect = (tokens: Token[]) => {
    const selected = new Set(tokens.map((token) => toKey(token.address)))
    const kept = listed.filter((address) => selected.has(toKey(address)))
    const keptKeys = new Set(kept.map(toKey))
    const added = tokens
      .map((token) => getAddress(token.address))
      .filter((address) => !keptKeys.has(toKey(address)))
    update([...kept, ...added, ...pending])
  }

  // The drawer re-seeds its selection whenever this prop changes identity.
  const listedKey = listed
    .map((address) => `${toKey(address)}:${meta(address)?.symbol ?? ''}`)
    .join(',')
  const selected: Token[] = useMemo(
    () =>
      listed.map((address) => ({
        address: getAddress(address),
        symbol: meta(address)?.symbol ?? shortenAddress(address),
        name: meta(address)?.name ?? '',
        logoURI: meta(address)?.logoURI,
        decimals: 18,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [listedKey]
  )

  return (
    <div className="flex flex-wrap gap-2">
      <TokenSelectorDrawer selectedTokens={selected} onAdd={onSelect}>
        <DrawerTrigger asChild>
          <Button
            variant="outline"
            className="gap-2 rounded-xl"
            data-testid="settings-allowlist-add-tokens"
          >
            <PlusIcon size={16} />
            <Trans>Add tokens</Trans>
          </Button>
        </DrawerTrigger>
      </TokenSelectorDrawer>
      {missingBasket.length > 0 && (
        <Button
          variant="outline"
          className="gap-2 rounded-xl"
          data-testid="settings-allowlist-add-basket"
          onClick={() =>
            update([
              ...listed,
              ...missingBasket.map((token) => getAddress(token.address)),
              ...pending,
            ])
          }
        >
          <PlusIcon size={16} />
          <Trans>Add basket tokens ({missingBasket.length})</Trans>
        </Button>
      )}
      <Button
        variant="ghost"
        className="rounded-xl"
        data-testid="settings-allowlist-add-address"
        onClick={() => update([...values, ''])}
      >
        <Trans>Add by address</Trans>
      </Button>
    </div>
  )
}

const AllowlistTokens = () => {
  const { watch } = useFormContext()
  const values = ((watch(FIELD) as string[] | undefined) ?? []).map(
    (value) => value ?? ''
  )
  const meta = useTokenMeta(values.filter(isTokenAddress))

  return (
    <div className="flex flex-col gap-2">
      {values.length === 0 && (
        <div
          data-testid="settings-allowlist-empty"
          className="rounded-xl bg-card px-4 py-3 text-sm text-muted-foreground"
        >
          <Trans>
            No tokens allowlisted. Add the tokens a rebalance may trade.
          </Trans>
        </div>
      )}
      {values.map((value, index) =>
        isTokenAddress(value) ? (
          <TokenRow
            key={`${toKey(value)}-${index}`}
            address={value}
            meta={meta(value)}
            index={index}
          />
        ) : (
          <AddressRow key={`pending-${index}`} index={index} />
        )
      )}
      <AllowlistActions values={values} meta={meta} />
    </div>
  )
}

const ProposeTradeAllowlist = () => {
  const { control } = useFormContext()

  return (
    <div className="px-2 mb-2 flex flex-col gap-2">
      <div className="px-4 pb-4 text-base">
        <Trans>
          When enforced, a rebalance can only include allowlisted tokens.
          Proposals with other tokens revert when executed.
        </Trans>
      </div>
      <div className="w-full rounded-xl flex items-center gap-2 p-4 bg-muted/70">
        <div className="p-2 border border-foreground rounded-full">
          <ShieldCheck size={14} strokeWidth={1.5} />
        </div>
        <div className="flex flex-col mr-auto">
          <div className="text-base font-bold">
            <Trans>Enforce trade allowlist</Trans>
          </div>
          <div className="text-sm text-muted-foreground">
            <Trans>Restrict rebalances to the tokens below.</Trans>
          </div>
        </div>
        <Controller
          name="tradeAllowlistEnabled"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Switch
              data-testid="settings-trade-allowlist-enabled"
              checked={!!value}
              onCheckedChange={onChange}
            />
          )}
        />
      </div>
      <div className="w-full rounded-xl flex flex-col gap-3 p-4 bg-muted/70">
        <div className="flex items-center gap-2">
          <div className="p-2 border border-foreground rounded-full">
            <ListChecks size={14} strokeWidth={1.5} />
          </div>
          <div className="flex flex-col">
            <div className="text-base font-bold">
              <Trans>Allowlisted tokens</Trans>
            </div>
            <div className="text-sm text-muted-foreground">
              <Trans>Token contracts a rebalance may trade.</Trans>
            </div>
          </div>
        </div>
        <AllowlistTokens />
      </div>
    </div>
  )
}

export default ProposeTradeAllowlist
