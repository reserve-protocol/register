import AssetRegistry from 'abis/AssetRegistry'
import BackingManager from 'abis/BackingManager'
import BasketHandler from 'abis/BasketHandler'
import Broker from 'abis/Broker'
import Distributor from 'abis/Distributor'
import Furnace from 'abis/Furnace'
import Main from 'abis/Main'
import RevenueTrader from 'abis/RevenueTrader'
import RToken from 'abis/RToken'
import StRSR from 'abis/StRSR'
import { chainIdAtom } from 'state/atoms'
import { atomWithLoadable } from 'utils/atoms/utils'
import { Address } from 'viem'
import { readContracts } from 'wagmi/actions'
import rTokenAtom from './rTokenAtom'
import { wagmiConfig } from 'state/chain'

export type ContractKey =
  | 'token'
  | 'main'
  | 'stRSR'
  | 'backingManager'
  | 'rTokenTrader'
  | 'rsrTrader'
  | 'broker'
  | 'assetRegistry'
  | 'furnace'
  | 'distributor'
  | 'basketHandler'

// TODO: Remove wagmi action move it to an updater for better refetching
const rTokenContractsAtom = atomWithLoadable(async (get) => {
  const rToken = get(rTokenAtom)
  const chainId = get(chainIdAtom)

  if (!rToken?.main || !rToken?.stToken) {
    return null
  }

  const mainCall = { abi: Main, chainId, address: rToken.main as Address }

  const [
    distributor,
    backingManager,
    rTokenTrader,
    rsrTrader,
    furnace,
    broker,
    assetRegistry,
    basketHandler,
    mainVersion,
  ] = await readContracts(wagmiConfig, {
    contracts: [
      { ...mainCall, functionName: 'distributor' },
      { ...mainCall, functionName: 'backingManager' },
      { ...mainCall, functionName: 'rTokenTrader' },
      { ...mainCall, functionName: 'rsrTrader' },
      { ...mainCall, functionName: 'furnace' },
      { ...mainCall, functionName: 'broker' },
      { ...mainCall, functionName: 'assetRegistry' },
      { ...mainCall, functionName: 'basketHandler' },
      { ...mainCall, functionName: 'version' },
    ],
    allowFailure: false,
  })

  const [
    rTokenVersion,
    stRSRVersion,
    distributorVersion,
    backingManagerVersion,
    rTokenTraderVersion,
    rsrTraderVersion,
    furnaceVersion,
    brokerVersion,
    assetRegistryVersion,
    basketHandlerVersion,
  ] = await readContracts(wagmiConfig, {
    contracts: [
      {
        abi: RToken,
        address: rToken.address as Address,
        functionName: 'version',
        chainId,
      },
      {
        abi: StRSR,
        address: rToken.stToken.address as Address,
        functionName: 'version',
        chainId,
      },
      {
        abi: Distributor,
        address: distributor,
        functionName: 'version',
        chainId,
      },
      {
        abi: BackingManager,
        address: backingManager,
        functionName: 'version',
        chainId,
      },
      {
        abi: RevenueTrader,
        address: rTokenTrader,
        functionName: 'version',
        chainId,
      },
      {
        abi: RevenueTrader,
        address: rsrTrader,
        functionName: 'version',
        chainId,
      },
      {
        abi: Furnace,
        address: furnace,
        functionName: 'version',
        chainId,
      },
      {
        abi: Broker,
        address: broker,
        functionName: 'version',
        chainId,
      },
      {
        abi: AssetRegistry,
        address: assetRegistry,
        functionName: 'version',
        chainId,
      },
      {
        abi: BasketHandler,
        address: basketHandler,
        functionName: 'version',
        chainId,
      },
    ],
    allowFailure: false,
  })

  return {
    token: { address: rToken.address as Address, version: rTokenVersion },
    main: { address: rToken.main as Address, version: mainVersion },
    stRSR: {
      address: rToken.stToken.address as Address,
      version: stRSRVersion,
    },
    backingManager: { address: backingManager, version: backingManagerVersion },
    rTokenTrader: { address: rTokenTrader, version: rTokenTraderVersion },
    rsrTrader: { address: rsrTrader, version: rsrTraderVersion },
    broker: { address: broker, version: brokerVersion },
    assetRegistry: { address: assetRegistry, version: assetRegistryVersion },
    furnace: { address: furnace, version: furnaceVersion },
    distributor: { address: distributor, version: distributorVersion },
    basketHandler: { address: basketHandler, version: basketHandlerVersion },
  }
})

export default rTokenContractsAtom
