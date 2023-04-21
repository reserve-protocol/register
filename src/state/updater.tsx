import { Web3Provider } from '@ethersproject/providers'
import { formatEther } from '@ethersproject/units'
import { useWeb3React } from '@web3-react/core'
import { OracleInterface, StRSRInterface } from 'abis'
import { Facade } from 'abis/types'
import { formatUnits } from 'ethers/lib/utils'
import useBlockNumber from 'hooks/useBlockNumber'
import { useContractCall } from 'hooks/useCall'
import { useFacadeContract } from 'hooks/useContract'
import useRTokenPrice from 'hooks/useRTokenPrice'
import useTokensAllowance from 'hooks/useTokensAllowance'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect } from 'react'
import {
  allowanceAtom,
  chainIdAtom,
  collateralYieldAtom,
  ethPriceAtom,
  gasPriceAtomBn,
  pendingRSRAtom,
  rsrExchangeRateAtom,
  rsrPriceAtom,
  rTokenAtom,
  rTokenPriceAtom,
  searchParamsAtom,
  walletAtom,
} from 'state/atoms'
import useSWR from 'swr'
import { ReserveToken, StringMap } from 'types'
import { ORACLE_ADDRESS, RSR_ADDRESS, WETH_ADDRESS } from 'utils/addresses'
import { CHAIN_ID } from 'utils/chains'
import { RSR } from 'utils/constants'
import { RSV_MANAGER } from 'utils/rsv'
import AccountUpdater from './AccountUpdater'
import RSVUpdater from './RSVUpdater'
import RTokenUpdater from './rtoken'
import TokenUpdater from './TokenUpdater'
import { promiseMulticall } from './web3/lib/multicall'

import { TokenBalancesUpdater } from './TokenBalancesUpdater'
import { useSearchParams } from 'react-router-dom'

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

/**
 * Fetch pending issuances
 */
