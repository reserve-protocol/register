import { StringMap } from 'types'
import { Interface } from '@ethersproject/abi'
import ERC20 from './ERC20.json'
import RToken from './RToken.json'
import RSR from './RSR.json'
import ENSResolver from './ens-public-resolver.json'
import ENSRegistrar from './ens-registrar.json'
import Main from './main.json'
import StRSR from './st-rsr.json'
import RSVManager from './rsv-manager.json'
import Facade from './facade.json'
import BasketHandler from './basketHandler.json'

const ERC20Interface = new Interface(ERC20)
export { ERC20, ERC20Interface }

const MainInterface = new Interface(Main)
export { Main, MainInterface }

const FacadeInterface = new Interface(Facade)
export { Facade, FacadeInterface }

const BasketHandlerInterface = new Interface(BasketHandler)
export { BasketHandler, BasketHandlerInterface }

const RTokenInterface = new Interface(RToken)
export { RToken, RTokenInterface }

const RSRInterface = new Interface(RSR)
export { RSR, RSRInterface }

const ENSResolverInterface = new Interface(ENSResolver)
export { ENSResolver, ENSResolverInterface }

const ENSRegistrarInterface = new Interface(ENSRegistrar)
export { ENSRegistrar, ENSRegistrarInterface }

const StRSRInterface = new Interface(StRSR)
export { StRSR, StRSRInterface }

const RSVManagerInterface = new Interface(RSVManager)
export { RSVManager, RSVManagerInterface }

export default <StringMap>{
  erc20: ERC20Interface,
  stRSR: StRSRInterface,
  rToken: RTokenInterface,
  rsv: RSVManagerInterface,
}
