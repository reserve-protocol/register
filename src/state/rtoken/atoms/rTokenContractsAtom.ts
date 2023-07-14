import { atomWithLoadable } from 'utils/atoms/utils'
import rTokenAtom from './rTokenAtom'
import { Address, readContracts } from 'wagmi'
import Main from 'abis/Main'
import RToken from 'abis/RToken'
import StRSR from 'abis/StRSR'
import BackingManager from 'abis/BackingManager'
import RevenueTrader from 'abis/RevenueTrader'
import Distributor from 'abis/Distributor'
import AssetRegistry from 'abis/AssetRegistry'
import Broker from 'abis/Broker'
import Furnace from 'abis/Furnace'
import BasketHandler from 'abis/BasketHandler'

export type ContractKey = 'token' | 'main' | 'stRSR' | 'backingManager' | 'rTokenTrader' | 'rsrTrader' | 'broker' | 'assetRegistry' | 'furnace' | 'distributor' | 'basketHandler'

const rTokenContractsAtom = atomWithLoadable(async (get) => {
  const rToken = get(rTokenAtom)

  if (!rToken?.main || !rToken?.stToken) {
    return null
  }

  const mainCall = { abi: Main, address: rToken.main as Address }

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
  ] = await readContracts({
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
  ] = await readContracts({
    contracts: [
      {
        abi: RToken,
        address: rToken.address as Address,
        functionName: 'version',
      },
      {
        abi: StRSR,
        address: rToken.stToken.address as Address,
        functionName: 'version',
      },
      {
        abi: Distributor,
        address: distributor,
        functionName: 'version',
      },
      {
        abi: BackingManager,
        address: backingManager,
        functionName: 'version',
      },
      {
        abi: RevenueTrader,
        address: rTokenTrader,
        functionName: 'version',
      },
      {
        abi: RevenueTrader,
        address: rsrTrader,
        functionName: 'version',
      },
      {
        abi: Furnace,
        address: furnace,
        functionName: 'version',
      },
      {
        abi: Broker,
        address: broker,
        functionName: 'version',
      },
      {
        abi: AssetRegistry,
        address: assetRegistry,
        functionName: 'version',
      },
      {
        abi: BasketHandler,
        address: basketHandler,
        functionName: 'version',
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
