import { Web3Provider } from '@ethersproject/providers'
import { formatEther } from '@ethersproject/units'
import { useWeb3React } from '@web3-react/core'
import { StRSR, StRSRInterface } from 'abis'
import { Facade } from 'abis/types'
import useBlockNumber from 'hooks/useBlockNumber'
import { useContractCall } from 'hooks/useCall'
import { useContract, useFacadeContract } from 'hooks/useContract'
import useRToken from 'hooks/useRToken'
import useRTokenPrice from 'hooks/useRTokenPrice'
import useTokensAllowance from 'hooks/useTokensAllowance'
import useTokensBalance from 'hooks/useTokensBalance'
import { useSetAtom } from 'jotai'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { useCallback, useEffect } from 'react'
import {
  allowanceAtom,
  balancesAtom,
  chainIdAtom,
  ethPriceAtom,
  gasPriceAtom,
  pendingIssuancesAtom,
  pendingRSRAtom,
  rsrExchangeRateAtom,
  rsrPriceAtom,
  rTokenAtom,
  rTokenPriceAtom,
  walletAtom,
} from 'state/atoms'
import useSWR from 'swr'
import { ReserveToken, StringMap } from 'types'
import { COINGECKO_API, RSR } from 'utils/constants'
import { RSV_MANAGER } from 'utils/rsv'
import AccountUpdater from './AccountUpdater'
import RSVUpdater from './RSVUpdater'
import TokenUpdater from './TokenUpdater'

// Gets ReserveToken related token addresses and decimals
const getTokens = (reserveToken: ReserveToken): [string, number][] => {
  const addresses: [string, number][] = [
    [reserveToken.address, reserveToken.decimals],
    [RSR.address, RSR.decimals],
    ...reserveToken.collaterals.map((token): [string, number] => [
      token.address,
      token.decimals,
    ]),
  ]

  if (reserveToken.stToken) {
    addresses.push([
      reserveToken.stToken.address,
      reserveToken.stToken.decimals,
    ])
  }

  return addresses
}

const getTokenAllowances = (reserveToken: ReserveToken): [string, string][] => {
  const tokens: [string, string][] = [
    ...reserveToken.collaterals.map((token): [string, string] => [
      token.address,
      reserveToken.isRSV ? RSV_MANAGER : reserveToken.address,
    ]),
  ]

  // RSR -> stRSR allowance
  if (reserveToken.stToken) {
    tokens.push([RSR.address, reserveToken.stToken.address])
  }

  // RSV -> RSV_MANAGER
  if (reserveToken.isRSV) {
    tokens.push([reserveToken.address, RSV_MANAGER])
  }

  return tokens
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
    account
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
    account
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
  const account = useAtomValue(walletAtom)
  const chainId = useAtomValue(chainIdAtom)
  const rToken = useAtomValue(rTokenAtom)
  const setPendingIssuances = useUpdateAtom(pendingIssuancesAtom)
  const setPendingRSR = useUpdateAtom(pendingRSRAtom)
  const facadeContract = useFacadeContract()
  const blockNumber = useBlockNumber()

  // TODO: Use multicall for this
  const fetchPending = useCallback(
    async (account: string, rToken: string, facade: Facade) => {
      try {
        const pendingIssuances = await facade.pendingIssuances(rToken, account)
        const pending = pendingIssuances.map((issuance) => ({
          availableAt: parseInt(formatEther(issuance.availableAt)),
          index: issuance.index,
          amount: parseFloat(formatEther(issuance.amount)),
        }))
        setPendingIssuances(pending)

        const pendingRSR = await facade.pendingUnstakings(rToken, account)
        const pendingRSRSummary = pendingRSR.map((item) => ({
          availableAt: item.availableAt.toNumber(),
          index: item.index,
          amount: parseFloat(formatEther(item.amount)),
        }))
        setPendingRSR(pendingRSRSummary)
      } catch (e) {
        // TODO: handle error case
        console.log('error fetching pending', e)
      }
    },
    []
  )

  useEffect(() => {
    if (rToken && !rToken.isRSV && facadeContract && blockNumber && account) {
      fetchPending(account, rToken.address, facadeContract)
    } else {
      setPendingIssuances([])
      setPendingRSR([])
    }
  }, [rToken?.address, facadeContract, account, blockNumber, chainId])

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
  const rToken = useRToken()
  const { provider, chainId } = useWeb3React()
  const { data } = useSWR(
    `${COINGECKO_API}/simple/price?vs_currencies=usd&ids=ethereum,reserve-rights-token`,
    fetcher
  )
  const rTokenPrice = useRTokenPrice(rToken?.address ?? '', !rToken?.isRSV)
  const setRSRPrice = useUpdateAtom(rsrPriceAtom)
  const setEthPrice = useUpdateAtom(ethPriceAtom)
  const setGasPrice = useUpdateAtom(gasPriceAtom)
  const setRTokenPrice = useUpdateAtom(rTokenPriceAtom)
  const blockNumber = useBlockNumber()

  const fetchGasPrice = useCallback(async (provider: Web3Provider) => {
    try {
      const feeData = await provider.getFeeData()

      if (feeData.maxFeePerGas) {
        setGasPrice(Number(formatEther(feeData.maxFeePerGas?.toString())) * 0.6)
      } else {
        setGasPrice(0)
      }
    } catch (e) {
      console.error('Error fetching gas price', e)
    }
  }, [])

  useEffect(() => {
    if (chainId && blockNumber && provider) {
      fetchGasPrice(provider)
    }
  }, [chainId, blockNumber])

  useEffect(() => {
    if (data) {
      setRSRPrice(data['reserve-rights-token']?.usd ?? 0)
      setEthPrice(data?.ethereum?.usd ?? 0)
    }
  }, [data])

  useEffect(() => {
    setRTokenPrice(rTokenPrice)
  }, [rTokenPrice])

  return null
}

// TODO: Change place
const ExchangeRateUpdater = () => {
  const rToken = useAtomValue(rTokenAtom)
  const setRate = useUpdateAtom(rsrExchangeRateAtom)
  const { value } =
    useContractCall(rToken?.stToken?.address && {
        abi: StRSRInterface,
        address: rToken?.stToken?.address ?? '',
        method: 'exchangeRate',
        args: [],
      }) ?? {}

  useEffect(() => {
    if (value && value[0]) {
      setRate(Number(formatEther(value[0])))
    }
  }, [value])

  return null
}

/**
 * Updater
 */
const Updater = () => (
  <>
    <TokenUpdater />
    <PendingBalancesUpdater />
    <TokensBalanceUpdater />
    <TokensAllowanceUpdater />
    <PricesUpdater />
    <ExchangeRateUpdater />
    <AccountUpdater />
    <RSVUpdater />
  </>
)

export default Updater
