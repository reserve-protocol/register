import { useState, useEffect } from 'react'
import { useAtomValue } from 'jotai'
import AssetAbi from 'abis/AssetAbi'
import { getContract } from 'wagmi/actions'
import { chainIdAtom } from 'state/atoms'
import { registerAssetsProposedAtom } from '../atoms'
import { Address } from 'viem'

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
      const contract = getContract({
        address: asset as Address,
        abi: AssetAbi,
        chainId: chainId,
      })

      try {
        const erc20 = await contract.read.erc20()
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
