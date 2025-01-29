import useIndexDTFSubgraph from '@/hooks/useIndexDTFSugbraph'
import { walletAtom } from '@/state/atoms'
import { gql } from 'graphql-request'
import { useAtomValue, useSetAtom } from 'jotai'
import {
  accountIndexTokensAtom,
  accountStakingTokensAtom,
  accountUnclaimedLocksAtom,
} from '../atoms'
import { useEffect } from 'react'
import { getAddress, stringToHex } from 'viem'

type TokenType = 'DTF' | 'VOTE' | 'ASSET'

interface Token {
  id: string
  name: string
  symbol: string
  decimals: number
}

interface Delegate {
  address: string
}

interface AccountBalance {
  token: Token & { type: TokenType }
  amount: string
  delegate: Delegate | null
}

interface AccountLock {
  lockId: string
  amount: string
  unlockTime: string
  token: {
    token: Token
    underlying: Token
  }
}

interface AccountDataResponse {
  account: {
    balances: AccountBalance[]
    locks: AccountLock[]
  }
}

interface UnderlyingTokensResponse {
  stakingTokens: {
    id: string
    underlying: Token
  }[]
}

const accountDataQuery = gql`
  query getAccountData($id: String!) {
    account(id: $id) {
      balances {
        token {
          id
          name
          symbol
          decimals
          type
        }
        amount
        delegate {
          address
        }
      }
      locks(where: { claimedBlock: null, cancelledBlock: null }) {
        lockId
        token {
          token {
            id
            name
            symbol
            decimals
          }
          underlying {
            id
            name
            symbol
            decimals
          }
        }
        amount
        unlockTime
      }
    }
  }
`

const underlyingTokenQuery = gql`
  query getUnderlyingTokens($tokenIds: [String]!) {
    stakingTokens(where: { id_in: $tokenIds }) {
      id
      underlying {
        id
        name
        symbol
        decimals
      }
    }
  }
`

const IndexDTFUpdater = () => {
  const account = useAtomValue(walletAtom)
  const setIndexTokens = useSetAtom(accountIndexTokensAtom)
  const setStakingTokens = useSetAtom(accountStakingTokensAtom)
  const setUnclaimedLocks = useSetAtom(accountUnclaimedLocksAtom)

  const { data: accountDataResponse } = useIndexDTFSubgraph(
    account ? accountDataQuery : null,
    {
      id: account?.toLowerCase(),
    }
  )

  const stTokens = (
    accountDataResponse as AccountDataResponse
  )?.account.balances
    .filter(({ token }) => token.type === 'VOTE')
    .map(({ token }) => token.id)

  const { data: underlyingTokensResponse } = useIndexDTFSubgraph(
    stTokens?.length ? underlyingTokenQuery : null,
    {
      tokenIds: stTokens,
    }
  )

  useEffect(() => {
    if (!accountDataResponse) return
    const accountData = accountDataResponse as AccountDataResponse
    const underlyingTokensData = underlyingTokensResponse as
      | UnderlyingTokensResponse
      | undefined

    const underlyingTokensMap: Record<string, Token> = (
      underlyingTokensData?.stakingTokens || []
    ).reduce(
      (acc, { id, underlying }) => {
        acc[id.toLowerCase()] = underlying
        return acc
      },
      {} as Record<string, Token>
    )

    const balances = accountData.account.balances.map(
      ({ token, amount, delegate }) => ({
        address: getAddress(token.id),
        symbol: token.symbol,
        name: token.name,
        decimals: token.decimals,
        amount: BigInt(amount),
        delegate: delegate?.address ? getAddress(delegate.address) : null,
        type: token.type,
      })
    )

    const indexTokens = balances.filter(({ type }) => type === 'DTF')
    const stakingTokens = balances.filter(({ type }) => type === 'VOTE')

    if (stakingTokens.length !== Object.keys(underlyingTokensMap).length) {
      // Prevent the app from crashing until the underlying tokens are fetched
      return
    }

    const stakingTokensWithUnderlying = stakingTokens.map((stToken) => {
      const underlying = underlyingTokensMap[stToken.address.toLowerCase()]!
      return {
        ...stToken,
        underlying: {
          address: getAddress(underlying.id),
          symbol: underlying.symbol,
          name: underlying.name,
          decimals: underlying.decimals,
        },
      }
    })

    const unclaimedLocks = accountData.account.locks.map(
      ({ lockId, token: { token, underlying }, amount, unlockTime }) => ({
        lockId: stringToHex(lockId, { size: 32 }),
        amount: BigInt(amount),
        unlockTime: Number(unlockTime),
        token: {
          address: getAddress(token.id),
          symbol: token.symbol,
          name: token.name,
          decimals: token.decimals,
        },
        underlying: {
          address: getAddress(underlying.id),
          symbol: underlying.symbol,
          name: underlying.name,
          decimals: underlying.decimals,
        },
      })
    )

    setIndexTokens(indexTokens)
    setStakingTokens(stakingTokensWithUnderlying)
    setUnclaimedLocks(unclaimedLocks)
  }, [accountDataResponse, underlyingTokensResponse])

  return null
}

export default IndexDTFUpdater
