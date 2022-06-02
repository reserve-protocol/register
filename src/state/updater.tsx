import { formatEther } from '@ethersproject/units'
import { useWeb3React } from '@web3-react/core'
import { StRSR } from 'abis'
import useBlockNumber from 'hooks/useBlockNumber'
import { useCall } from 'hooks/useCall'
import { useContract, useFacadeContract } from 'hooks/useContract'
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
  rsrExchangeRateAtom,
  rsrPriceAtom,
  rTokenAtom,
  rTokenPriceAtom,
  selectedAccountAtom,
  walletAtom,
} from 'state/atoms'
import useSWR from 'swr'
import { ReserveToken, StringMap } from 'types'
import { COINGECKO_API, RSR } from 'utils/constants'
import { RSV_MANAGER } from 'utils/rsv'
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
  const facadeContract = useFacadeContract()
  const blockNumber = useBlockNumber()

  // TODO: Use multicall for this
  const fetchPending = useCallback(async () => {
    try {
      if (facadeContract && account && rToken) {
        const pendingIssuances = await facadeContract.pendingIssuances(
          rToken.address,
          account
        )
        const pending = pendingIssuances.map((issuance) => ({
          availableAt: parseInt(formatEther(issuance.availableAt)),
          index: issuance.index,
          amount: parseFloat(formatEther(issuance.amount)),
        }))
        setPendingIssuances(pending)

        const pendingRSR = await facadeContract.pendingUnstakings(
          rToken.address,
          account
        )
        const pendingRSRSummary = pendingRSR.map((item) => ({
          availableAt: item.availableAt.toNumber() * 1000,
          index: item.index,
          amount: parseFloat(formatEther(item.amount)),
        }))
        setPendingRSR(pendingRSRSummary)
      }
    } catch (e) {
      // TODO: handle error case
      console.log('error fetching pending', e)
    }
  }, [account, facadeContract, rToken?.address])

  useEffect(() => {
    fetchPending()
  }, [fetchPending, blockNumber])

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
      `${COINGECKO_API}/simple/token_price/ethereum?contract_addresses=${reserveToken.address}&vs_currencies=usd`,
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
      setRSRPrice(data['reserve-rights-token']?.usd ?? 1)
      setEthPrice(data?.ethereum?.usd ?? 1)
    }
  }, [data])

  useEffect(() => {
    if (rTokenPrice && reserveToken) {
      setRTokenPrice(rTokenPrice[reserveToken.address])
    }
  }, [rTokenPrice])

  return null
}

// TODO: Change place
const ExchangeRateUpdater = () => {
  const rToken = useAtomValue(rTokenAtom)
  const contract = useContract(rToken?.stToken?.address, StRSR, false)
  const setRate = useUpdateAtom(rsrExchangeRateAtom)
  const { value } =
    useCall(
      contract && {
        contract,
        method: 'exchangeRate',
        args: [],
      }
    ) ?? {}

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
  </>
)

export default Updater
