import { atomWithLoadable } from 'utils/atoms/utils'
import { getL2Network, EthBridger } from '@arbitrum/sdk'
import { ChainId } from 'utils/chains'
import { atom, useAtomValue } from 'jotai'
import { providers } from 'ethers'
import { useEffect, useMemo, useState } from 'react'
import type { Chain, Client, Transport } from 'viem'
import { Config, useWalletClient } from 'wagmi'
import { publicClient } from 'state/chain'
import { useQuery } from 'react-query'
import {
  bridgeL2Atom,
  isBridgeWrappingAtom,
  selectedBridgeToken,
} from '../atoms'
import { BigNumber } from '@ethersproject/bignumber'
import { Button } from 'components'
import { Box } from 'theme-ui'

export function clientToProvider(client: Client<Transport, Chain>) {
  const { chain, transport } = client
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  }
  if (transport.type === 'fallback')
    return new providers.FallbackProvider(
      (transport.transports as ReturnType<Transport>[]).map(
        ({ value }) => new providers.JsonRpcProvider(value?.url, network)
      )
    )
  return new providers.JsonRpcProvider(transport.url, network)
}

const ethersProvidersAtom = atom(() => {
  return {
    [ChainId.Mainnet]: clientToProvider(
      publicClient({ chainId: ChainId.Mainnet })
    ),
    [ChainId.Arbitrum]: clientToProvider(
      publicClient({ chainId: ChainId.Arbitrum })
    ),
  }
})

export function clientToSigner(client: Client<Transport, Chain, Account>) {
  const { account, chain, transport } = client
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  }
  const provider = new providers.Web3Provider(transport, network)
  const signer = provider.getSigner(account.address)
  return signer
}

export function useEthersSigner({ chainId }: { chainId?: number } = {}) {
  const { data: client } = useWalletClient({ chainId })
  return useMemo(() => (client ? clientToSigner(client) : undefined), [client])
}

const bridgeClientAtom = atomWithLoadable(async () => {
  const network = await getL2Network(ChainId.Arbitrum)

  return new EthBridger(network)
})

const useApproval = () => {
  const isWrapping = useAtomValue(isBridgeWrappingAtom)
  const asset = useAtomValue(selectedBridgeToken)
  const l2Chain = useAtomValue(bridgeL2Atom)
  const providers = useAtomValue(ethersProvidersAtom)
  const client = useAtomValue(bridgeClientAtom)
  // const { isLoading, error, data } = useQuery(
  //   ['l1Gateway', asset.L1contract, client],
  //   () => {
  //     if (!client || !asset.L1contract) return
  //     console.log('hola?', client)
  //     return (client as any).getL1GatewayAddress({
  //       l1Provider: asset.L1contract,
  //       providers: providers[ChainId.Mainnet],
  //     })
  //   }
  // )

  useEffect(() => {}, [])

  return null
}

const ConfirmArbitrumBridge = () => {
  const client = useAtomValue(bridgeClientAtom)
  const test = useApproval()

  console.log('client', client)

  return (
    <Box p={4}>
      <Button fullWidth>Deposit</Button>
    </Box>
  )
}

export default ConfirmArbitrumBridge
