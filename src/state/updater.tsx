import { getAddress } from '@ethersproject/address'
import { formatEther } from '@ethersproject/units'
import { useWeb3React } from '@web3-react/core'
import { gql } from 'graphql-request'
import useBlockNumber from 'hooks/useBlockNumber'
import { useFacadeContract } from 'hooks/useContract'
import useQuery from 'hooks/useQuery'
import useTokensAllowance from 'hooks/useTokensAllowance'
import useTokensBalance from 'hooks/useTokensBalance'
import { useSetAtom } from 'jotai'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { useCallback, useEffect } from 'react'
import {
  allowanceAtom,
  balancesAtom,
  ethPriceAtom,
  gasPriceAtom,
  pendingIssuancesAtom,
  pendingRSRAtom,
  reserveTokensAtom,
  rsrPriceAtom,
  rTokenAtom,
  rTokenPriceAtom,
  selectedAccountAtom,
  walletAtom,
} from 'state/atoms'
import useSWR from 'swr'
import { ReserveToken, StringMap } from 'types'
import { RSV_MANAGER_ADDRESS } from 'utils/addresses'
import { CHAIN_ID } from 'utils/chains'
import { COINGECKO_API, RSR } from 'utils/constants'

const getTokensQuery = gql`
  {
    mains {
      id
      staked
      facade
      basketHandler
      stToken {
        address
        name
        symbol
        decimals
      }
      token {
        address
        name
        symbol
        decimals
        transfersCount
        holdersCount
        supply {
          total
        }
      }
      basket {
        id
        collaterals {
          id
          index
          token {
            address
            name
            symbol
            decimals
          }
        }
      }
    }
  }
`

// TODO: Proper typing
const formatTokens = (mains: any[]): { [x: string]: ReserveToken } =>
  mains.reduce((acc: any, data: any) => {
    try {
      const address = getAddress(data.id.toLowerCase())
      const isRSV = address === RSV_MANAGER_ADDRESS[CHAIN_ID]
      let basket = { id: '', collaterals: [] }
      let insurance = null

      if (!isRSV) {
        insurance = {
          staked: data.staked,
          token: {
            ...data.stToken,
            address: getAddress(data.stToken.address.toLowerCase()),
          },
        }
      }

      if (data.basket) {
        basket = {
          ...data.basket,
          collaterals: data.basket.collaterals.map((collateral: any) => ({
            ...collateral,
            token: {
              ...collateral.token,
              address: getAddress(collateral.token.address.toLowerCase()),
            },
          })),
        }
      }

      acc[address] = {
        id: address,
        token: {
          ...data.token,
          address: getAddress(data.token.address.toLowerCase()),
          supply: data.token.supply?.total || 0,
        },
        basket,
        insurance,
        facade: isRSV ? null : getAddress(data.facade.toLowerCase()),
        basketHandler: isRSV
          ? null
          : getAddress(data.basketHandler.toLowerCase()),
        isRSV,
      } as ReserveToken
    } catch (e) {
      console.error('Fail to format token', e)
    }

    return acc
  }, {})

// Gets ReserveToken related token addresses and decimals
const getTokens = (reserveToken: ReserveToken): [string, number][] => {
  const addresses: [string, number][] = [
    [reserveToken.token.address, reserveToken.token.decimals],
    [RSR.address, RSR.decimals],
    ...reserveToken.basket.collaterals.map(({ token }): [string, number] => [
      token.address,
      token.decimals,
    ]),
  ]

  if (reserveToken.insurance?.token) {
    addresses.push([
      reserveToken.insurance.token.address,
      reserveToken.insurance.token.decimals,
    ])
  }

  return addresses
}

const getTokenAllowances = (reserveToken: ReserveToken): [string, string][] => {
  const tokens: [string, string][] = [
    ...reserveToken.basket.collaterals.map(({ token }): [string, string] => [
      token.address,
      reserveToken.isRSV ? reserveToken.id : reserveToken.token.address,
    ]),
  ]

  if (!reserveToken.isRSV) {
    tokens.push([RSR.address, reserveToken.insurance?.token.address ?? ''])
  } else {
    tokens.push([reserveToken.token.address, reserveToken.id])
  }

  return tokens
}

/**
 * ReserveTokensUpdater
 *
 * Fetchs the list of RTokens from theGraph
 * Sets the default token
 */
const ReserveTokensUpdater = () => {
  const setTokens = useUpdateAtom(reserveTokensAtom)
  const { data, error } = useQuery(getTokensQuery)

  useEffect(() => {
    // TODO: Handle error scenario
    if (data?.mains) {
      const tokens = formatTokens(data.mains)
      setTokens(tokens)
    }
  }, [data])

  return null
}

/**
 * Updates the balances of the current ReserveToken related tokens
 */
