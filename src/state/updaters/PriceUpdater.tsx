import Chainlink from 'abis/Chainlink'
import FacadeRead from 'abis/FacadeRead'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import {
  chainIdAtom,
  ethPriceAtom,
  gasFeeAtom,
  rTokenPriceAtom,
  rsrPriceAtom,
  selectedRTokenAtom,
} from 'state/atoms'
import { FACADE_ADDRESS } from 'utils/addresses'
import { Address, formatEther, formatUnits } from 'viem'
import { useContractRead, useContractReads, useFeeData } from 'wagmi'

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
  const setGasPrice = useSetAtom(gasFeeAtom)
  const setRTokenPrice = useSetAtom(rTokenPriceAtom)

  const { data: gasQuote } = useFeeData()

  // Price for RSR and ETH pull from chainlink
  const multicallResult = useContractReads({
    contracts: [
      {
        abi: Chainlink,
        address: '0x759bbc1be8f90ee6457c44abc7d443842a976d02',
        functionName: 'latestRoundData',
      },
      {
        abi: Chainlink,
        address: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
        functionName: 'latestRoundData',
      },
    ],
    allowFailure: false,
  })
  const { data: rTokenPrice } = useContractRead({
    abi: FacadeRead,
    address: rToken ? FACADE_ADDRESS[chainId] : undefined,
    functionName: 'price',
    args: [rToken as Address],
    enabled: !!rToken,
  })

  useEffect(() => {
    if (multicallResult?.data) {
      setRSRPrice(+formatUnits((multicallResult?.data as any)[0][1], 8))
      setEthPrice(+formatUnits((multicallResult?.data as any)[1][1], 8))
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
      setGasPrice(gasQuote.gasPrice)
    }
  }, [gasQuote])

  return null
}

export default PricesUpdater
