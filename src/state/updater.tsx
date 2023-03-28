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
import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect } from 'react'
import {
  allowanceAtom,
  btcPriceAtom,
  chainIdAtom,
  collateralYieldAtom,
  ethPriceAtom,
  eurPriceAtom,
  gasPriceAtom,
  pendingRSRAtom,
  rsrExchangeRateAtom,
  rsrPriceAtom,
  rTokenAtom,
  rTokenPriceAtom,
  walletAtom,
} from 'state/atoms'
import useSWR from 'swr'
import { ReserveToken, StringMap } from 'types'
import {
  EURT_ADDRESS,
  ORACLE_ADDRESS,
  RSR_ADDRESS,
  WBTC_ADDRESS,
  WETH_ADDRESS,
} from 'utils/addresses'
import { ChainId, CHAIN_ID } from 'utils/chains'
import { COINGECKO_API, RSR } from 'utils/constants'
import { RSV_MANAGER } from 'utils/rsv'
import AccountUpdater from './AccountUpdater'
import RSVUpdater from './RSVUpdater'
import RTokenUpdater from './rtoken'
import TokenUpdater from './TokenUpdater'
import { promiseMulticall } from './web3/lib/multicall'

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
 * BTC    -> USD
 * EUR    -> USD
 * RToken -> USD
 * GasPrice
 * TODO: consolidate into `tokenPrice` atom
 */
const PricesUpdater = () => {
  const { provider, chainId } = useWeb3React()
  const rTokenPrice = useRTokenPrice()

  const setRSRPrice = useSetAtom(rsrPriceAtom)
  const setEthPrice = useSetAtom(ethPriceAtom)
  const setBtcPrice = useSetAtom(btcPriceAtom)
  const setEurPrice = useSetAtom(eurPriceAtom)
  const setGasPrice = useSetAtom(gasPriceAtom)
  const setRTokenPrice = useSetAtom(rTokenPriceAtom)
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

  // TODO: Replace sushi oracle with chainlink
  const fetchTokenPrices = useCallback(async () => {
    try {
      const tokenAddresses = [
        RSR_ADDRESS[ChainId.Mainnet],
        WETH_ADDRESS[ChainId.Mainnet],
        WBTC_ADDRESS[ChainId.Mainnet],
        EURT_ADDRESS[ChainId.Mainnet],
      ]

      const joinedAddresses = tokenAddresses.join('%2C')

      const res = await fetch(
        `${COINGECKO_API}/simple/token_price/ethereum?contract_addresses=${joinedAddresses}&vs_currencies=usd`
      ).then((res) => res.json())

      setRSRPrice(res[RSR_ADDRESS[ChainId.Mainnet].toLowerCase()]?.usd)
      setEthPrice(res[WETH_ADDRESS[ChainId.Mainnet].toLowerCase()]?.usd)
      setBtcPrice(res[WBTC_ADDRESS[ChainId.Mainnet].toLowerCase()]?.usd)
      setEurPrice(res[EURT_ADDRESS[ChainId.Mainnet].toLowerCase()]?.usd)
    } catch (e) {
      console.error('Error fetching token prices', e)
    }
  }, [])

  useEffect(() => {
    if (chainId && blockNumber && provider) {
      fetchGasPrice(provider)

      // Only fetch token prices in ethereum
      if (chainId === 1) {
        fetchTokenPrices()
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
}

const CollateralYieldUpdater = () => {
  const setCollateralYield = useSetAtom(collateralYieldAtom)
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

      setCollateralYield(poolYield)
    }
  }, [data])

  return null
}

/**
 * Updater
 */
const Updater = () => (
  <>
    <TokenUpdater />
    <PendingBalancesUpdater />
    <TokensAllowanceUpdater />
    <PricesUpdater />
    <ExchangeRateUpdater />
    <AccountUpdater />
    <RSVUpdater />
    <RTokenUpdater />
    <CollateralYieldUpdater />
  </>
)

export default Updater
