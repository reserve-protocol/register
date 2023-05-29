import {
  AssetRegistryInterface,
  BackingManagerInterface,
  BasketHandlerInterface,
  BrokerInterface,
  DistributorInterface,
  FurnaceInterface,
  MainInterface,
  RTokenInterface,
  RevenueTraderInterface,
  StRSRInterface,
} from 'abis'
import { promiseMulticall } from 'state/web3/lib/multicall'
import { atomWithLoadable } from 'utils/atoms/utils'
import rTokenAtom from './rTokenAtom'
import { getValidWeb3Atom } from 'state/atoms'
import { ContractCall } from 'types'

const getMainCalls = (address: string, methods: string[]): ContractCall[] =>
  methods.map((method) => ({ abi: MainInterface, address, args: [], method }))

const rTokenContractsAtom = atomWithLoadable(async (get) => {
  const rToken = get(rTokenAtom)
  const { provider } = get(getValidWeb3Atom)

  if (!rToken?.main || !rToken?.stToken || !provider) {
    return null
  }

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
  ]: string[] = await promiseMulticall(
    getMainCalls(rToken.main, [
      'distributor',
      'backingManager',
      'rTokenTrader',
      'rsrTrader',
      'furnace',
      'broker',
      'assetRegistry',
      'basketHandler',
      'version',
    ]),
    provider
  )

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
  ]: string[] = await promiseMulticall(
    [
      {
        abi: RTokenInterface,
        address: rToken.address,
        args: [],
        method: 'version',
      },
      {
        abi: StRSRInterface,
        address: rToken.stToken.address,
        args: [],
        method: 'version',
      },
      {
        abi: DistributorInterface,
        address: distributor,
        args: [],
        method: 'version',
      },
      {
        abi: BackingManagerInterface,
        address: backingManager,
        args: [],
        method: 'version',
      },
      {
        abi: RevenueTraderInterface,
        address: rTokenTrader,
        args: [],
        method: 'version',
      },
      {
        abi: RevenueTraderInterface,
        address: rsrTrader,
        args: [],
        method: 'version',
      },
      {
        abi: FurnaceInterface,
        address: furnace,
        args: [],
        method: 'version',
      },
      {
        abi: BrokerInterface,
        address: broker,
        args: [],
        method: 'version',
      },
      {
        abi: AssetRegistryInterface,
        address: assetRegistry,
        args: [],
        method: 'version',
      },
      {
        abi: BasketHandlerInterface,
        address: basketHandler,
        args: [],
        method: 'version',
      },
    ],
    provider
  )

  return {
    token: { address: rToken.address, version: rTokenVersion },
    main: { address: rToken.main, version: mainVersion },
    stRSR: { address: rToken.stToken.address, version: stRSRVersion },
    backingManager: { address: backingManager, version: backingManagerVersion },
    rTokenTrader: { address: rTokenTrader, version: rTokenTraderVersion },
    rsrTrader: { address: rsrTrader, version: rsrTraderVersion },
    broker: { address: broker, version: brokerVersion },
    assetRegistry: { address: assetRegistry, version: assetRegistryVersion },
    furnace: { address: furnace, version: furnaceVersion },
    distributor: { address: distributor, version: distributorVersion },
    basketHandler: { address: basketHandler, version: basketHandlerVersion },
  } as { [x: string]: { address: string; version: string } }
})

export default rTokenContractsAtom
