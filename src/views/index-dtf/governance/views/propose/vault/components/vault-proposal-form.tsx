import { Button } from '@/components/ui/button'
import { ArrowLeftIcon, ArrowUpRight, Coins, Trash } from 'lucide-react'

import TokenLogo from '@/components/token-logo'
import { Input } from '@/components/ui/input'
import { chainIdAtom } from '@/state/atoms'
import { shortenAddress } from '@/utils'
import { ROUTES } from '@/utils/constants'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { erc20Abi, isAddress } from 'viem'
import { useReadContracts } from 'wagmi'
import {
  isProposalValidAtom,
  newRewardTokenAtom,
  proposedRewardTokensAtom,
  tokenValidationStatusAtom,
} from '../atoms'

// Utility function to normalize addresses for consistent comparison
const normalizeAddress = (address: string): string =>
  isAddress(address) ? address.toLowerCase() : ''

// Utility function to update token validation status
const updateTokenValidationStatus = (
  address: string,
  isValid: boolean,
  setTokenValidationStatus: (
    updater: (prev: Record<string, boolean>) => Record<string, boolean>
  ) => void
): void => {
  if (!isAddress(address)) return

  const addressLower = normalizeAddress(address)
  setTokenValidationStatus((prev) => ({
    ...prev,
    [addressLower]: isValid,
  }))
}

// Utility function to clean up token validation status
const removeTokenValidationStatus = (
  address: string,
  setTokenValidationStatus: (
    updater: (prev: Record<string, boolean>) => Record<string, boolean>
  ) => void
): void => {
  if (!isAddress(address)) return

  const addressLower = normalizeAddress(address)
  setTokenValidationStatus((prev) => {
    const newStatus = { ...prev }
    delete newStatus[addressLower]
    return newStatus
  })
}

const NewRewardToken = ({
  address,
  id,
  onRemove,
  onChange,
  existingTokens,
}: {
  address: string
  id: string
  onRemove: (id: string) => void
  onChange: (id: string, value: string) => void
  existingTokens: { address: string; id: string }[]
}) => {
  const setTokenValidationStatus = useSetAtom(tokenValidationStatusAtom)
  const { data: tokenData, isError } = useReadContracts({
    contracts: isAddress(address)
      ? [
          {
            address: address as `0x${string}`,
            abi: erc20Abi,
            functionName: 'symbol',
          },
          {
            address: address as `0x${string}`,
            abi: erc20Abi,
            functionName: 'name',
          },
        ]
      : undefined,
    allowFailure: false,
    query: { enabled: isAddress(address) },
  })

  const isTokenAlreadyExists =
    isAddress(address) &&
    existingTokens?.some(
      (token) =>
        normalizeAddress(token.address) === normalizeAddress(address) &&
        token.id !== id // Only show error if another token has the same address
    )

  // Update validation status whenever we get new results from contract calls
  useEffect(() => {
    if (isAddress(address)) {
      const isValid =
        !isError &&
        Boolean(tokenData && tokenData[0] && tokenData[1]) &&
        !isTokenAlreadyExists

      updateTokenValidationStatus(address, isValid, setTokenValidationStatus)
    }
  }, [
    address,
    tokenData,
    isError,
    setTokenValidationStatus,
    isTokenAlreadyExists,
  ])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(id, e.target.value)
  }

  const handleRemove = () => {
    onRemove(id)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Token address"
          value={address}
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
      {isAddress(address) && (
        <div className="text-xs ml-2">
          {isTokenAlreadyExists ? (
            <span className="text-destructive">
              Token already exists in the list
            </span>
          ) : isError ? (
            <span className="text-destructive">Invalid token address</span>
          ) : !tokenData ? (
            <span className="text-muted-foreground">Loading token data...</span>
          ) : (
            <span className="text-primary">
              {tokenData[1]} (${tokenData[0]})
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// Existing token with details from the vault
const ExistingRewardToken = ({
  token,
  chainId,
  onRemove,
}: {
  token: { address: string; name: string; symbol: string }
  chainId: number
  onRemove: (address: string) => void
}) => {
  const handleRemove = () => onRemove(token.address)

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
  const chainId = useAtomValue(chainIdAtom)
  const [rewardTokens, setRewardTokens] = useAtom(proposedRewardTokensAtom)
  const [newRewardTokens, setNewRewardTokens] = useAtom(newRewardTokenAtom)
  const [tokenValidationStatus, setTokenValidationStatus] = useAtom(
    tokenValidationStatusAtom
  )
  const isProposalValid = useAtomValue(isProposalValidAtom)

  const existingTokens = useMemo(() => {
    // Create array of objects with address and id
    const existingAddresses =
      rewardTokens?.map((token) => ({
        address: token.address,
        id: token.address, // Use address as id for existing tokens
      })) || []

    const newTokensWithId = newRewardTokens
      .filter((token) => isAddress(token.address))
      .map((token) => ({
        address: token.address,
        id: token.id,
      }))

    return [...existingAddresses, ...newTokensWithId]
  }, [rewardTokens, newRewardTokens])

  const handleAddRewardToken = () => {
    const newId = `new-token-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    setNewRewardTokens([...newRewardTokens, { id: newId, address: '' }])
  }

  const handleRemoveRewardToken = (id: string) => {
    const tokenToRemove = newRewardTokens.find((token) => token.id === id)
    const updatedTokens = newRewardTokens.filter((token) => token.id !== id)
    setNewRewardTokens(updatedTokens)

    // Clean up validation status if the token had a valid address
    if (tokenToRemove && isAddress(tokenToRemove.address)) {
      removeTokenValidationStatus(
        tokenToRemove.address,
        setTokenValidationStatus
      )
    }
  }

  const handleChangeRewardToken = (id: string, value: string) => {
    const updatedTokens = newRewardTokens.map((token) =>
      token.id === id ? { ...token, address: value } : token
    )
    setNewRewardTokens(updatedTokens)
  }

  const handleRemoveExistingToken = (addressToRemove: string) => {
    if (!rewardTokens) return
    const updatedTokens = rewardTokens.filter(
      (token) => token.address !== addressToRemove
    )
    setRewardTokens(updatedTokens)

    // Clean up validation status
    removeTokenValidationStatus(addressToRemove, setTokenValidationStatus)
  }

  if (!rewardTokens)
    return <div className="mt-6 text-center">Loading reward tokens...</div>

  return (
    <div className="flex flex-col gap-2 mt-6">
      {rewardTokens.map((token) => (
        <ExistingRewardToken
          key={token.address}
          token={token}
          chainId={chainId}
          onRemove={handleRemoveExistingToken}
        />
      ))}

      {newRewardTokens.map((token) => (
        <NewRewardToken
          key={token.id}
          id={token.id}
          address={token.address}
          onRemove={handleRemoveRewardToken}
          onChange={handleChangeRewardToken}
          existingTokens={existingTokens}
        />
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

const VaultProposalForm = () => {
  const isProposalValid = useAtomValue(isProposalValidAtom)

  return (
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
            Enter the updated weights for the tokens in the basket. Remember,
            the weights represent the proportion of each token relative to the
            total USD value of basket at the time of the proposal. We will
            calculate the required auctions needed to adopt the new basket if
            the proposal passes governance.
          </p>
          <VaultRewardTokens />
        </div>
      </div>
    </div>
  )
}

export default VaultProposalForm
