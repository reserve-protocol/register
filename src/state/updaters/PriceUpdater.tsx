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
import { AddressMap } from 'types'
import { FACADE_ADDRESS } from 'utils/addresses'
import { ChainId } from 'utils/chains'
import { Address, formatEther, formatUnits } from 'viem'
import { useContractRead, useContractReads, useFeeData } from 'wagmi'

const RSR_CHAINLINK_FEE_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x759bbc1be8f90ee6457c44abc7d443842a976d02',
  [ChainId.Base]: '0xAa98aE504658766Dfe11F31c5D95a0bdcABDe0b1',
}

const ETH_CHAINLINK_FEE_ADDRESS: AddressMap = {
  [ChainId.Mainnet]: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
  [ChainId.Base]: '0x71041dddad3595f9ced3dccfbe3d1f4b0a16bb70',
}

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
        address: RSR_CHAINLINK_FEE_ADDRESS[chainId],
        functionName: 'latestRoundData',
        chainId,
      },
      {
        abi: Chainlink,
        address: ETH_CHAINLINK_FEE_ADDRESS[chainId],
        functionName: 'latestRoundData',
        chainId,
      },
    ],
    allowFailure: false,
  })
  const { data: rTokenPrice } = useContractRead({
    abi: FacadeRead,
    address: rToken ? FACADE_ADDRESS[chainId] : undefined,
    functionName: 'price',
    chainId,
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
