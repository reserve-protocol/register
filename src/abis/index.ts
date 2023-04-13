import { Interface } from '@ethersproject/abi'
import { StringMap } from 'types'
import ERC20 from './ERC20.json'
import Facade from './facade.json'
import RSR from './RSR.json'
import RSVManager from './rsv-manager.json'
import RToken from './RToken.json'
import StRSR from './st-rsr.json'
import FacadeWrite from './facade-write.json'
import Deployer from './deployer.json'
import Main from './main.json'
import Collateral from './collateral.json'
import Oracle from './oracle.json'
import Distributor from './distributor.json'
import BackingManager from './backingManager.json'
import Furnace from './furnace.json'
import RevenueTrader from './revenueTrader.json'
import Broker from './broker.json'
import AssetRegistry from './asset-registry.json'
import Asset from './asset.json'
import Timelock from './timelock.json'
import Governance from './governance.json'
import stRSRVotes from './stRSRVotes.json'
import StaticAToken from './static-atoken.json'
import FacadeAct from './facade-act.json'
import BasketHandler from './basket-handler.json'
import ConvexStakingWrapper from './convex-staking-wrapper.json'

const ERC20Interface = new Interface(ERC20)
const FacadeInterface = new Interface(Facade)
const FacadeWriteInterface = new Interface(FacadeWrite)
const RTokenInterface = new Interface(RToken)
const RSRInterface = new Interface(RSR)
const StRSRInterface = new Interface(StRSR)
const RSVManagerInterface = new Interface(RSVManager)
const DeployerInterface = new Interface(Deployer)
const MainInterface = new Interface(Main)
const CollateralInterface = new Interface(Collateral)
const OracleInterface = new Interface(Oracle)
const DistributorInterface = new Interface(Distributor)
const BackingManagerInterface = new Interface(BackingManager)
const FurnaceInterface = new Interface(Furnace)
const RevenueTraderInterface = new Interface(RevenueTrader)
const BrokerInterface = new Interface(Broker)
const AssetRegistryInterface = new Interface(AssetRegistry)
const AssetInterface = new Interface(Asset)
const TimelockInterface = new Interface(Timelock)
const GovernanceInterface = new Interface(Governance)
const stRSRVotesInterface = new Interface(stRSRVotes)
const StaticATokenInterfcae = new Interface(StaticAToken)
const FacadeActInterface = new Interface(FacadeAct)
const BasketHandlerInterface = new Interface(BasketHandler)
const ConvexStakingWrapperInterface = new Interface(ConvexStakingWrapper)

export { ERC20, ERC20Interface }
export { Facade, FacadeInterface }
export { RToken, RTokenInterface }
export { RSR, RSRInterface }
export { StRSR, StRSRInterface }
export { RSVManager, RSVManagerInterface }
export { FacadeWrite, FacadeWriteInterface }
export { Deployer, DeployerInterface }
export { Main, MainInterface }
export { Collateral, CollateralInterface }
export { Oracle, OracleInterface }
export { Distributor, DistributorInterface }
export { BackingManager, BackingManagerInterface }
export { Furnace, FurnaceInterface }
export { RevenueTrader, RevenueTraderInterface }
export { Broker, BrokerInterface }
export { AssetRegistry, AssetRegistryInterface }
export { Asset, AssetInterface }
export { Timelock, TimelockInterface }
export { Governance, GovernanceInterface }
export { stRSRVotes, stRSRVotesInterface }
export { StaticAToken, StaticATokenInterfcae }
export { FacadeAct, FacadeActInterface }
export { BasketHandler, BasketHandlerInterface }
export { ConvexStakingWrapper, ConvexStakingWrapperInterface }

// Used for tx management
export default <StringMap>{
  erc20: ERC20Interface,
  stRSR: StRSRInterface,
  stRSRVotes: stRSRVotesInterface,
  rToken: RTokenInterface,
  rsv: RSVManagerInterface,
  facade: FacadeInterface,
  facadeWrite: FacadeWriteInterface,
  main: MainInterface,
  governance: GovernanceInterface,
  atoken: StaticATokenInterfcae,
  facadeAct: FacadeActInterface,
  convexStakingWrapper: ConvexStakingWrapperInterface,
}