const TokensBalanceUpdater = () => {
  const account = useAtomValue(walletAtom)
  const reserveToken = useAtomValue(rTokenAtom)
  const updateBalances = useSetAtom(balancesAtom)
  const balances = useTokensBalance(
    reserveToken && account ? getTokens(reserveToken) : [],
    account?.address ?? ''
  )

  useEffect(() => {
    updateBalances(balances)
  }, [JSON.stringify(balances)])

  return null
}

/**
 * Update allowances for:
 * Collaterals (n) -> RToken
 * RSR -> stRSR
 * If RSV: RSV -> RSVManager (redeem)
 */
const TokensAllowanceUpdater = () => {
  const account = useAtomValue(walletAtom)
  const reserveToken = useAtomValue(rTokenAtom)
  const updateAllowances = useSetAtom(allowanceAtom)
  const allowances = useTokensAllowance(
    reserveToken && account ? getTokenAllowances(reserveToken) : [],
    account?.address ?? ''
  )

  useEffect(() => {
    updateAllowances(allowances)
  }, [JSON.stringify(allowances)])

  return null
}

const fetcher = async (url: string): Promise<StringMap> => {
  const data: Response = await fetch(url).then((res) => res.json())

  return data
}

/**
 * Fetch pending issuances
 */
const PendingBalancesUpdater = () => {
  const account = useAtomValue(selectedAccountAtom)
  const rToken = useAtomValue(rTokenAtom)
  const setPendingIssuances = useUpdateAtom(pendingIssuancesAtom)
  const setPendingRSR = useUpdateAtom(pendingRSRAtom)
  const facadeContract = useFacadeContract(rToken?.facade)
  const blockNumber = useBlockNumber()

  // TODO: Use multicall for this
  const fetchPending = useCallback(async () => {
    try {
      if (facadeContract && account) {
        const pendingIssuances = await facadeContract.pendingIssuances(account)
        const pending = pendingIssuances.map((issuance) => ({
          availableAt: parseInt(formatEther(issuance.availableAt)),
          index: issuance.index,
          amount: parseFloat(formatEther(issuance.amount)),
        }))
        setPendingIssuances(pending)

        const pendingRSR = await facadeContract.pendingUnstakings(account)
        const pendingRSRSummary = pendingRSR.map((item) => ({
          availableAt: item.availableAt.toNumber(),
          index: item.index,
          amount: parseFloat(formatEther(item.amount)),
        }))
        setPendingRSR(pendingRSRSummary)
      }
    } catch (e) {
      // TODO: handle error case
      console.log('error fetching pending', e)
    }
  }, [account, facadeContract])

  useEffect(() => {
    if (account && facadeContract) {
      fetchPending()
    }
  }, [account, facadeContract, blockNumber])

  return null
}

/**
 * Fetch prices for:
 * ETH    -> USD
 * RSR    -> USD
 * RToken -> USD
 * GasPrice
 */
const PricesUpdater = () => {
  const reserveToken = useAtomValue(rTokenAtom)
  const { provider } = useWeb3React()
  const { data } = useSWR(
    `${COINGECKO_API}/simple/price?vs_currencies=usd&ids=ethereum,reserve-rights-token`,
    fetcher
  )
  // this may fetch all top rTokens
  const { data: rTokenPrice } = useSWR(
    reserveToken &&
      `${COINGECKO_API}/simple/token_price/ethereum?contract_addresses=${reserveToken.token.address}&vs_currencies=usd`,
    fetcher
  )
  const setRSRPrice = useUpdateAtom(rsrPriceAtom)
  const setEthPrice = useUpdateAtom(ethPriceAtom)
  const setGasPrice = useUpdateAtom(gasPriceAtom)
  const setRTokenPrice = useUpdateAtom(rTokenPriceAtom)
  const blockNumber = useBlockNumber()

  const fetchGasPrice = useCallback(async () => {
    const feeData = await provider!.getFeeData()
    setGasPrice(Number(feeData.gasPrice?.toString()) || 0)
  }, [provider])

  useEffect(() => {
    if (provider && blockNumber) {
      fetchGasPrice()
    }
  }, [blockNumber, provider])

  useEffect(() => {
    if (data) {
      setRSRPrice(data['reserve-rights-token'] || 1)
      setEthPrice(data?.ethereum?.usd ?? 1)
    }
  }, [data])

  useEffect(() => {
    if (rTokenPrice && reserveToken) {
      setRTokenPrice(rTokenPrice[reserveToken.token.address])
    }
  }, [rTokenPrice])

  return null
}

/**
 * Updater
 */
const Updater = () => (
  <>
    <ReserveTokensUpdater />
    <PendingBalancesUpdater />
    <TokensBalanceUpdater />
    <TokensAllowanceUpdater />
    <PricesUpdater />
  </>
)

export default Updater
