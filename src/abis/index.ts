import { Interface } from '@ethersproject/abi'
import { StringMap } from 'types'
import ENSResolver from './ens-public-resolver.json'
import ENSRegistrar from './ens-registrar.json'
import ERC20 from './ERC20.json'
import Facade from './facade.json'
import RSR from './RSR.json'
import RSVManager from './rsv-manager.json'
import RToken from './RToken.json'
import StRSR from './st-rsr.json'

const ERC20Interface = new Interface(ERC20)
export { ERC20, ERC20Interface }
export { Facade, FacadeInterface }
export { RToken, RTokenInterface }
export { RSR, RSRInterface }
export { ENSResolver, ENSResolverInterface }
export { ENSRegistrar, ENSRegistrarInterface }
export { StRSR, StRSRInterface }
export { RSVManager, RSVManagerInterface }

const FacadeInterface = new Interface(Facade)

const RTokenInterface = new Interface(RToken)

const RSRInterface = new Interface(RSR)

const ENSResolverInterface = new Interface(ENSResolver)

const ENSRegistrarInterface = new Interface(ENSRegistrar)

const StRSRInterface = new Interface(StRSR)

const RSVManagerInterface = new Interface(RSVManager)

export default <StringMap>{
  erc20: ERC20Interface,
  stRSR: StRSRInterface,
  rToken: RTokenInterface,
  rsv: RSVManagerInterface,
}
