import Chainlink from 'abis/Chainlink'
import FacadeRead from 'abis/FacadeRead'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import {
  btcPriceAtom,
  chainIdAtom,
  ethPriceAtom,
  gasFeeAtom,
  rTokenPriceAtom,
  rsrPriceAtom,
  selectedRTokenAtom,
} from 'state/atoms'
import { FACADE_ADDRESS } from 'utils/addresses'
import { ChainId } from 'utils/chains'
import { Address, formatEther, formatUnits } from 'viem'
import { useEstimateFeesPerGas, useReadContract, useReadContracts } from 'wagmi'

const CHAINLINK_FEES: Address[] = [
  '0x759bbc1be8f90ee6457c44abc7d443842a976d02', // RSR/USD
  '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419', // ETH/USD
  '0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c', // BTC/USD
]

/**
 * Fetch prices for:
 * ETH    -> USD
 * RSR    -> USD
 * RToken -> USD
 * GasPrice
 */
const PricesUpdater = () => {
  const rToken = useAtomValue(selectedRTokenAtom)
  const chainId = useAtomValue(chainIdAtom)

  const setRSRPrice = useSetAtom(rsrPriceAtom)
  const setEthPrice = useSetAtom(ethPriceAtom)
  const setBTCPrice = useSetAtom(btcPriceAtom)
  const setGasPrice = useSetAtom(gasFeeAtom)
  const setRTokenPrice = useSetAtom(rTokenPriceAtom)

  const { data: gasQuote } = useEstimateFeesPerGas()

  // Price for RSR and ETH pull from chainlink
  const multicallResult = useReadContracts({
    contracts: CHAINLINK_FEES.map((address) => ({
      abi: Chainlink,
      address,
      functionName: 'latestRoundData',
      chainId: ChainId.Mainnet,
    })),
    allowFailure: false,
  })
  const { data: rTokenPrice } = useReadContract({
    abi: FacadeRead,
    address: rToken ? FACADE_ADDRESS[chainId] : undefined,
    functionName: 'price',
    chainId,
    args: [rToken as Address],
    query: { enabled: !!rToken },
  })

  useEffect(() => {
    if (multicallResult?.data) {
      setRSRPrice(+formatUnits((multicallResult?.data as any)[0][1], 8))
      setEthPrice(+formatUnits((multicallResult?.data as any)[1][1], 8))
      setBTCPrice(+formatUnits((multicallResult?.data as any)[2][1], 8))
    }
  }, [multicallResult])

  useEffect(() => {
    if (rTokenPrice) {
      setRTokenPrice(+formatEther((rTokenPrice[0] + rTokenPrice[1]) / 2n))
    } else {
      // default to 1 (RSV case)
      setRTokenPrice(1)
    }
  }, [rTokenPrice])

  useEffect(() => {
    if (gasQuote) {
      setGasPrice(gasQuote.gasPrice ?? 0n)
    }
  }, [gasQuote])

  return null
}

export default PricesUpdater
