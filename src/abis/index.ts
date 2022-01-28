import { Interface } from '@ethersproject/abi'
import ERC20 from './ERC20.json'
import RToken from './RToken.json'
import RSR from './RSR.json'
import ENSResolver from './ens-public-resolver.json'
import ENSRegistrar from './ens-registrar.json'
import Factory from './factory.json'
import ERC20Mock from './ERC20Mock.json'
import Main from './main.json'
import StRSR from './st-rsr.json'
import RSVManager from './rsv-manager.json'

const ERC20Interface = new Interface(ERC20)
export { ERC20, ERC20Interface }

const ERC20MockInterface = new Interface(ERC20)
export { ERC20Mock, ERC20MockInterface }

const FactoryInterface = new Interface(Factory)
export { Factory, FactoryInterface }

const MainInterface = new Interface(Main as any)
export { Main, MainInterface }

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
