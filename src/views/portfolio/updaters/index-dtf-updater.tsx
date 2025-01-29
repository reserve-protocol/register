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

const accountDataQuery = gql`
  query getStakingToken($id: String!) {
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

const IndexDTFUpdater = () => {
  const account = useAtomValue(walletAtom)
  const setIndexTokens = useSetAtom(accountIndexTokensAtom)
  const setStakingTokens = useSetAtom(accountStakingTokensAtom)
  const setUnclaimedLocks = useSetAtom(accountUnclaimedLocksAtom)

  const { data } = useIndexDTFSubgraph(account ? accountDataQuery : null, {
    id: account?.toLowerCase(),
  })

  useEffect(() => {
    if (!data) return
    const accountData = data as AccountDataResponse

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
    setStakingTokens(stakingTokens)
    setUnclaimedLocks(unclaimedLocks)
  }, [data])

  return null
}

export default IndexDTFUpdater
