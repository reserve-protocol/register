import { Web3ReactProvider } from '@web3-react/core'
import connectors from 'components/wallets/connectors'
import { BlockUpdater } from 'hooks/useBlockNumber'
import React from 'react'
import MulticallUpdater from './components/MulticallUpdater'
import TransactionManager from './components/TransactionManager'
import WalletUpdater from './components/WalletUpdater'

/**
 * Wrapper around web3ReactProvider
 * Handles basic logic as well as adds related chain providers
 */
const Web3Provider = ({ children }: { children: React.ReactNode }) => (
  <Web3ReactProvider connectors={connectors}>
    <MulticallUpdater />
    <BlockUpdater />
    <WalletUpdater />
    <TransactionManager />
    {children}
  </Web3ReactProvider>
)

export default Web3Provider