const PendingBalancesUpdater = () => {
  const account = useAtomValue(walletAtom)
  const chainId = useAtomValue(chainIdAtom)
  const rToken = useAtomValue(rTokenAtom)
  const setPendingRSR = useSetAtom(pendingRSRAtom)
  const facadeContract = useFacadeContract()
  const blockNumber = useBlockNumber()

  const fetchPending = useCallback(
    async (account: string, rToken: string, facade: Facade) => {
      try {
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
  const { provider, chainId } = useWeb3React()
  const rTokenPrice = useRTokenPrice()
  const setRSRPrice = useSetAtom(rsrPriceAtom)
  const setEthPrice = useSetAtom(ethPriceAtom)
  const setGasPrice = useSetAtom(gasPriceAtomBn)
  const setRTokenPrice = useSetAtom(rTokenPriceAtom)
  const blockNumber = useBlockNumber()

  const fetchGasPrice = useCallback(async (provider: Web3Provider) => {
    try {
      const gasPrice = await provider.getGasPrice()
      setGasPrice(gasPrice)
    } catch (e) {
      console.error('Error fetching gas price', e)
    }
  }, [])

  // TODO: Replace sushi oracle with chainlink
  const fetchTokenPrices = useCallback(async (provider: Web3Provider) => {
    try {
      const callParams = {
        abi: OracleInterface,
        address: ORACLE_ADDRESS[CHAIN_ID],
        method: 'getPriceUsdc',
      }

      const [rsrPrice, wethPrice] = await promiseMulticall(
        [
          { ...callParams, args: [RSR_ADDRESS[CHAIN_ID]] },
          { ...callParams, args: [WETH_ADDRESS[CHAIN_ID]] },
        ],
        provider
      )
      setRSRPrice(+formatUnits(rsrPrice, 6))
      setEthPrice(+formatUnits(wethPrice, 6))
    } catch (e) {
      console.error('Error fetching token prices', e)
    }
  }, [])

  useEffect(() => {
    if (chainId && blockNumber && provider) {
      fetchGasPrice(provider)

      // Only fetch token prices in ethereum
      if (chainId === 1) {
        fetchTokenPrices(provider)
      }
    }
  }, [chainId, blockNumber])

  useEffect(() => {
    setRTokenPrice(rTokenPrice)
  }, [rTokenPrice])

  return null
}

// TODO: Change place
const ExchangeRateUpdater = () => {
  const rToken = useAtomValue(rTokenAtom)
  const setRate = useSetAtom(rsrExchangeRateAtom)
  const { value } =
    useContractCall(
      rToken?.stToken?.address && {
        abi: StRSRInterface,
        address: rToken?.stToken?.address ?? '',
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

// TODO add eusdFRAXBP when live on DefiLlama
const poolsMap: StringMap = {
  '405d8dad-5c99-4c91-90d3-82813ade1ff1': 'sadai',
  'a349fea4-d780-4e16-973e-70ca9b606db2': 'sausdc',
  '60d657c9-5f63-4771-a85b-2cf8d507ec00': 'sausdt',
  '1d53fa29-b918-4d74-9508-8fcf8173ca51': 'sausdp',
  'cc110152-36c2-4e10-9c12-c5b4eb662143': 'cdai',
  'cefa9bb8-c230-459a-a855-3b94e96acd8c': 'cusdc',
  '57647093-2868-4e65-97ab-9cae8ec74e7d': 'cusdt',
  '6c2b7a5c-6c4f-49ea-a08c-0366b772f2c2': 'cusdp',
  '1d876729-4445-4623-8b6b-c5290db5d100': 'cwbtc',
  '1e5da7c6-59bb-49bd-9f97-4f4fceeffad4': 'ceth',
  'fa4d7ee4-0001-4133-9e8d-cf7d5d194a91': 'fusdc',
  'ed227286-abb0-4a34-ada5-39f7ebd81afb': 'fdai',
  '6600934f-6323-447d-8a7d-67fbede8529d': 'fusdt',
  '747c1d2a-c668-4682-b9f9-296708a3dd90': 'wsteth',
  'd4b3c522-6127-4b89-bedf-83641cdcd2eb': 'reth',
  '7da72d09-56ca-4ec5-a45f-59114353e487': 'wcusdcv3',
  '8a20c472-142c-4442-b724-40f2183c073e': 'stkcvxmim-3lp3crv-f',
  'ad3d7253-fb8f-402f-a6f8-821bc0a055cb': 'stkcvxcrv3crypto',
  '7394f1bc-840a-4ff0-9e87-5e0ef932943a': 'stkcvx3crv',
}

const CollateralYieldUpdater = () => {
  const [collateralYield, setCollateralYield] = useAtom(collateralYieldAtom)
  const { data } = useSWR('https://yields.llama.fi/pools', (...args) =>
    fetch(...args).then((res) => res.json())
  )

  useEffect(() => {
    if (data?.data) {
      const poolYield: { [x: string]: number } = {}

      for (const pool of data.data) {
        if (poolsMap[pool.pool]) {
          poolYield[poolsMap[pool.pool]] = pool.apyMean30d || 0
        }
      }

      setCollateralYield({ ...collateralYield, ...poolYield })
    }
  }, [data])

  return null
}

const SearchParamsUpdater = () => {
  const [searchParams] = useSearchParams()
  const setSearchParams = useSetAtom(searchParamsAtom)
  useEffect(() => {
    setSearchParams(searchParams)
  }, [searchParams])
  return null
}
/**
 * Updater
 */
const Updater = () => (
  <>
    <SearchParamsUpdater />
    <TokenUpdater />
    <PendingBalancesUpdater />
    <TokensAllowanceUpdater />
    <PricesUpdater />
    <ExchangeRateUpdater />
    <AccountUpdater />
    <RSVUpdater />
    <RTokenUpdater />
    <CollateralYieldUpdater />
    <TokenBalancesUpdater />
  </>
)

export default Updater
