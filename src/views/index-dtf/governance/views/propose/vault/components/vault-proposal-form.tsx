import { Button } from '@/components/ui/button'
import { ArrowLeftIcon, ArrowUpRight, Coins, Trash } from 'lucide-react'
import TokenLogo from '@/components/token-logo'
import { Input } from '@/components/ui/input'
import useDebounce from '@/hooks/useDebounce'
import { chainIdAtom } from '@/state/atoms'
import { Token } from '@/types'
import { shortenAddress } from '@/utils'
import { ROUTES } from '@/utils/constants'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { useAtom, useAtomValue } from 'jotai'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { erc20Abi, isAddress } from 'viem'
import { useReadContracts } from 'wagmi'
import {
  addedRewardTokensAtom,
  currentRewardTokensAtom,
  removedRewardTokensAtom,
  rewardTokenAddressesAtom,
} from '../atoms'

// TODO: Should use atom family for this one
const TokenValidationMessage = ({
  value,
  isTokenAlreadyExists,
  isError,
  tokenData,
}: {
  value: string
  isTokenAlreadyExists: boolean
  isError: boolean
  tokenData: [string, string] | undefined
}) => {
  if (!isAddress(value)) return null

  if (isTokenAlreadyExists) {
    return (
      <span className="text-destructive">Token already exists in the list</span>
    )
  }

  if (isError) {
    return <span className="text-destructive">Invalid token address</span>
  }

  if (!tokenData) {
    return <span className="text-muted-foreground">Loading token data...</span>
  }

  return (
    <span className="text-primary">
      {tokenData[1] ? `${tokenData[1]} (${tokenData[0]})` : 'Loading...'}
    </span>
  )
}

const NewRewardToken = ({ id }: { id: string }) => {
  const [value, setValue] = useState('')
  const debouncedValue = useDebounce(value, 500)
  const [addedRewardTokens, setAddedRewardTokens] = useAtom(
    addedRewardTokensAtom
  )
  const currentRewardTokenAddresses = useAtomValue(rewardTokenAddressesAtom)
  const { data: tokenData, isError } = useReadContracts({
    contracts: isAddress(debouncedValue)
      ? [
          {
            address: debouncedValue as `0x${string}`,
            abi: erc20Abi,
            functionName: 'symbol',
          },
          {
            address: debouncedValue as `0x${string}`,
            abi: erc20Abi,
            functionName: 'name',
          },
        ]
      : undefined,
    allowFailure: false,
    query: { enabled: isAddress(debouncedValue) },
  })

  const isTokenAlreadyExists = useMemo(() => {
    if (!value) return false
    const lowerCaseValue = value.toLowerCase()
    return (
      currentRewardTokenAddresses.filter(
        (address) => address === lowerCaseValue
      ).length > 1
    )
  }, [currentRewardTokenAddresses, value])

  useEffect(() => {
    setAddedRewardTokens((prev) => ({
      ...prev,
      [id]: tokenData?.[0]
        ? {
            address: value as `0x${string}`,
            symbol: tokenData[0],
            name: tokenData[1],
            decimals: 18,
          }
        : undefined,
    }))
  }, [tokenData, setAddedRewardTokens])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
  }

  const handleRemove = () => {
    const updatedTokens = { ...addedRewardTokens }
    delete updatedTokens[id]
    setAddedRewardTokens(updatedTokens)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Token address"
          value={value}
          onChange={handleChange}
          className="flex-1"
        />
        <Button
          variant="outline"
          size="icon-rounded"
          onClick={handleRemove}
          aria-label="Remove token"
          tabIndex={0}
        >
          <Trash size={16} />
        </Button>
      </div>
      {isAddress(value) && (
        <div className="text-xs ml-2">
          <TokenValidationMessage
            value={value}
            isTokenAlreadyExists={isTokenAlreadyExists}
            isError={isError}
            tokenData={tokenData}
          />
        </div>
      )}
    </div>
  )
}

// Existing token with details from the vault
const ExistingRewardToken = ({ token }: { token: Token }) => {
  const chainId = useAtomValue(chainIdAtom)
  const [removedRewardTokens, setRemovedRewardTokens] = useAtom(
    removedRewardTokensAtom
  )

  const handleRemove = () =>
    setRemovedRewardTokens([...removedRewardTokens, token])

  return (
    <div className="flex items-center gap-2">
      <TokenLogo size="lg" chain={chainId} address={token.address} />
      <div className="flex flex-col mr-auto">
        <h4 className="text-sm font-medium">
          {token.name} (${token.symbol})
        </h4>
        <a
          className="text-xs text-legend flex items-center gap-1"
          target="_blank"
          href={getExplorerLink(token.address, chainId, ExplorerDataType.TOKEN)}
          tabIndex={0}
          aria-label={`View ${token.symbol} on block explorer`}
        >
          {shortenAddress(token.address)}
          <ArrowUpRight size={12} />
        </a>
      </div>
      <Button
        variant="outline"
        size="icon-rounded"
        onClick={handleRemove}
        aria-label={`Remove ${token.symbol}`}
        tabIndex={0}
      >
        <Trash size={16} />
      </Button>
    </div>
  )
}

const VaultRewardTokens = () => {
  const currentRewardTokens = useAtomValue(currentRewardTokensAtom)
  const [addedRewardTokens, setAddedRewardTokens] = useAtom(
    addedRewardTokensAtom
  )

  const handleAddRewardToken = () => {
    const newId = `new-token-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    setAddedRewardTokens({
      ...addedRewardTokens,
      [newId]: undefined,
    })
  }

  if (!currentRewardTokens)
    return <div className="mt-6 text-center">Loading reward tokens...</div>

  return (
    <div className="flex flex-col gap-2 mt-6">
      {currentRewardTokens.map((token) => (
        <ExistingRewardToken key={token.address} token={token} />
      ))}

      {Object.keys(addedRewardTokens).map((id) => (
        <NewRewardToken key={id} id={id} />
      ))}

      <Button
        variant="outline-primary"
        className="mt-2"
        onClick={handleAddRewardToken}
        tabIndex={0}
        aria-label="Add new reward token"
      >
        Add reward token
      </Button>
    </div>
  )
}

const VaultProposalForm = () => (
  <div className="w-full bg-secondary rounded-4xl pb-0.5 h-fit">
    <div className="p-4 pb-3 flex items-center gap-2">
      <Link
        to={`../${ROUTES.GOVERNANCE}/${ROUTES.GOVERNANCE_PROPOSE}`}
        className="sm:ml-3"
      >
        <Button variant="outline" size="icon-rounded">
          <ArrowLeftIcon size={24} strokeWidth={1.5} />
        </Button>
      </Link>
      <h1 className="font-bold text-xl">Vault change proposal</h1>
    </div>
    <div className="rounded-3xl bg-card m-1 border-none">
      <div className="p-4 sm:p-6 pb-3">
        <div className="rounded-full w-fit flex-shrink-0 p-2 bg-primary/10 text-primary">
          <Coins size={16} />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-primary mt-6 mb-2">
          Reward whitelist
        </h2>
        <p>
          Enter the updated weights for the tokens in the basket. Remember, the
          weights represent the proportion of each token relative to the total
          USD value of basket at the time of the proposal. We will calculate the
          required auctions needed to adopt the new basket if the proposal
          passes governance.
        </p>
        <VaultRewardTokens />
      </div>
    </div>
  </div>
)

export default VaultProposalForm
