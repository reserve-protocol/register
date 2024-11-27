import AssetAbi from 'abis/AssetAbi'
import { useAtomValue } from 'jotai'
import { useEffect, useState } from 'react'
import { chainIdAtom } from 'state/atoms'
import { wagmiConfig } from 'state/chain'
import { Address } from 'viem'
import { readContract } from 'wagmi/actions'
import { registerAssetsProposedAtom } from '../atoms'

export interface RegisterAsset {
  asset: Address
  erc20: Address | undefined
}

const useRegisterAssets = () => {
  const proposedAssetsToRegister = useAtomValue(registerAssetsProposedAtom)
  const chainId = useAtomValue(chainIdAtom)
  const [assetsToRegister, setRegisterAssets] = useState<RegisterAsset[]>([])

  useEffect(() => {
    const fetchERC20Address = async (asset: Address) => {
      try {
        // const erc20 = await contract.read.erc20()
        const erc20 = await readContract(wagmiConfig, {
          address: asset as Address,
          abi: AssetAbi,
          chainId: chainId,
          functionName: 'erc20',
        })
        return { asset, erc20 }
      } catch (e) {
        console.error('Error fetching underlying erc20', e)
        return { asset, erc20: undefined }
      }
    }

    const fetchAllERC20s = async () => {
      const fetchPromises = (proposedAssetsToRegister as Address[]).map(
        fetchERC20Address
      )
      const results = await Promise.all(fetchPromises)
      setRegisterAssets(results)
    }

    if (proposedAssetsToRegister.length > 0) {
      fetchAllERC20s()
    } else {
      setRegisterAssets([])
    }
  }, [proposedAssetsToRegister, chainId])

  return assetsToRegister
}

export default useRegisterAssets
