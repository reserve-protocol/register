import { chainIdAtom } from '@/state/atoms'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { Abi, Address } from 'viem'
import { dtfAbiMapppingAtom, explorerContractAliasAtom } from './atoms'

const API_KEY = import.meta.env.VITE_ETHERSCAN_API_KEY

const fetchContractMetadata = async (
  contractAddress: string,
  chainId: number
): Promise<{ abi: Abi; contractName: string } | null> => {
  if (!API_KEY) {
    console.warn('Missing Etherscan API key')
    return null
  }

  const url = `https://api.etherscan.io/v2/api?chainid=${chainId}&module=contract&action=getsourcecode&address=${contractAddress}&apikey=${API_KEY}`

  try {
    const response = await fetch(url)
    const data = await response.json()

    if (data.status !== '1') {
      console.warn(`Failed to fetch ABI: ${data.message}`)
      return null
    }
    const abi = data.result?.[0]?.ABI
    const contractName = data.result?.[0]?.ContractName

    if (!abi || !contractName) {
      console.warn(`Failed to fetch ABI: ${data.message}`)
      return null
    }

    const parsedAbi = JSON.parse(abi)
    console.log({ parsedAbi, contractName })
    console.log(`✅ ABI fetched for ${contractAddress} on ${chainId}`)
    return { abi: parsedAbi, contractName }
  } catch (error) {
    console.error('Error fetching ABI from Etherscan v2:', error)
    return null
  }
}

const useGetAbi = (targets: Address[] | undefined): Record<Address, Abi> => {
  const chainId = useAtomValue(chainIdAtom)
  const dtfAbiMapping = useAtomValue(dtfAbiMapppingAtom)
  const [explorerAbis, setExplorerAbis] = useState<Record<Address, Abi>>({})
  const setExplorerContractAlias = useSetAtom(explorerContractAliasAtom)

  useEffect(() => {
    if (!targets || !dtfAbiMapping || !chainId) return

    const fetchMissingAbis = async () => {
      const missingAbis: Record<Address, Abi> = {}

      for (const target of targets) {
        const targetLower = target.toLowerCase() as Address
        if (!dtfAbiMapping[targetLower] && !explorerAbis[targetLower]) {
          const contractMetadata = await fetchContractMetadata(target, chainId)
          if (contractMetadata) {
            missingAbis[targetLower] = contractMetadata.abi
            setExplorerContractAlias((prev) => ({
              ...prev,
              [targetLower]: contractMetadata.contractName,
            }))
          }
        }
      }

      if (Object.keys(missingAbis).length > 0) {
        setExplorerAbis((prev) => ({ ...prev, ...missingAbis }))
      }
    }

    fetchMissingAbis()
  }, [targets, dtfAbiMapping, explorerAbis, chainId, setExplorerContractAlias])

  if (!targets) return {}

  const result: Record<Address, Abi> = {}

  for (const target of targets) {
    const targetLower = target.toLowerCase() as Address
    const abi = dtfAbiMapping?.[targetLower] || explorerAbis[targetLower]
    if (abi) {
      result[targetLower] = abi
    }
  }

  return result
}

export default useGetAbi
