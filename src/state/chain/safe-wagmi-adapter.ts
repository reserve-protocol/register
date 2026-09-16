import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { ErrorUtil, UserRejectedRequestError } from '@reown/appkit-common'
import { connect, switchChain } from '@wagmi/core'
import { UserRejectedRequestError as ViemUserRejectedRequestError } from 'viem'

export class SafeWagmiAdapter extends WagmiAdapter {
  // AppKit 1.8.23 has no hook to suppress only its post-connect fallback switch.
  override async connectWalletConnect(chainId?: number | string) {
    try {
      const walletConnectConnector = this.getWalletConnectConnector()
      await walletConnectConnector.authenticate()
      const connector = this.wagmiConfig.connectors.find(
        (candidate) => candidate.id === 'walletConnect'
      )
      if (!connector) {
        throw new Error('UniversalAdapter:connectWalletConnect - connector not found')
      }

      const result = await connect(this.wagmiConfig, {
        connector,
        chainId: chainId ? Number(chainId) : undefined,
      })
      const session = walletConnectConnector.provider.session
      const isSafe = /^https:\/\/(?:app\.)?safe\.global\/?$/i.test(
        session?.peer?.metadata?.url ?? ''
      )
      const skipPostConnectSwitch =
        isSafe && session?.namespaces?.eip155?.chains === undefined

      if (result.chainId !== Number(chainId) && !skipPostConnectSwitch) {
        await switchChain(this.wagmiConfig, { chainId: result.chainId })
      }
      return {
        clientId: await walletConnectConnector.provider.client.core.crypto.getClientId(),
      }
    } catch (error) {
      if (
        error instanceof ViemUserRejectedRequestError ||
        ErrorUtil.isUserRejectedRequestError(error)
      ) {
        throw new UserRejectedRequestError(error)
      }
      throw error
    }
  }
}
