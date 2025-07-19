import { Button } from '@/components/ui/button'
import { ArrowUpRight, Trash } from 'lucide-react'
import TokenLogo from '@/components/token-logo'
import { Input } from '@/components/ui/input'
import useDebounce from '@/hooks/useDebounce'
import { chainIdAtom } from '@/state/atoms'
import { Token } from '@/types'
import { shortenAddress } from '@/utils'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { useAtom, useAtomValue } from 'jotai'
import { useEffect, useMemo, useState } from 'react'
import { erc20Abi, isAddress } from 'viem'
import { useReadContracts } from 'wagmi'
import {
  addedRewardTokensAtom,
  currentRewardTokensAtom,
  removedRewardTokensAtom,
  rewardTokenAddressesAtom,
} from '../../atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'

// Token validation message component
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

// New reward token input component
const NewRewardToken = ({ id }: { id: string }) => {
  const chainId = useAtomValue(chainIdAtom)
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
            chainId,
          },
          {
            address: debouncedValue as `0x${string}`,
            abi: erc20Abi,
            functionName: 'name',
            chainId,
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
  }, [tokenData, setAddedRewardTokens, value, id])

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

// Description component
const Description = () => {
  const vlToken = useAtomValue(indexDTFAtom)?.stToken?.token.symbol ?? 'vlToken'
  
  return (
    <div className="px-6 pb-6 text-base">
      Enter the contract address of the token(s) the{' '}
      <span className="font-semibold">{vlToken} DAO</span> will accept as
      revenue. A token must be added to this list before it can be
      distributed to and claimed by vote-lockers.
    </div>
  )
}

// Main revenue tokens component
const ProposeRevenueTokens = () => {
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
    return <div className="px-6 text-center">Loading reward tokens...</div>

  return (
    <>
      <Description />
      <div className="flex flex-col gap-2 px-6 pb-6">
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
    </>
  )
}

export default ProposeRevenueTokens