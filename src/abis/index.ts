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

const ERC20Interface = new Interface(ERC20)
const FacadeInterface = new Interface(Facade)
const FacadeWriteInterface = new Interface(FacadeWrite)
const RTokenInterface = new Interface(RToken)
const RSRInterface = new Interface(RSR)
const StRSRInterface = new Interface(StRSR)
const RSVManagerInterface = new Interface(RSVManager)
const DeployerInterface = new Interface(Deployer)
const MainInterface = new Interface(Main)

export { ERC20, ERC20Interface }
export { Facade, FacadeInterface }
export { RToken, RTokenInterface }
export { RSR, RSRInterface }
export { StRSR, StRSRInterface }
export { RSVManager, RSVManagerInterface }
export { FacadeWrite, FacadeWriteInterface }
export { Deployer, DeployerInterface }
export { Main, MainInterface }

// Used for tx management
export default <StringMap>{
  erc20: ERC20Interface,
  stRSR: StRSRInterface,
  rToken: RTokenInterface,
  rsv: RSVManagerInterface,
  facade: FacadeInterface,
  facadeWrite: FacadeWriteInterface,
}
