import { Interface } from '@ethersproject/abi'
import ERC20 from './ERC20.json'
import RToken from './RToken.json'
import RSR from './RSR.json'
import ENSResolver from './ens-public-resolver.json'
import ENSRegistrar from './ens-registrar.json'
import Factory from './factory.json'
import ERC20Mock from './ERC20Mock.json'

const ERC20Interface = new Interface(ERC20)
export { ERC20, ERC20Interface }

const ERC20MockInterface = new Interface(ERC20)
export { ERC20Mock, ERC20MockInterface }

const FactoryInterface = new Interface(Factory)
export { Factory, FactoryInterface }

const RTokenInterface = new Interface(RToken)
export { RToken, RTokenInterface }

const RSRInterface = new Interface(RSR)
export { RSR, RSRInterface }

const ENSResolverInterface = new Interface(ENSResolver)
export { ENSResolver, ENSResolverInterface }

const ENSRegistrarInterface = new Interface(ENSRegistrar)
export { ENSRegistrar, ENSRegistrarInterface }
