import { Interface } from '@ethersproject/abi'
import ERC20 from './ERC20.json'
import RToken from './RToken.json'
import RSR from './RSR.json'
import ENSResolver from './ens-public-resolver.json'
import ENSRegistrar from './ens-registrar.json'

const ERC20Interface = new Interface(ERC20)
export { ERC20, ERC20Interface }

const RTokenInterface = new Interface(RToken)
export { RToken, RTokenInterface }

const RSRInterface = new Interface(RSR)
export { RSR, RSRInterface }

const ENSResolverInterface = new Interface(ENSResolver)
export { ENSResolver, ENSResolverInterface }

const ENSRegistrarInterface = new Interface(ENSRegistrar)
export { ENSRegistrar, ENSRegistrarInterface }
