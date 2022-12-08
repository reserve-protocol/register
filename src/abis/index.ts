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
import Zapper from './zapper.json'

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
const ZapperInterface = new Interface(Zapper)

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
export { Zapper, ZapperInterface }

// Used for tx management
export default <StringMap>{
  erc20: ERC20Interface,
  stRSR: StRSRInterface,
  rToken: RTokenInterface,
  rsv: RSVManagerInterface,
  facade: FacadeInterface,
  facadeWrite: FacadeWriteInterface,
  main: MainInterface,
  zapper: ZapperInterface,
}
