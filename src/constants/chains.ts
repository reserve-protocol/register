// import { ChainId } from '@usedapp/core'

// TODO: This may need to be moved to a Context component or reducer
// That way there could be a UI element in the dapp that can change the chainId
// Changing the chainId would cause the graphql endpoint to change as well as the loaded tokens
// To keep things simple, the dApp will restrict the supported chains
export const DEFAULT_CHAIN = process.env.REACT_APP_DEFAULT_CHAIN

export const SUPPORTED_CHAINS = new Set([
  // ChainId.Mainnet,
  // ChainId.Ropsten,
  // ChainId.Hardhat,
  DEFAULT_CHAIN,
])
